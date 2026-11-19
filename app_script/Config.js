/**
 * dayshell: central settings.
 * Change values here, run `clasp push`, then use the dayshell menu in Sheets.
 *
 * Other files only read CFG inside functions, so file load order does not matter.
 * Tab names are also written inside formulas (Build.js). If you rename a tab,
 * search Build.js for the old name.
 */
const CFG = {
  NAME: 'dayshell',

  TABS: {
    LOG: 'Log',
    GOALS: 'Goals',
    LISTS: 'Lists',
    DAILY: 'Daily',
    STATUS: 'Status',
    GOALS_VIEW: 'Goals View',
    STATS_VIEW: 'Analytics View',
  },

  // Input columns. Python reads exactly these (Log A:J, Goals A:F).
  LOG_HEADERS: [
    'id', 'date', 'goal_id', 'task', 'category', 'status',
    'duration_min', 'notes', 'created_at', 'completed_at',
  ],
  GOAL_HEADERS: ['goal_id', 'title', 'period', 'start_date', 'due_date', 'status'],
  // Calculated columns on the Goals tab (H:O). Never type in these.
  GOAL_CALC_HEADERS: ['total', 'done', 'progress', 'time', 'tag', 'tasks', 'bar', 'ends_in'],

  // Dropdown values (written to the Lists tab by Build all).
  CATEGORIES: ['work', 'study', 'health', 'admin'],
  TASK_STATUS: ['todo', 'doing', 'done'],
  PERIODS: ['day', 'week', 'month'],
  GOAL_STATUS: ['active', 'done'],

  TOLERANCE: 0.1,       // initial value only; afterwards edit Lists!F2
  DAILY_ROWS: 365,      // days kept on the Daily tab
  GOAL_BLOCK_ROWS: 6,   // goals shown per period on Goals View
  REMINDER_HOUR: 20,    // daily reminder email, script time zone

  COLORS: {
    bg: '#0d1117',
    card: '#161b22',
    border: '#30363d',
    text: '#c9d1d9',
    green: '#3fb950',
    blue: '#58a6ff',
    amber: '#d29922',
    red: '#f85149',
    gray: '#8b949e',
  },
  FONT: 'Roboto Mono',
};