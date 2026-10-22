const CFG = {
    Name : 'dayshell',
    TABS : {
        LOG: 'Log',
        GOALS : 'Goals',
        LISTS : 'Lists',
        DAILY : 'Daily',
        STATUS : 'Status',
        GOALS_VIEW : 'Goal view',
        STATS_VIEW: 'Analytics view',
    },
    LOG_HEADERS : [
        'id', 'date', 'goal_id', 'task', 'category', 'status',
        'duration_min', 'notes', 'created_at', 'completed_at'
    ],
    GOAL_HEADERS : [
        'goal_id', 'title', 'period', 'start_date', 'due_date', 'status'
    ],
    GOAL_CALCULATION_HEADERS : [
        'total', 'done', 'progress', 'time', 'tag', 'tasks', 
        'bar', 'end_in'
    ],
    CATEGORIES : [
        'Work', 'Study', 'Health', 'Admin'
    ],
    TASK_STATUSES : ['Backlog', 'Not started', 'In progress', 'Completed'],
    PERIODS : ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    GOAL_STATUSES : ['Active', 'Completed'],

    TOLERANCE : 0.1,
    DAILY_ROWS : 365,
    GOAL_BLOCK_ROWS : 6,
    REMINDER_HOUR : 20, 

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
}