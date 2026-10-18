create table if not exists goals (
  goal_id    text primary key,
  title      text not null,
  period     text not null,
  start_date date not null,
  due_date   date not null,
  status     text not null
);

create table if not exists tasks (
  id           text primary key,
  date         date not null,
  goal_id      text,
  task         text not null,
  category     text,
  status       text not null,
  duration_min numeric,
  notes        text,
  created_at   timestamp,
  completed_at timestamp,
  deleted_at   timestamp
);

alter table goals enable row level security;
alter table tasks enable row level security;