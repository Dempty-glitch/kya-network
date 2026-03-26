// Google Apps Script — doPost webhook for Agent Registry
// Deploy as Web App: Execute as Me, Who has access: Anyone

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date().toISOString(),
    data.agentId || '',
    data.parentId || '',
    data.event || 'birth',
    data.version || '',
    data.os || '',
    data.notes || ''
  ]);
  return ContentService.createTextOutput('OK');
}
