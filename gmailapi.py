import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

def main():
    creds = None

    # If token.json exists, load existing credentials
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)


    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)

 
            creds = flow.run_console()


        with open("token.json", "w") as token_file:
            token_file.write(creds.to_json())

    try:
        service = build("gmail", "v1", credentials=creds)
        results = service.users().messages().list(userId="me").execute()
        messages = results.get("messages", [])
        print(messages)
        return messages
    except HttpError as error:
        print(f"An error occurred: {error}")

if __name__ == "__main__":
    main()
