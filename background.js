

function getAuthTokenAndFetchEmails() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        // Handle error, e.g., user denied access or other issue
        console.error("getAuthToken error:", chrome.runtime.lastError.message);
        return;
      }
  
      if (token) {
        // You have the OAuth token!
      //  console.log("Obtained OAuth Token:", token); // Don't log tokens in production
  
        // Now use this token to call the Gmail API
        fetchGmailMessages(token);
  
      } else {
         console.error("Could not retrieve token.");
      }
    });
  } 

  var messagesToSendToAIAPI  = "First Message: " +"\n\n"; // Initialize an empty string to store messages

  
  async function fetchGmailMessages(authToken) {
    const listUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5'; // Get fewer messages initially for testing

    try {
        // --- First API Call: Get Message IDs ---
        const listResponse = await fetch(listUrl, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!listResponse.ok) {
            console.error(`Gmail API List Error: ${listResponse.status}`, await listResponse.json());
            // Handle token expiration/removal if needed
            return;
        }
        const listData = await listResponse.json();
        const messages = listData.messages || [];
        //console.log("Gmail Message IDs:", messages); // Log the IDs you received

        if (messages.length === 0) {
            console.log("No messages found.");
            return;
        }

        // --- Second API Call (Loop): Get Content for Each Message ID ---
       // console.log("Fetching message content...");
        const detailedMessages = [];
        for (const messageMeta of messages) {
            const messageId = messageMeta.id;
            const getUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;            const getResponse = await fetch(getUrl, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (getResponse.ok) {
              const messageDetail = await getResponse.json();

              let bodyData = null;
              let mimeType = '';
          
              // 1. Try to find 'text/plain' part first
              if (messageDetail.payload) {
                 mimeType = 'text/plain';
                 bodyData = findBodyPart(messageDetail.payload, mimeType);
              }
          
              // 2. If no 'text/plain', try to find 'text/html'
              if (!bodyData && messageDetail.payload) {
                 mimeType = 'text/html';
                 bodyData = findBodyPart(messageDetail.payload, mimeType);
              }
          
              // 3. Fallback for very simple messages (less common)
               if (!bodyData && messageDetail.payload && messageDetail.payload.body && messageDetail.payload.body.data) {
                  bodyData = messageDetail.payload.body.data;
                  mimeType = messageDetail.payload.mimeType;
               }
          
          
              let decodedBody = '';
              if (bodyData) {
                  try {
                      decodedBody = base64UrlDecode(bodyData);
          
                      // If it was HTML, you might want to strip tags here or send HTML to backend
                      if (mimeType === 'text/html') {
                           console.log(`  - ID: ${messageId}, Found HTML body (content length: ${decodedBody.length}). Needs stripping for pure text summary.`);
                           // You could implement basic tag stripping here if needed immediately
                           // decodedBody = decodedBody.replace(/<[^>]*>?/gm, ''); // Very basic stripping
                      } else {
                           console.log(`  - ID: ${messageId}, Found Plain Text body (content length: ${decodedBody.length})`);
                           //console.log(decodedBody); // Log the decoded body for plain text
                      }
          
                       // *** THIS is the full(er) content to send to your backend ***
                       console.log("    Decoded Body Snippet:", decodedBody.substring(0, 200)); // Log first 200 chars
                       // TODO: Send decodedBody to your Python backend for summarization
          
                  } catch (e) {
                       console.error(`  - ID: ${messageId}, Error decoding body: `, e);
                       console.log("    Raw body data that failed:", bodyData.substring(0,100)); // Log raw data on error
                  } 
                   // --- Find the Subject ---
    let subject = 'No Subject'; // Default if not found
    if (messageDetail.payload && messageDetail.payload.headers) {
        // Use .find() to search the headers array
        const subjectHeader = messageDetail.payload.headers.find(
            header => header.name.toLowerCase() === 'subject'
        );
        if (subjectHeader) {
            subject = subjectHeader.value; // Get the value if found
        }
    }
                  
                  messagesToSendToAIAPI += "Subject:  " + "\n\n" + subject + "Body of message:  " + "\n\n" + decodedBody + "\n\n" + "Next Message:" + "\n\n"; // Append to the string
          
              } else {
                  console.log(`  - ID: ${messageId}, Could not find text/plain or text/html body data.`);
                  // Sometimes the main content might be in an attachment or structured differently
              }
          
              // Store or process the detailed message / decoded body as needed
              // detailedMessages.push({ id: messageId, snippet: messageDetail.snippet, body: decodedBody });
          
          } else {
              console.error(`Gmail API Get Error for ID ${messageId}: ${getResponse.status}`, await getResponse.json());
          }
            // Add a small delay if needed to avoid hitting rate limits too quickly
            // await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log("Finished fetching detailed messages:", detailedMessages);
        // Now you have detailedMessages array containing actual content to process/summarize


    } catch (error) {
        console.error("Network error fetching Gmail messages:", error);
    }
    console.log("Messages to send to AI API:", messagesToSendToAIAPI); // Log the messages to be sent 
    var data  = sendToAIAPI(messagesToSendToAIAPI); //  Call the function to send messages to AI API
    var summary =  data.get("response", "")
    document.getElementById("placeholder").innerHTML = summary; // Display the summary in the HTML element with ID "summary"

    
} 

// Helper function to decode base64url string
function base64UrlDecode(input) {
  // Replace non-url compatible chars with base64 standard chars
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  // Pad out with standard base64 required padding characters
  var pad = input.length % 4;
  if (pad) {
      if (pad === 1) {
          throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      input += new Array(5 - pad).join('=');
  }
  return atob(input); // Standard base64 decode
}

// Helper function to find the desired body part (prefer text/plain)
function findBodyPart(payload, mimeType) {
  let result = null;
  if (payload.mimeType === mimeType && payload.body && payload.body.data) {
      return payload.body.data;
  }

  if (payload.parts) {
      for (const part of payload.parts) {
          result = findBodyPart(part, mimeType); // Recursive call
          if (result) {
              return result; // Found it in a sub-part
          }
      }
  }
  return null; // Not found
}

  
  // Trigger the process (e.g., when the extension starts, or user clicks a button) 
 getAuthTokenAndFetchEmails();

  

function sendToAIAPI(MessagesOfEmail) {
  fetch("http://34.122.217.188:5000/chat", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: MessagesOfEmail })
  })
  .then(response => response.json())
  .then(data => console.log(data.response))
  .catch(error => console.error("Error:", error)); 
}
