CREATE TABLE IF NOT EXISTS goals (
  goal_id    TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  period     TEXT NOT NULL,
  start_date TEXT NOT NULL,
  due_date   TEXT NOT NULL,
  status     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY,
  date         TEXT NOT NULL,
  goal_id      TEXT,
  task         TEXT NOT NULL,
  category     TEXT,
  status       TEXT NOT NULL,
  duration_min REAL,
  notes        TEXT,
  created_at   TEXT,
  completed_at TEXT,
  deleted_at   TEXT
);

CREATE TABLE IF NOT EXISTS sync_log (
  run_at      TEXT,
  rows_synced INTEGER,
  backup_ok   INTEGER,
  error       TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_goal ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);