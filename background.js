// Ensure helper functions (base64UrlDecode, findBodyPart) are defined above or imported

// --- Main Logic Execution ---
document.addEventListener('DOMContentLoaded', () => {
    // Start the process once the popup DOM is loaded
    getAuthTokenAndFetchEmails(); 
});


// --- Authentication and Fetching ---
function getAuthTokenAndFetchEmails() {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        const placeholder = document.getElementById("placeholder");
        if (chrome.runtime.lastError) {
            console.error("getAuthToken error:", chrome.runtime.lastError.message);
            if (placeholder) placeholder.textContent = `Error getting auth token: ${chrome.runtime.lastError.message}`;
            return;
        }
        if (token) {
            if (placeholder) placeholder.textContent = "Fetching emails..."; // Update status
            fetchGmailMessages(token);
        } else {
            console.error("Could not retrieve token.");
             if (placeholder) placeholder.textContent = "Could not retrieve auth token.";
        }
    });
}

// --- Fetching Logic (Ideally belongs in background script) ---
async function fetchGmailMessages(authToken) {
    const listUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5'; 
    let messagesToSendToAIAPI = "First Message: \n\n"; 
    const placeholder = document.getElementById("placeholder");

    try {
        if (placeholder) placeholder.textContent = "Fetching email list...";
        const listResponse = await fetch(listUrl, { /* ... headers ... */ });
        if (!listResponse.ok) throw new Error(`Gmail List Error: ${listResponse.status}`);
        
        const listData = await listResponse.json();
        const messages = listData.messages || [];

        if (messages.length === 0) {
            if (placeholder) placeholder.textContent = "No new messages found.";
            return;
        }
        if (placeholder) placeholder.textContent = `Fetching content for ${messages.length} emails...`;

        // --- Loop to get content ---
        let fetchedCount = 0;
        for (const messageMeta of messages) {
            const messageId = messageMeta.id;
            const getUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
            
            try {
                const getResponse = await fetch(getUrl, { headers: { 'Authorization': `Bearer ${authToken}` } });
                if (!getResponse.ok) {
                     console.warn(`Skipping message ${messageId}: ${getResponse.status}`);
                     continue; // Skip this message on error
                }
                const messageDetail = await getResponse.json();
                
                // --- Extract Subject & Body ---
                let subject = 'No Subject';
                if (messageDetail.payload?.headers) {
                    const subjectHeader = messageDetail.payload.headers.find(h => h.name.toLowerCase() === 'subject');
                    if (subjectHeader) subject = subjectHeader.value;
                }

                let decodedBody = '[Could not retrieve body]';
                let bodyData = findBodyPart(messageDetail.payload, 'text/plain') || findBodyPart(messageDetail.payload, 'text/html');
                 if (!bodyData && messageDetail.payload?.body?.data) { // Fallback
                     bodyData = messageDetail.payload.body.data;
                 }

                if (bodyData) {
                    try {
                        decodedBody = base64UrlDecode(bodyData);
                        // Basic HTML stripping if needed (consider doing this on backend)
                         // if (findBodyPart(messageDetail.payload, 'text/html') && !findBodyPart(messageDetail.payload, 'text/plain')) {
                         //    decodedBody = decodedBody.replace(/<[^>]*>?/gm, ''); 
                         // }
                    } catch (e) { console.error(`Error decoding body for ${messageId}:`, e); }
                }
                
                // Append formatted message for AI
                messagesToSendToAIAPI += `Subject: ${subject}\nBody of message:\n${decodedBody}\n\n--- Next Message ---\n\n`;
                fetchedCount++;
                 if (placeholder) placeholder.textContent = `Fetched ${fetchedCount}/${messages.length} emails...`;

            } catch (fetchError) {
                 console.error(`Error fetching details for message ${messageId}:`, fetchError);
                 // Optionally skip or handle partial failures
            }
        } // End loop

        // --- Send to Backend for Summarization ---
        if (messagesToSendToAIAPI.length > 20) { // Check if we actually added content
            if (placeholder) placeholder.textContent = "Summarizing emails...";
            try {
                const summaryData = await sendToAIAPI(messagesToSendToAIAPI);
                if (summaryData && summaryData.response) {
                    displaySummaries(summaryData.response); // Display using the new function
                } else {
                    throw new Error("Invalid or empty summary response from backend.");
                }
            } catch (apiError) {
                console.error("Error getting summary from backend:", apiError);
                 if (placeholder) placeholder.textContent = `Error getting summary: ${apiError.message}`;
            }
        } else {
             if (placeholder) placeholder.textContent = "No email content found to summarize.";
        }

    } catch (error) {
        console.error("Error in fetchGmailMessages:", error);
        if (placeholder) placeholder.textContent = `Error fetching emails: ${error.message}`;
    }
}

// --- Backend API Call ---
function sendToAIAPI(messagesOfEmail) {
    // Ensure IP/Port is correct and backend is running with CORS enabled
    return fetch("http://34.122.217.188:5000/chat", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messagesOfEmail }) 
    })
    .then(response => {
        if (!response.ok) {
            // Try to get error message from backend response if possible
            return response.text().then(text => { 
                 throw new Error(`HTTP error! status: ${response.status} ${response.statusText} - ${text}`);
            });
        }
        return response.json(); 
    });
    // Note: Removed .catch here to let the caller handle it via await try/catch
}


// --- UI Update Function ---
function displaySummaries(summaryText) {
    const container = document.getElementById("output-container");
    const placeholder = document.getElementById("placeholder");

    if (!container) return; // Exit if container not found

    // Clear the container (remove placeholder/loading message)
    container.innerHTML = ""; 
    if (placeholder) placeholder.style.display = 'none'; // Hide placeholder

    // Split the text by the delimiter specified in your prompt (\)
    // Need to escape the backslash in the string literal
    const summaries = summaryText.split("\\"); 

    if (summaries.length === 0 || (summaries.length === 1 && !summaries[0].trim())) {
         container.innerHTML = `<p class="text-gray-500 text-center">No summaries generated.</p>`;
         return;
    }

    // Create a styled card for each summary part
    summaries.forEach(part => {
        const summary = part.trim(); // trim to remove extra whitespace
        if (summary) { // Only add if there's content after trimming
            const card = document.createElement("div");
            // Apply Tailwind classes for card styling
            card.className = "bg-white p-3 rounded-lg shadow border border-gray-200 text-sm text-gray-800 mb-2"; // Added mb-2 for spacing
            card.textContent = summary; 
            container.appendChild(card);
        }
    });
}


// --- Helper Functions ---
function base64UrlDecode(input) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    var pad = input.length % 4;
    if (pad) {
        if (pad === 1) throw new Error('Invalid base64url length');
        input += new Array(5 - pad).join('=');
    }
    try {
        return atob(input);
    } catch (e) {
        console.error("atob failed:", e);
        return "[Decoding Error]"; // Return placeholder on error
    }
}

function findBodyPart(payload, mimeType) {
    if (!payload) return null;
    if (payload.mimeType === mimeType && payload.body?.data) {
        return payload.body.data;
    }
    if (payload.parts) {
        for (const part of payload.parts) {
            const result = findBodyPart(part, mimeType);
            if (result) return result;
        }
    }
    return null;
}
