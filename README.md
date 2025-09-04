📬 SmartInbox – Gmail Summarizer Chrome Extension

SmartInbox is a Google Chrome Extension that connects to the Gmail API and uses AI to summarize emails directly inside your browser. Instead of reading through long emails, SmartInbox gives you a clear, concise summary so you can focus on what matters most.

🚀 Features

🔑 OAuth with Google – Secure Gmail login using chrome.identity API.

📩 Fetch Emails – Retrieve Gmail messages directly inside the extension.

✨ AI Summarization – Emails are summarized through a Python backend powered by the ChatGPT API.

🖼️ Clean UI – Responsive interface styled with Tailwind CSS.

🧩 Chrome Extension Architecture – Works natively in the browser, packaged with manifest.json.

🛠️ Tech Stack

Frontend: HTML, JavaScript, TailwindCSS

Extension APIs: chrome.identity, Gmail API

Backend: Python (Flask/FastAPI)

AI: OpenAI GPT API

Build Tools: Node.js, npm

📂 Project Structure
SmartInbox/
│── background.js       # Background script
│── manifest.json       # Extension manifest (v3)
│── index.html          # Extension popup
│── popup.js            # Frontend logic
│── tailwind.css        # Styles (built from Tailwind)
│── server.py           # Python backend (AI summarization)
│── gmailapi.py         # Gmail API helper
│── icons/              # Extension icons (16, 48, 128 px)

🔑 Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/yourusername/SmartInbox.git
cd SmartInbox

2️⃣ Install Dependencies

Frontend:

npm install


Backend (Python):

pip install -r requirements.txt

3️⃣ Configure Google OAuth

Go to Google Cloud Console
.

Create a new project.

Enable the Gmail API.

Create OAuth Client ID → choose Chrome App and add your extension ID.

Update manifest.json with the correct client_id.

4️⃣ Load Extension in Chrome

Open chrome://extensions/.

Enable Developer Mode (top right).

Click Load unpacked and select the project folder.

5️⃣ Run Backend
python server.py

🎯 Roadmap

 Add support for multi-email summaries.

 Provide actionable insights from emails (e.g., due dates, tasks).

 Improve UI with advanced filtering and dark mode.

🙌 Acknowledgments

This project was a huge learning experience. Special thanks to my mentor for guidance early on in the project. When he had to step away, I pushed through challenges (OAuth errors, Chrome Extension limitations, CSP issues) and figured out solutions independently.

This project gave me a strong foundation in AI integration, API usage, and extension development — and I look forward to building more advanced AI-driven productivity tools in the future.
