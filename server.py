from flask import Flask, request, jsonify
import json


import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError  
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import main # Assuming main.py contains chatAPICall

app = Flask(__name__)
# --- Enable CORS ---
# Allows requests from any origin. For production, you might restrict
# this to your specific chrome extension ID if possible, but '*' is common.
CORS(app) 
# Or, for more specific control:
# cors = CORS(app, resources={r"/chat": {"origins": "*"}}) 
# --- End CORS Setup ---

@app.route("/", methods=["GET"])
def home():
    """Provides a simple endpoint to check if the server is running."""
    return jsonify({"message": "Flask server for SmartInbox backend is running!"})

@app.route("/chat", methods=["POST"])
def chat():
    """Receives message content and returns an AI-generated summary."""
    data = request.json
    # Check if data is None or not a dictionary
    if not data:
        print("Received empty or invalid data")
        return jsonify({"error": "Invalid JSON data received"}), 400
        
    user_message = data.get("message", "")
    print(f"Received message length: {len(user_message)}") # Log length instead of full message potentially
    if not user_message:
         print("Received empty message content")
         return jsonify({"error": "Empty message content received"}), 400

    try:
        response = main.chatAPICall(user_message)  
        print(response)
        response = json.dumps(response)  # Convert to JSON string if needed
        
        return jsonify({"response": response})
    except Exception as e:
        print(f"Error during chatAPICall or processing: {e}")
        # Return a generic error to the client
        return jsonify({"error": "An internal server error occurred"}), 500


if __name__ == "__main__":
    # Runs on all available interfaces (0.0.0.0) on port 5000
    # debug=True is helpful for development but should be False in production
    app.run(host="0.0.0.0", port=5000, debug=True) 

# import main

# app = Flask(__name__)

# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({"message": "Flask server is running!"})

# @app.route("/chat", methods=["POST"])
# def chat():
#     data = request.json
#     user_message = data.get("message", "")
#     print(f"Received message: {user_message}")
#     # Placeholder response (replace with ChatGPT API later)
#     response = main.chatAPICall(user_message); 
#     print(response)
    
#     return jsonify({"response": response})

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)
    
# SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


# def main():
  
#   creds = None
#   # The file token.json stores the user's access and refresh tokens, and is
#   # created automatically when the authorization flow completes for the first
#   # time.
#   if os.path.exists("token.json"):
#     creds = Credentials.from_authorized_user_file("token.json", SCOPES)
#     creds = flow.run_local_server(port=0) 
#   # If there are no (valid) credentials available, let the user log in.
#   if not creds or not creds.valid:
#     if creds and creds.expired and creds.refresh_token:
#       creds.refresh(Request())
#     else:
#       flow = InstalledAppFlow.from_client_secrets_file(
#           "credentials.json", SCOPES
#       )
#     auth_url, _ = flow.authorization_url(prompt='consent')

#     print(f"Please visit this URL to authorize the application:\n{auth_url}")

#     auth_code = input("Enter the authorization code: ")

#     flow.fetch_token(code=auth_code)
#     creds = flow.credentials
#     # Save the credentials for the next run
#     with open("token.json", "w") as token:
#       token.write(creds.to_json())

#   try:
#     # Call the Gmail API
#     service = build("gmail", "v1", credentials=creds)
#     results = service.users().messages().list(userId="me").execute()
#     messages = results.get("messages", []) 
#     print(messages)
#     return messages
#     # labels = results.get("labels", [])

#     # if not labels:
#     #   print("No labels found.")
#     #   return
#     # print("Labels:")
#     # for label in labels:
#     #   print(label["name"])

#   except HttpError as error:
#     # TODO(developer) - Handle errors from gmail API.
#     print(f"An error occurred: {error}")


if __name__ == "__main__":
  main()
