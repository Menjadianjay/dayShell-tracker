# Configuration

Settings live in `.env` in the repo root. Create it by hand using the table below.
`.env` is ignored by Git, so it is never committed and there is no template file.
This table is the checklist for setting up a new machine.

| Variable | Needed from | Example | Meaning |
|---|---|---|---|
| `GOOGLE_KEY_PATH` | M0 | `key.json` | Path to the service account key |
| `SHEET_ID` | M0 | `1AbC...xyz` | Spreadsheet ID from the sheet URL |
| `DB_PATH` | M2 | `dayshell.db` | SQLite file |
| `SUPABASE_URL` | M3 | `https://xxxx.supabase.co` | Project URL (Project Settings > API) |
| `SUPABASE_SERVICE_KEY` | M3 | | Service role key. Keep it secret |

Relative paths are resolved from the repo root, not from the folder you run a command in.

## Install the package

    pip install -e .

This makes `dayshell` importable from anywhere in the venv, so `python -m dayshell run` works.

## Rules

- Never commit `.env`, `key.json`, or the Supabase service role key.
- Never put the service role key in the spreadsheet or in Apps Script.
- When you add a setting, add it to the table above in the same commit.
- Stage files by name (`git add <files>`), not with `git add .`.

## Rebuilding .env on a new machine

1. Create `.env` and add the variables from the table.
2. Copy `key.json` from your secure backup, or create a new key (see `docs/setup-google.md`).
3. Copy the Supabase values from the dashboard.

## Troubleshooting

| Error | Fix |
|---|---|
| "Missing in .env: SHEET_ID" | Add the variable to `.env` |
| `ModuleNotFoundError: dayshell` | Run `pip install -e .` with the venv active |
| Key file not found | Check `GOOGLE_KEY_PATH`, or put `key.json` in the repo root |