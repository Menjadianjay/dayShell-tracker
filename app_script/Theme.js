function applyTheme() {
  const ss = SpreadsheetApp.getActive();
  const C = CFG.COLORS;

  [CFG.TABS.GOALS_VIEW, CFG.TABS.STATS_VIEW].forEach(name => {
    const sh = ss.getSheetByName(name);
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns())
      .setBackground(C.bg).setFontColor(C.text).setFontFamily(CFG.FONT).setFontSize(11);
    sh.setHiddenGridlines(true);
    sh.setTabColor(C.green);
  });

  themeGoalsView_(ss.getSheetByName(CFG.TABS.GOALS_VIEW));
  themeStatsView_(ss.getSheetByName(CFG.TABS.STATS_VIEW));

  // Colour the tag column on the Goals tab too.
  const goals = ss.getSheetByName(CFG.TABS.GOALS);
  goals.setConditionalFormatRules(statusRules_(goals.getRange('L2:L'), null));
}

function themeGoalsView_(sh) {
  const C = CFG.COLORS;
  const border = SpreadsheetApp.BorderStyle.SOLID;

  [3, 12, 21].forEach(r => sh.getRange(r, 1).setFontColor(C.green));
  [4, 13, 22].forEach(r => {
    sh.getRange(r, 1, 1, 7).setFontColor(C.gray)
      .setBorder(null, null, true, null, null, null, C.border, border);
  });
  [[1, 200], [2, 70], [3, 120], [4, 80], [5, 80], [6, 90], [7, 100]]
    .forEach(([col, width]) => sh.setColumnWidth(col, width));

  let rules = [];
  [5, 14, 23].forEach(r => {
    rules = rules.concat(statusRules_(
      sh.getRange(r, 7, CFG.GOAL_BLOCK_ROWS, 1),   // status column
      sh.getRange(r, 3, CFG.GOAL_BLOCK_ROWS, 1))); // bar column follows the status colour
  });

  const footer = sh.getRange(30, 1);
  footer.setFontColor(C.green);
  rules.push(failedRule_(footer));
  sh.setConditionalFormatRules(rules);
}

function themeStatsView_(sh) {
  const C = CFG.COLORS;
  const border = SpreadsheetApp.BorderStyle.SOLID;

  sh.getRange('A1').setFontColor(C.green);
  sh.setColumnWidths(1, 8, 100);

  [1, 3, 5, 7].forEach(col => {
    sh.getRange(3, col, 3, 2).setBackground(C.card)
      .setBorder(true, true, true, true, false, false, C.border, border)
      .setHorizontalAlignment('left');
    sh.getRange(3, col).setFontColor(C.gray).setFontSize(9);
    sh.getRange(4, col).setFontColor(C.blue).setFontSize(22);
    sh.getRange(5, col).setFontColor(C.gray).setFontSize(9);
  });
  sh.setRowHeight(4, 40);

  ['A7', 'A17'].forEach(a => sh.getRange(a).setFontColor(C.gray));
  sh.getRange(18, 3, CFG.CATEGORIES.length, 1).setFontColor(C.green);

  const footer = sh.getRange(statsFooterRow_(), 1);
  footer.setFontColor(C.green);
  sh.setConditionalFormatRules([failedRule_(footer)]);
}

//Colours a status tag
function statusRules_(tagRange, barRange) {
  const C = CFG.COLORS;
  const colors = {
    'DONE': C.green,
    'ON TRACK': C.blue,
    'BEHIND': C.amber,
    'NO TASKS': C.amber,
    'OVERDUE': C.red,
  };
  const rules = [];
  Object.keys(colors).forEach(tag => {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(tag).setFontColor(colors[tag]).setRanges([tagRange]).build());
    if (barRange) {
      const anchor = '$' + tagRange.getCell(1, 1).getA1Notation(); // e.g. $G5
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied(`=${anchor}="${tag}"`).setFontColor(colors[tag]).setRanges([barRange]).build());
    }
  });
  return rules;
}

function failedRule_(range) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains('failed').setFontColor(CFG.COLORS.red).setRanges([range]).build();
}