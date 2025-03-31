

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
  
  async function fetchGmailMessages(authToken) {
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10'; // Example API endpoint
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`, // Use the token here
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
         // Handle API errors (e.g., 401 Unauthorized, 403 Forbidden)
         const errorData = await response.json();
         console.error(`Gmail API Error: ${response.status}`, errorData);
         // If error is 401 or 403, might need to remove cached token and retry
         // chrome.identity.removeCachedAuthToken({ token: authToken }, () => {});
         return;
      }
  
      const data = await response.json();
      console.log("Gmail Messages:", data.messages || "No messages found.");
      // Process the messages...
  
    } catch (error) {
      console.error("Network error fetching Gmail messages:", error);
    }
  }
  
  // Trigger the process (e.g., when the extension starts, or user clicks a button) 
  window.onload = getAuthTokenAndFetchEmails;

  

var message = 

fetch("http://34.122.217.188:5000/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: "Hello from Chrome Extension" })
})
.then(response => response.json())
.then(data => console.log(data.response))
.catch(error => console.error("Error:", error));
