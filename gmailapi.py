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

    # If credentials are invalid or don't exist, create new ones
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # 1) Make sure credentials.json is for an 'installed' application
            # 2) If you are on a remote VM, run_local_server() might fail. 
            #    Try run_console() or a manual approach if you get browser errors.
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)

            # Option A: run_local_server (requires a browser)
            # Uncomment if you have a browser or X11 forwarding set up:
            # creds = flow.run_local_server(port=0)

            # Option B: Manual approach (no browser needed):
            # auth_url, _ = flow.authorization_url(prompt='consent')
            # print(f"Please visit this URL to authorize the application:\n{auth_url}")
            # auth_code = input("Enter the authorization code: ")
            # flow.fetch_token(code=auth_code)
            # creds = flow.credentials 
            creds = flow.run_console()


        # Save the credentials for the next run
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
