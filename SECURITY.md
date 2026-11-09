# Security Policy

## Supported Versions

This project is in early development and has no versioned releases or tags. Only the latest code on the `main` branch is supported and receives security fixes.

## Reporting a Vulnerability

Please do not report security issues in public issues, pull requests or discussions.

Report privately using GitHub's private vulnerability reporting:

1. Go to the **Security** tab of this repository.
2. Click **Report a vulnerability**.
3. Describe the issue, how to reproduce it, and its potential impact.

If private reporting is unavailable, contact the maintainers at `josephdeornay@gmail.com`.

Please include:
- The affected file, script, table or workflow
- Steps to reproduce
- What an attacker could read, change or delete (Google Sheet data, the local SQLite file, or the Supabase backup)
- Any suggested fix

We aim to acknowledge reports within 3 business days and to share a status update within 7 days. We will credit reporters in the fix unless they prefer to stay anonymous.

## Scope

In scope:
- The Python scripts in `scripts/` (currently `check_sheets.py`) and any sync code added later, such as `src/dayshell/`
- The Supabase schema in `docs/supabase.sql`, including Row Level Security (RLS) and exposed API access
- The schema and configuration docs in `docs/` (`shema.md`, `configuration.md`, `setup-google.md`) where they give insecure or misleading instructions
- Handling of the Google service account key (`key.json`), the Supabase service role key and other values in `.env`
- Apps Script files, if and when they are added to the repository
- Secrets or credentials accidentally committed to the repository or its history

Out of scope:
- Vulnerabilities in third-party services (Google Sheets and Google Cloud, Supabase, GitHub). Please report those to the vendor.
- Vulnerabilities in dependencies listed in `requirements.txt` that are not made worse by how this project uses them. Please report those upstream.
- Social engineering or physical attacks
- Denial-of-service testing against the maintainers' Google Sheet or hosted Supabase project

Please do not access, modify or delete data in the maintainers' Google Sheet or hosted Supabase project while testing. Reproduce issues with your own test Google Sheet and service account, a local SQLite file, and a separate Supabase project.

## Security Practices for Contributors

- **Never commit secrets.** `.env`, `key.json`, the Supabase service role key and `.clasprc.json` must stay out of Git. Keep them listed in `.gitignore`.
- **Keep local data out of Git.** The SQLite file (`DB_PATH`, for example `dayshell.db`) holds your tasks and goals. Make sure `*.db` is ignored before running a sync, and do not commit database files, logs or backups.
- **Enable RLS on every table in the `public` schema.** Tables created through `docs/supabase.sql` must include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`. Add policies only when a client genuinely needs API access, and keep them minimal. Today the tables have RLS enabled with no policies, so the public (anon) key cannot read or write.
- **Keep the service role key server-side.** `SUPABASE_SERVICE_KEY` bypasses RLS. Use it only in the Python sync running on your own machine. Never put it in the spreadsheet, in Apps Script, in a dashboard or in client-side code.
- **Limit the service account.** Share the Google Sheet only with the service account's email, with the lowest access that works. Do not share the sheet publicly or with "anyone with the link".
- **Do not paste real IDs or keys into docs, issues or logs.** Use placeholders such as `<your spreadsheet ID>`. Scripts must not print key contents.
- **Rotate on exposure.** If a key or password is committed, treat it as compromised and rotate it immediately: delete the Google service account key and create a new one in Google Cloud, or rotate the Supabase keys in Project Settings. Then remove it from the code. Removing it from Git history alone is not enough.
- **Review before merging.** Changes go through pull requests, and any change touching schema, permissions or credentials needs a second reviewer when more than one maintainer is available.

## Disclosure

We follow coordinated disclosure. Once a fix is available, we will note the issue in the repository's security advisories and describe what was affected and how to update.
