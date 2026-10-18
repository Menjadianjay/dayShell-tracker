# Google Sheets access

Python reads the dayshell spreadsheet through a Google service account.
The key file `key.json` stays on your machine. It must never be committed.

## One-time setup

1. Create a blank Google Sheet named `dayshell`.
   Copy its ID from the URL: `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`.
2. In https://console.cloud.google.com create a project named `dayshell`.
3. Open APIs & Services > Library and enable **Google Sheets API**.
4. Open IAM & Admin > Service Accounts and create `dayshell-sync`.
   Skip the optional role and access steps.
5. Open the account > Keys > Add key > Create new key > JSON.
   Save the file as `key.json` in the repo root.
6. Open `key.json`, copy the `client_email` value, and share the spreadsheet
   with that address as **Editor**.
7. Confirm Git ignores the key: `git check-ignore -v key.json`.

## Test the connection

From the repo root with the venv active:

    python scripts/check_sheets.py YOUR_SHEET_ID

Expected output: `Opened: dayshell` and a list of tab names.
After #5 you can run it without arguments, because it reads `.env`.

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "Spreadsheet not found" | Wrong ID, or sheet not shared | Check the ID, and share with `client_email` as Editor |
| 403, "API has not been used" | Sheets API is off | Enable Google Sheets API in the Cloud project |
| "Key file not found" | Wrong working directory | Run from the repo root |

## Security rules

- Never commit `key.json` or `.env`.
- If the key leaks, delete it in Google Cloud (Service account > Keys) and create a new one.
- Share the spreadsheet only with the service account and with yourself.