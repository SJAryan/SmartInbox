

function getAuthTokenAndFetchEmails() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
      if (chrome.runtime.lastError) {
        // Handle error, e.g., user denied access or other issue
        console.error("getAuthToken error:", chrome.runtime.lastError.message);
        return;
      }
  
      if (token) {
        // You have the OAuth token!
        console.log("Obtained OAuth Token:", token); // Don't log tokens in production
  
        // Now use this token to call the Gmail API
        fetchGmailMessages(token);
  
      } else {
         console.error("Could not retrieve token.");
      }
    });
  } 

  var messagesToSendToAIAPI  = ""; // Initialize an empty string to store messages

  
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
        console.log("Gmail Message IDs:", messages); // Log the IDs you received

        if (messages.length === 0) {
            console.log("No messages found.");
            return;
        }

        // --- Second API Call (Loop): Get Content for Each Message ID ---
        console.log("Fetching message content...");
        const detailedMessages = [];
        for (const messageMeta of messages) {
            const messageId = messageMeta.id;
            // Request 'metadata' for headers or 'full' for body too
            const getUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata`; // Or format=full

            const getResponse = await fetch(getUrl, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (getResponse.ok) {
                const messageDetail = await getResponse.json();
                detailedMessages.push(messageDetail); // Store the detailed message
                 // Log specific parts: Find subject in headers
                let subject = 'No Subject';
                if (messageDetail.payload && messageDetail.payload.headers) {
                   const subjectHeader = messageDetail.payload.headers.find(h => h.name.toLowerCase() === 'subject');
                   if (subjectHeader) subject = subjectHeader.value;
                }
                console.log(`Snippet: ${messageDetail.snippet}, Subject: ${subject}`);
                messagesToSendToAIAPI += `\n\nMessage ID: ${messageId}\nSubject: ${subject}\nSnippet: ${messageDetail.snippet}`; // Append to the string

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
}
  
  // Trigger the process (e.g., when the extension starts, or user clicks a button) 
 getAuthTokenAndFetchEmails();

  

// var message = 

// fetch("http://34.122.217.188:5000/chat", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ message: "Hello from Chrome Extension" })
// })
// .then(response => response.json())
// .then(data => console.log(data.response))
// .catch(error => console.error("Error:", error));
