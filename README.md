# dayShell-tracker

A local-first daily tracker for tasks and goals. You log tasks in Google Sheets,
Python syncs them to SQLite on a schedule, and a one-way backup goes to Supabase.
Goal progress and analytics are shown on terminal-style dashboard tabs.

**Stack:** Google Sheets + Apps Script · Python (gspread, pandas) · SQLite · Supabase

> **Status: early development.** The repository currently holds the docs, the database
> schemas, and one script, `scripts/check_sheets.py`, which tests the Google Sheets connection.
> The sync package (`src/dayshell/`), the Apps Script files (`apps_script/`), and any
> scheduler are not in the repository yet. This README covers only what you can run today.

## How it works

- **Sheets is the only place you edit data.** Tasks go in the `Log` tab and goals in the `Goals` tab.
- **Python reads `Goals` A to F and `Log` A to J** and upserts them into a local SQLite file. Goal progress columns (`Goals` H to O) are sheet formulas and are not stored in the database.
- **Supabase is a one-way backup.** SQLite and Supabase are copies and are never edited directly.
- **Deletes are soft.** A task removed from the sheet gets `deleted_at` set in SQLite and Supabase. The row is not erased.

## Prerequisites

- Python 3.10 or newer (`requires-python` in `pyproject.toml`)
- A Google Cloud project with the Google Sheets API enabled
- A Supabase project, for the backup step only

## Setup

```bash
git clone https://github.com/Menjadianjay/dayShell-tracker.git &&
cd dayShell-tracker &&
python -m venv .venv &&
source .venv/bin/activate &&
pip install -r requirements.txt
```

On Windows, activate with `.venv\Scripts\activate` instead.

Then create the Google Sheet, the service account, and `key.json` by following
[docs/setup-google.md](docs/setup-google.md), and create a `.env` file (next section).

`docs/configuration.md` also tells you to run `pip install -e .`. That fails today:
`pyproject.toml` points at `src/`, which does not exist yet. Use `requirements.txt`.
It pins every dependency and includes `pytest`; `pyproject.toml` lists four unpinned ones
(`gspread`, `pandas`, `supabase`, `python-dotenv`).

## Configuration

Create `.env` in the repo root by hand. There is no template, and Git ignores the file.
[docs/configuration.md](docs/configuration.md) keeps the same table.

| Variable | Needed from | Example | Meaning |
|---|---|---|---|
| `GOOGLE_KEY_PATH` | M0 | `key.json` | Path to the service account key |
| `SHEET_ID` | M0 | `1AbC...xyz` | Spreadsheet ID from the sheet URL |
| `DB_PATH` | M2 | `dayshell.db` | SQLite file |
| `SUPABASE_URL` | M3 | `https://xxxx.supabase.co` | Project URL (Project Settings > API) |
| `SUPABASE_SERVICE_KEY` | M3 | *(your service role key)* | Service role key. Keep it secret |

`M0`, `M2` and `M3` are milestone labels from `docs/configuration.md`. The repository does not
define them. Relative paths resolve from the repo root. The docs list no default values.

A minimal `.env` for the Sheets check:

```
GOOGLE_KEY_PATH=key.json
SHEET_ID=<your spreadsheet ID>
```

Errors and fixes for missing `.env` values, `ModuleNotFoundError` and a missing key file are in the
troubleshooting table in [docs/configuration.md](docs/configuration.md).

## Check the Google Sheets connection

Run from the repo root with the virtual environment active:

```bash
python scripts/check_sheets.py YOUR_SHEET_ID
```

The optional second argument is the key file path and defaults to `key.json`.
The script resolves that path against your current directory, so running it from another
folder fails with "Key file not found".

On success it prints the spreadsheet title and tab names. This is the format from the code,
not output from a recorded run:

```
Opened: dayshell
Tabs: ['Goals', 'Log', ...]
```

It exits with a message if the key file is missing, the spreadsheet is not found or not
shared with the service account, or the Google API returns an error. Causes and fixes are in
[docs/setup-google.md](docs/setup-google.md).

`docs/setup-google.md` says the script can run without arguments because it reads `.env`.
It does not. The script never loads `.env`, so always pass the sheet ID.

## Data model

[docs/shema.md](docs/shema.md) documents every column, allowed value and rule. The filename is
spelled that way in the repository.

| Table | Source | Key | Notes |
|---|---|---|---|
| `goals` | Sheet tab `Goals`, A to F | `goal_id` (`G-001`, ...) | `period`: `day`, `week`, `month`. `status`: `active`, `done` |
| `tasks` | Sheet tab `Log`, A to J | `id` (UUID) | `status`: `todo`, `doing`, `done`. `goal_id` may be blank |
| `sync_log` | SQLite only | none | Run history. Not backed up |

There are no foreign keys. Python validation is meant to skip bad rows instead of failing a
sync or a restore, but that code is not in the repository yet.

## Supabase backup

1. Open the SQL editor in your Supabase project.
2. Run [docs/supabase.sql](docs/supabase.sql). It creates `goals` and `tasks` and enables Row
   Level Security with no policies, so the public (anon) key cannot read or write.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to `.env`.

## Project structure

```
.
├── docs/
│   ├── configuration.md   # .env variables, rules, troubleshooting
│   ├── setup-google.md    # Service account and Sheets access
│   ├── shema.md           # Data schema for Sheets, SQLite, Supabase
│   └── supabase.sql       # Postgres schema for Supabase
├── scripts/
│   └── check_sheets.py    # Checks Google Sheets access
├── pyproject.toml         # Package "dayshell" 0.1.0
└── requirements.txt       # Pinned dependencies
```

The docs also refer to `src/dayshell/` (sync code and `schema.sql`) and `apps_script/`
(`Config.js`, `Build.js`). Neither is in the repository.

## Testing

There are no tests and no CI workflow. `pytest` is in `requirements.txt`, but there is no
`tests/` directory.

## Contributing

There is no contributing guide. The rules in [docs/configuration.md](docs/configuration.md) are:

- Never commit `.env`, `key.json`, or the Supabase service role key.
- Never put the service role key in the spreadsheet or in Apps Script.
- When you add a setting, add it to the configuration table in the same commit.
- Stage files by name (`git add <files>`), not with `git add .`.

Schema changes touch several files and must follow the order in
[docs/shema.md](docs/shema.md#changing-the-schema-later).

## License

The repository has no LICENSE file, so no license is specified.
