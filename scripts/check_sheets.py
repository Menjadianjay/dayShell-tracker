import sys
import gspread
from dayshell import config


def main():
    try:
        config.require("SHEET_ID")
        gc = gspread.service_account(filename=str(config.GOOGLE_KEY_PATH))
        sh = gc.open_by_key(config.SHEET_ID)
    except RuntimeError as err:
        sys.exit(str(err))
    except FileNotFoundError:
        sys.exit(f"Key file not found: {config.GOOGLE_KEY_PATH}")
    except gspread.exceptions.SpreadsheetNotFound:
        sys.exit("Spreadsheet not found. Check SHEET_ID, and share it with the service account email.")
    except gspread.exceptions.APIError as err:
        sys.exit(f"Google API error: {err}")

    print("Opened:", sh.title)
    print("Tabs:", [ws.title for ws in sh.worksheets()])


if __name__ == "__main__":
    main()