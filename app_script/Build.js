function buildAll() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(Session.getScriptTimeZone());
  ss.setRecalculationInterval(SpreadsheetApp.RecalculationInterval.HOUR);

  Object.keys(CFG.TABS).forEach(k => sheet_(ss, CFG.TABS[k]));
  const ours = Object.keys(CFG.TABS).map(k => CFG.TABS[k]);
  ss.getSheets().forEach(s => {
    const isEmpty = s.getLastRow() === 0 && s.getLastColumn() === 0;
    if (ours.indexOf(s.getName()) === -1 && isEmpty && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  buildLists_(ss);
  buildLog_(ss);
  buildGoals_(ss);
  buildDaily_(ss);
  buildStatus_(ss);
  buildGoalsView_(ss);
  buildStatsView_(ss);
  applyTheme();
  orderTabs_(ss);
  SpreadsheetApp.flush();
  ss.toast('Build complete', CFG.NAME, 5);
}

//rebuild formula function 

function rebuildFormulas() {
  const ss = SpreadsheetApp.getActive();
  buildGoals_(ss);
  buildDaily_(ss);
  buildGoalsView_(ss);
  buildStatsView_(ss);
  applyTheme();
  SpreadsheetApp.flush();
  ss.toast('Formulas rebuilt', CFG.NAME, 5);
}

//helper functions

function sheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function headers_(sh, headers, col) {
  sh.getRange(1, col || 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
}

function column_(arr) {
  return arr.map(v => [v]);
}

function put_(range, v) {
  if (typeof v === 'string' && v.charAt(0) === '=') range.setFormula(v);
  else range.setValue(v);
}

function listRule_(range) {
  return SpreadsheetApp.newDataValidation().requireValueInRange(range, true).setAllowInvalid(false).build();
}

function dateRule_() {
  return SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build();
}

function orderTabs_(ss) {
  const T = CFG.TABS;
  [T.LOG, T.GOALS, T.GOALS_VIEW, T.STATS_VIEW, T.DAILY, T.STATUS, T.LISTS].forEach((name, i) => {
    ss.setActiveSheet(ss.getSheetByName(name));
    ss.moveActiveSheet(i + 1);
  });
}

//lists function

function buildLists_(ss) {
  const sh = sheet_(ss, CFG.TABS.LISTS);
  const cols = [
    ['category', CFG.CATEGORIES],
    ['task_status', CFG.TASK_STATUS],
    ['period', CFG.PERIODS],
    ['goal_status', CFG.GOAL_STATUS],
  ];
  cols.forEach(([name, values], i) => {
    const c = i + 1;
    sh.getRange(1, c).setValue(name).setFontWeight('bold');
    sh.getRange(2, c, sh.getMaxRows() - 1, 1).clearContent();
    sh.getRange(2, c, values.length, 1).setValues(column_(values));
  });
  sh.getRange('F1').setValue('tolerance').setFontWeight('bold');
  if (sh.getRange('F2').isBlank()) sh.getRange('F2').setValue(CFG.TOLERANCE); // keep your own edit
  ss.getNamedRanges().forEach(n => { if (n.getName() === 'Tolerance') n.remove(); });
  ss.setNamedRange('Tolerance', sh.getRange('F2'));
}

//input log function

function buildLog_(ss) {
  const sh = sheet_(ss, CFG.TABS.LOG);
  const lists = ss.getSheetByName(CFG.TABS.LISTS);
  const goals = ss.getSheetByName(CFG.TABS.GOALS);

  headers_(sh, CFG.LOG_HEADERS);
  sh.setFrozenRows(1);

  sh.getRange('B2:B').setDataValidation(dateRule_()).setNumberFormat('yyyy-mm-dd');
  sh.getRange('C2:C').setDataValidation(listRule_(goals.getRange('A2:A')));
  sh.getRange('E2:E').setDataValidation(listRule_(lists.getRange('A2:A')));
  sh.getRange('F2:F').setDataValidation(listRule_(lists.getRange('B2:B')));
  sh.getRange('G2:G').setDataValidation(
    SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0).setAllowInvalid(false).build());
  sh.getRange('I2:J').setNumberFormat('yyyy-mm-dd hh:mm:ss');

  sh.getProtections(SpreadsheetApp.ProtectionType.RANGE)
    .filter(p => p.getDescription() === 'dayshell auto')
    .forEach(p => p.remove());
  sh.getRange('I2:J').protect().setDescription('dayshell auto').setWarningOnly(true);
}

//goal function

function buildGoals_(ss) {
  const sh = sheet_(ss, CFG.TABS.GOALS);
  const lists = ss.getSheetByName(CFG.TABS.LISTS);

  headers_(sh, CFG.GOAL_HEADERS, 1);
  headers_(sh, CFG.GOAL_CALC_HEADERS, 8);
  sh.getRange('H1:O1').setFontColor('#80868b').setFontStyle('italic');
  sh.setFrozenRows(1);

  sh.getRange('C2:C').setDataValidation(listRule_(lists.getRange('C2:C')));
  sh.getRange('F2:F').setDataValidation(listRule_(lists.getRange('D2:D')));
  sh.getRange('D2:E').setDataValidation(dateRule_()).setNumberFormat('yyyy-mm-dd');

  sh.getRange('H2:O2').setFormulas([[
    // H total
    '=ARRAYFORMULA(IF(A2:A="","",COUNTIF(Log!C2:C,A2:A)))',
    // I done
    '=ARRAYFORMULA(IF(A2:A="","",COUNTIFS(Log!C2:C,A2:A,Log!F2:F,"done")))',
    // J progress
    '=ARRAYFORMULA(IF(A2:A="","",IF(H2:H=0,0,I2:I/H2:H)))',
    // K time elapsed (0 to 1)
    '=ARRAYFORMULA(IF(A2:A="","",IF(NOW()<D2:D,0,IF(NOW()>E2:E+1,1,(NOW()-D2:D)/(E2:E+1-D2:D)))))',
    // L tag
    '=ARRAYFORMULA(IF(A2:A="","",IF((H2:H>0)*(J2:J>=1),"DONE",IF(TODAY()>E2:E,"OVERDUE",IF(H2:H=0,"NO TASKS",IF(J2:J>=K2:K-Tolerance,"ON TRACK","BEHIND"))))))',
    // M tasks "done/total"
    '=ARRAYFORMULA(IF(A2:A="","",I2:I&"/"&H2:H))',
    // N bar
    '=ARRAYFORMULA(IF(A2:A="","",REPT("█",ROUND(J2:J*10))&REPT("░",10-ROUND(J2:J*10))))',
    // O ends in
    '=ARRAYFORMULA(IF(A2:A="","",IF(E2:E<TODAY(),"overdue "&(TODAY()-E2:E)&"d",IF(E2:E=TODAY(),"today",(E2:E-TODAY())&"d left"))))',
  ]]);
  sh.getRange('J2:K').setNumberFormat('0%');
}

//daily function

function buildDaily_(ss) {
  const sh = sheet_(ss, CFG.TABS.DAILY);
  const n = CFG.DAILY_ROWS;
  const last = n + 1;

  headers_(sh, ['date', 'done_tasks', 'hours', 'run'], 1);
  sh.getRange('A2').setFormula(`=ARRAYFORMULA(TODAY()-SEQUENCE(${n},1,0,1))`);
  sh.getRange('B2').setFormula(`=ARRAYFORMULA(COUNTIFS(Log!$B$2:$B,A2:A${last},Log!$F$2:$F,"done"))`);
  sh.getRange('C2').setFormula(`=ARRAYFORMULA(SUMIFS(Log!$G$2:$G,Log!$B$2:$B,A2:A${last},Log!$F$2:$F,"done")/60)`);

  //progress bar daily
  const runs = [];
  for (let r = 2; r <= last; r++) {
    runs.push([r < last ? `=IF(B${r}>0,D${r + 1}+1,0)` : `=IF(B${r}>0,1,0)`]);
  }
  sh.getRange(2, 4, n, 1).setFormulas(runs);

  sh.getRange('A2:A').setNumberFormat('yyyy-mm-dd');
  sh.getRange('C2:C').setNumberFormat('0.0');
  sh.setFrozenRows(1);
}

//status function 

function buildStatus_(ss) {
  const sh = sheet_(ss, CFG.TABS.STATUS);
  sh.getRange('A1:A4').setValues([['last_run'], ['rows_synced'], ['backup'], ['errors']]).setFontWeight('bold');
  const defaults = ['never', 0, 'n/a', 0];
  defaults.forEach((v, i) => {
    const cell = sh.getRange(i + 1, 2);
    if (cell.isBlank()) cell.setValue(v); 
  });
}

//Output or Goal View Function 

function buildGoalsView_(ss) {
  const sh = sheet_(ss, CFG.TABS.GOALS_VIEW);
  const hdr = ['goal', 'tasks', 'bar', 'progress', 'time', 'ends in', 'status'];

  [['day', 3], ['week', 12], ['month', 21]].forEach(([period, top]) => {
    sh.getRange(top, 1).setValue(`$ ${CFG.NAME} goals --${period}`);
    sh.getRange(top + 1, 1, 1, 7).setValues([hdr]);
    sh.getRange(top + 2, 1).setFormula(
      `=IFERROR(ARRAY_CONSTRAIN(CHOOSECOLS(SORT(FILTER(Goals!$A$2:$O,Goals!$C$2:$C="${period}",Goals!$F$2:$F="active"),5,TRUE),2,13,14,10,11,15,12),${CFG.GOAL_BLOCK_ROWS},7),"no active goals")`);
    sh.getRange(top + 2, 4, CFG.GOAL_BLOCK_ROWS, 2).setNumberFormat('0%');
  });

  sh.getRange(30, 1).setFormula(footerFormula_());
}

//Output Function

function buildStatsView_(ss) {
  const sh = sheet_(ss, CFG.TABS.STATS_VIEW);
  sh.getRange('A1').setValue(`$ ${CFG.NAME} stats --week`);

  sh.getRange('J1:J3').setFormulas([
    ['=TODAY()-WEEKDAY(TODAY(),2)+1'],
    ['=SUMIFS(Log!$G$2:$G,Log!$F$2:$F,"done",Log!$B$2:$B,">="&J1,Log!$B$2:$B,"<="&TODAY())/60'],
    ['=SUMIFS(Log!$G$2:$G,Log!$F$2:$F,"done",Log!$B$2:$B,">="&(J1-7),Log!$B$2:$B,"<"&J1)/60'],
  ]);
  sh.getRange('J1').setNumberFormat('yyyy-mm-dd');
  sh.hideColumns(10);

  const cards = [
    [1, 'current streak', '=IF(Daily!B2>0,Daily!D2,Daily!D3)', '0"d"', '="best: "&MAX(Daily!D2:D366)&"d"'],
    [3, 'this week', '=J2', '0.0"h"', '=TEXT(J2-J3,"+0.0;-0.0")&"h vs last week"'],
    [5, 'daily average', '=SUM(Daily!C2:C31)/30', '0.0"h"', 'last 30 days'],
    [7, 'tasks done', '=COUNTIF(Log!F2:F,"done")', '0', 'all time'],
  ];
  cards.forEach(([col, label, value, fmt, sub]) => {
    [3, 4, 5].forEach(r => sh.getRange(r, col, 1, 2).merge());
    sh.getRange(3, col).setValue(label);
    put_(sh.getRange(4, col), value);
    sh.getRange(4, col).setNumberFormat(fmt);
    put_(sh.getRange(5, col), sub);
  });

  // Hours per day, Monday to Sunday of this week.
  sh.getRange('A7').setValue('hours per day');
  for (let i = 0; i < 7; i++) {
    const r = 8 + i;
    sh.getRange(r, 1, 1, 2).setFormulas([[
      `=TEXT($J$1+ROWS($A$8:A${r})-1,"ddd")`,
      `=SUMIFS(Log!$G$2:$G,Log!$F$2:$F,"done",Log!$B$2:$B,$J$1+ROWS($A$8:A${r})-1)/60`,
    ]]);
  }
  sh.getRange('B8:B14').setNumberFormat('0.0');

  const C = CFG.COLORS;
  sh.getCharts().forEach(ch => sh.removeChart(ch));
  sh.insertChart(
    sh.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(sh.getRange('A8:B14'))
      .setPosition(7, 3, 0, 0)
      .setOption('width', 440)
      .setOption('height', 170)
      .setOption('colors', [C.green])
      .setOption('backgroundColor', C.bg)
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { textStyle: { color: C.gray } })
      .setOption('vAxis', { textStyle: { color: C.gray }, gridlines: { color: C.bg }, minValue: 0 })
      .build());

  // Hours per category this week, with block bars.
  sh.getRange(17, 1, 24, 8).clearContent();
  sh.getRange('A17').setValue('by category');
  const n = CFG.CATEGORIES.length;
  const lastCat = 17 + n;
  for (let i = 0; i < n; i++) {
    const r = 18 + i;
    const max = `MAX($B$18:$B$${lastCat})`;
    sh.getRange(r, 1, 1, 3).setFormulas([[
      `=Lists!A${i + 2}`,
      `=SUMIFS(Log!$G$2:$G,Log!$F$2:$F,"done",Log!$E$2:$E,A${r},Log!$B$2:$B,">="&$J$1)/60`,
      `=IF(${max}=0,REPT("░",10),REPT("█",ROUND(B${r}/${max}*10))&REPT("░",10-ROUND(B${r}/${max}*10)))`,
    ]]);
  }
  sh.getRange(18, 2, n, 1).setNumberFormat('0.0"h"');

  sh.getRange(statsFooterRow_(), 1).setFormula(footerFormula_());
}

function statsFooterRow_() {
  return 19 + CFG.CATEGORIES.length;
}

function footerFormula_() {
  return '="● sync "&Status!B1&" · "&Status!B2&" rows · backup "&Status!B3';
}