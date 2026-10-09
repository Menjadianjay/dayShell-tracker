import sys
import gspread


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python scripts/check_sheets.py SHEET_ID [KEY_PATH]")
    sheet_id = sys.argv[1]
    key_path = sys.argv[2] if len(sys.argv) > 2 else "key.json"

    try:
        gc = gspread.service_account(filename=key_path)
        sh = gc.open_by_key(sheet_id)
    except FileNotFoundError:
        sys.exit(f"Key file not found: {key_path}. Run this from the repo root.")
    except gspread.exceptions.SpreadsheetNotFound:
        sys.exit("Spreadsheet not found. Check the ID, and share it with the service account email.")
    except gspread.exceptions.APIError as err:
        sys.exit(f"Google API error: {err}")

    print("Opened:", sh.title)
    print("Tabs:", [ws.title for ws in sh.worksheets()])


if __name__ == "__main__":
    main()