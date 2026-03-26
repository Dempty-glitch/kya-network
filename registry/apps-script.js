// Google Apps Script — Agent Registry with Hierarchical ID
// Deploy: Web App → Execute as Me → Anyone can access
//
// ID FORMAT:
//   ACN-000              Gen 0 (founder)
//   ACN-000-000          Gen 1 (child)
//   ACN-000-000-001      Gen 2 (grandchild)
//
// Each 3-char segment = base36 (0-9, A-Z), max 46656 children per parent
// Server generates ID → no collision possible

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var parentId = data.parentId || 'ACN';
  
  // Get all existing IDs from column B
  var lastRow = sheet.getLastRow();
  var allIds = [];
  if (lastRow > 1) {
    allIds = sheet.getRange('B2:B' + lastRow).getValues().flat().filter(String);
  }
  
  // Count direct children of this parent
  var childCount = 0;
  for (var i = 0; i < allIds.length; i++) {
    var id = allIds[i];
    if (id.indexOf(parentId + '-') === 0) {
      var remainder = id.slice(parentId.length + 1);
      if (remainder.length === 3) {
        childCount++;
      }
    }
  }
  
  // Generate next 3-char segment (base36, uppercase)
  var segment = childCount.toString(36).toUpperCase().padStart(3, '0');
  var newId = parentId + '-' + segment;
  
  // Collision fallback
  if (allIds.indexOf(newId) >= 0) {
    var rand = Math.random().toString(36).slice(2, 5).toUpperCase();
    newId = parentId + '-' + rand;
  }
  
  // Calculate generation from ID structure
  var generation = newId.split('-').length - 1;
  
  // Append row
  sheet.appendRow([
    new Date().toISOString(),
    newId,
    parentId,
    data.event || 'birth',
    generation,
    data.version || '',
    data.os || '',
    data.notes || ''
  ]);
  
  return ContentService.createTextOutput(
    JSON.stringify({ agentId: newId, status: 'ok', generation: generation })
  ).setMimeType(ContentService.MimeType.JSON);
}
