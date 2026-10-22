function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(CFG.NAME)
    .addItem('Build all tabs', 'buildAll')
    .addItem('Rebuild formulas only', 'rebuildFormulas')
    .addItem('Apply theme', 'applyTheme')
    .addSeparator()
    .addItem('Run checks', 'runChecks')
    .addItem('Install daily reminder', 'installTriggers')
    .addItem('Insert sample data (empty sheet only)', 'seedSampleData')
    .addToUi();
}

function addDays_(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function hasData_(sh, col) {
  return sh.getRange(`${col}2:${col}`).getValues().some(row => row[0] !== '');
}

function seedSampleData() {
  const ss = SpreadsheetApp.getActive();
  const ui = SpreadsheetApp.getUi();
  const log = ss.getSheetByName(CFG.TABS.LOG);
  const goals = ss.getSheetByName(CFG.TABS.GOALS);

  if (hasData_(log, 'A') || hasData_(goals, 'A')) {
    ui.alert('Log or Goals already has data. Sample data was not added.');
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const winStart = addDays_(today, -3);   // 7-day window: today is always about 50% through
  const winEnd = addDays_(today, 3);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const goalRows = [
    ['G-001', 'Ship v1', 'week', winStart, winEnd, 'active'],
    ['G-002', 'Study SQL', 'week', winStart, winEnd, 'active'],
    ['G-003', 'Gym 4x', 'week', winStart, winEnd, 'active'],
    ['G-004', 'Old goal', 'week', addDays_(today, -10), addDays_(today, -4), 'active'],
    ['G-005', 'Empty goal', 'month', monthStart, monthEnd, 'active'],
  ];
  goals.getRange(2, 1, goalRows.length, 6).setValues(goalRows);

  // [goal_id, total tasks, done tasks]
  const plan = [['G-001', 8, 5], ['G-002', 6, 1], ['G-003', 4, 4], ['G-004', 4, 2]];
  const rows = [];
  plan.forEach(([gid, total, done]) => {
    for (let i = 0; i < total; i++) {
      const isDone = i < done;
      // spread done tasks over 3 days so the streak can be checked
      const date = gid === 'G-004' ? addDays_(today, -7) : addDays_(today, isDone ? -(i % 3) : 0);
      const finished = new Date(date);
      finished.setHours(12);
      rows.push([
        Utilities.getUuid(), date, gid, `${gid} task ${i + 1}`,
        CFG.CATEGORIES[i % CFG.CATEGORIES.length], isDone ? 'done' : 'todo',
        30 + (i % 4) * 15, '', date, isDone ? finished : '',
      ]);
    }
  });
  log.getRange(2, 1, rows.length, 10).setValues(rows);

  ui.alert('Sample data added. Check Goals View and Analytics View.');
}