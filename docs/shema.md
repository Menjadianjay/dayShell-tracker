# dayshell data schema

This file explains every table. The code lives in two separate files:

- `src/dayshell/schema.sql`: SQLite, read by `init_db()`
- `docs/supabase.sql`: Postgres, pasted into the Supabase SQL editor

The Google Sheet headers (`apps_script/Config.js`), SQLite and Supabase must all match this file.

## Rules

- **Sheets is the only place you edit data.** SQLite and Supabase are copies.
- **IDs are text.** Tasks use a UUID from Apps Script. Goals use `G-001`, `G-002`, ...
- **Dates are ISO text** in SQLite: `2026-10-08` and `2026-10-08 14:03:22`.
  They sort correctly, and Postgres accepts the same strings in `date` and `timestamp` columns.
- **Empty cell means NULL.** Python turns `""` into `None` before saving.
- **A task may have no goal.** `goal_id` is blank for standalone tasks.
- **No foreign keys.** Python validation skips bad rows instead of breaking a sync or a restore.
- **Soft delete.** A task removed from the sheet gets `deleted_at` set. It is never erased.
- **Upsert key.** `tasks.id` and `goals.goal_id`.
- **Calculated columns are not stored.** Goals H to O exist only in the sheet.
  Python reads Goals `A:F` and Log `A:J` only.

## Table: goals (Sheet tab `Goals`, columns A to F)

| Column | Sheet col | SQLite | Postgres | Null? | Allowed values / notes |
|---|---|---|---|---|---|
| goal_id | A | TEXT PRIMARY KEY | text primary key | no | `G-001`, `G-002`, ... made by Apps Script |
| title | B | TEXT | text | no | Free text |
| period | C | TEXT | text | no | `day`, `week`, `month` |
| start_date | D | TEXT | date | no | `YYYY-MM-DD` |
| due_date | E | TEXT | date | no | `YYYY-MM-DD`, on or after `start_date` |
| status | F | TEXT | text | no | `active`, `done` |

## Table: tasks (Sheet tab `Log`, columns A to J)

| Column | Sheet col | SQLite | Postgres | Null? | Allowed values / notes |
|---|---|---|---|---|---|
| id | A | TEXT PRIMARY KEY | text primary key | no | UUID made by Apps Script |
| date | B | TEXT | date | no | `YYYY-MM-DD`, the day the task belongs to |
| goal_id | C | TEXT | text | **yes** | Blank, or an existing `goals.goal_id` |
| task | D | TEXT | text | no | Free text |
| category | E | TEXT | text | yes | `work`, `study`, `health`, `admin` |
| status | F | TEXT | text | no | `todo`, `doing`, `done` |
| duration_min | G | REAL | numeric | yes | 0 or more, in minutes |
| notes | H | TEXT | text | yes | Free text |
| created_at | I | TEXT | timestamp | yes | `YYYY-MM-DD HH:MM:SS`, set by Apps Script |
| completed_at | J | TEXT | timestamp | yes | Set only while `status = done` |
| deleted_at | none | TEXT | timestamp | yes | Set by Python when the row disappears from the sheet |

`deleted_at` has no column in the sheet. It exists only in SQLite and Supabase.

## Table: sync_log (SQLite only, not backed up)

| Column | SQLite | Notes |
|---|---|---|
| run_at | TEXT | `YYYY-MM-DD HH:MM:SS` |
| rows_synced | INTEGER | Rows upserted in this run |
| backup_ok | INTEGER | 1 = backup worked, 0 = failed |
| error | TEXT | Error message, or NULL |

## Type mapping

| Meaning | SQLite | Postgres | Example |
|---|---|---|---|
| Text, IDs | TEXT | text | `G-001` |
| Date | TEXT | date | `2026-10-08` |
| Date and time | TEXT | timestamp | `2026-10-08 14:03:22` |
| Number | REAL | numeric | `45` |

## Security

Supabase tables have Row Level Security on with no policies, so the public (anon) key cannot read or write.
Only the service role key, kept in `.env`, can.

## Changing the schema later

Change all of these together, in this order:

1. This file.
2. `Config.js` headers (and the formulas in `Build.js` if a column moves).
3. `src/dayshell/schema.sql`, plus an `ALTER TABLE` for existing data.
4. `docs/supabase.sql`, plus the matching `alter table` in Supabase.