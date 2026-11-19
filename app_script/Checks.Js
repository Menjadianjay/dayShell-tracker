const ERROR_PATTERN_ = /^#(N\/A|REF!|VALUE!|NAME\?|DIV\/0!|NUM!|NULL!|ERROR!)/;

function runChecks() {
  const ss = SpreadsheetApp.getActive();
  const lines = [];
  const check = (ok, text) => lines.push((ok ? 'PASS  ' : 'FAIL  ') + text);

  // 1. tabs
  Object.keys(CFG.TABS).forEach(k => {
    check(!!ss.getSheetByName(CFG.TABS[k]), 'tab exists: ' + CFG.TABS[k]);
  });

  // 2. headers
  checkHeaders_(ss, CFG.TABS.LOG, 1, CFG.LOG_HEADERS, check);
  checkHeaders_(ss, CFG.TABS.GOALS, 1, CFG.GOAL_HEADERS, check);
  checkHeaders_(ss, CFG.TABS.GOALS, 8, CFG.GOAL_CALC_HEADERS, check);

  // 3. named range
  const named = ss.getNamedRanges().filter(n => n.getName() === 'Tolerance');
  check(named.length === 1, 'named range Tolerance exists');

  // 4. formula errors in calculated areas
  [
    [CFG.TABS.GOALS, 'H2:O60'],
    [CFG.TABS.DAILY, 'A2:D366'],
    [CFG.TABS.GOALS_VIEW, 'A1:G30'],
    [CFG.TABS.STATS_VIEW, 'A1:H25'],
  ].forEach(([tab, a1]) => {
    const sh = ss.getSheetByName(tab);
    if (!sh) return;
    const bad = countErrors_(sh.getRange(a1).getDisplayValues());
    check(bad === 0, `no formula errors in ${tab}!${a1}` + (bad ? ` (${bad} found)` : ''));
  });

  // 5. sample data (only if present)
  const goals = ss.getSheetByName(CFG.TABS.GOALS);
  if (goals && goals.getRange('A2').getValue() === 'G-001' && goals.getRange('B2').getValue() === 'Ship v1') {
    lines.push('---- sample data found ----');
    const rows = goals.getRange('A2:L6').getValues();
    const tags = {};
    rows.forEach(r => { tags[r[0]] = r[11]; });
    check(tags['G-003'] === 'DONE', 'G-003 tag is DONE (got ' + tags['G-003'] + ')');
    check(tags['G-004'] === 'OVERDUE', 'G-004 tag is OVERDUE (got ' + tags['G-004'] + ')');
    check(tags['G-005'] === 'NO TASKS', 'G-005 tag is NO TASKS (got ' + tags['G-005'] + ')');
    check(tags['G-002'] === 'BEHIND', 'G-002 tag is BEHIND (got ' + tags['G-002'] + ')');
    check(tags['G-001'] === 'ON TRACK', 'G-001 tag is ON TRACK (got ' + tags['G-001'] + ')');
    const streak = ss.getSheetByName(CFG.TABS.STATS_VIEW).getRange('A4').getValue();
    check(streak === 3, 'current streak is 3 (got ' + streak + ')');
  }

  const failed = lines.filter(l => l.indexOf('FAIL') === 0).length;
  lines.push('');
  lines.push(failed === 0 ? 'All checks passed.' : failed + ' check(s) failed.');
  Logger.log(lines.join('\n'));
  SpreadsheetApp.getUi().alert(CFG.NAME + ' checks', lines.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

function checkHeaders_(ss, tab, firstCol, expected, check) {
  const sh = ss.getSheetByName(tab);
  if (!sh) return;
  const actual = sh.getRange(1, firstCol, 1, expected.length).getValues()[0];
  const ok = expected.every((h, i) => String(actual[i]).trim() === h);
  check(ok, `${tab} headers (col ${firstCol} onward) match Config.js` + (ok ? '' : ': got ' + actual.join(', ')));
}

function countErrors_(grid) {
  let n = 0;
  grid.forEach(row => row.forEach(v => { if (ERROR_PATTERN_.test(String(v))) n++; }));
  return n;
}