function onEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  const name = sh.getName();
  if (name !== CFG.TABS.LOG && name !== CFG.TABS.GOALS) return;

  const first = Math.max(e.range.getRow(), 2); 
  for (let r = first; r <= e.range.getLastRow(); r++) {
    if (name === CFG.TABS.LOG) fixLogRow_(sh, r);
    else fixGoalRow_(sh, r);
  }
}

function fixLogRow_(sh, r) {
  const [id, date, , task, , status, , , created, completed] = sh.getRange(r, 1, 1, 10).getValues()[0];
  if (!task) return; // ignore rows without a task

  if (!id) sh.getRange(r, 1).setValue(Utilities.getUuid());
  if (!date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sh.getRange(r, 2).setValue(today);
  }
  if (!created) sh.getRange(r, 9).setValue(new Date());

  const s = status || 'todo';
  if (!status) sh.getRange(r, 6).setValue('todo');
  if (s === 'done' && !completed) sh.getRange(r, 10).setValue(new Date());
  if (s !== 'done' && completed) sh.getRange(r, 10).clearContent();
}

function fixGoalRow_(sh, r) {
  const [id, title, period, start, due, status] = sh.getRange(r, 1, 1, 6).getValues()[0];
  if (!title) return;

  if (!id) {
    const nums = sh.getRange('A2:A').getValues().flat()
      .map(x => parseInt(String(x).replace('G-', ''), 10) || 0);
    sh.getRange(r, 1).setValue('G-' + String(Math.max(0, ...nums) + 1).padStart(3, '0'));
  }
  if (!status) sh.getRange(r, 6).setValue('active');

  if (period && start instanceof Date && !due) {
    let end = new Date(start); // day goals: due date = start date
    if (period === 'week') end.setDate(start.getDate() + 6);
    if (period === 'month') end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    sh.getRange(r, 5).setValue(end);
  }
}

function sendReminder() {
  const log = SpreadsheetApp.getActive().getSheetByName(CFG.TABS.LOG);
  const tz = Session.getScriptTimeZone();
  const fmt = d => Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  const today = fmt(new Date());
  const logged = log.getRange('B2:B').getValues().flat()
    .filter(d => d instanceof Date).map(fmt);

  if (logged.indexOf(today) === -1) {
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      `${CFG.NAME}: nothing logged today`,
      'Open your tracker: ' + SpreadsheetApp.getActive().getUrl());
  }
}

function installTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'sendReminder')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendReminder').timeBased().everyDays(1).atHour(CFG.REMINDER_HOUR).create();
  SpreadsheetApp.getActive().toast(`Reminder set for about ${CFG.REMINDER_HOUR}:00`, CFG.NAME, 5);
}