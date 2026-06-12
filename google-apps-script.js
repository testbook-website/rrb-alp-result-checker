/**
 * Google Apps Script for RRB ALP Result Checker
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1ijcbFFjaNC5_wZ7u8Ehgujup9p3WP1h1_KWGLHr7KaU/edit
 * 2. Click on "Extensions" -> "Apps Script".
 * 3. Delete any code in the editor and paste this code.
 * 4. Click the Save icon (floppy disk).
 * 5. Click "Deploy" -> "New deployment".
 * 6. Select type "Web app".
 * 7. Change "Who has access" to "Anyone" (this is critical for the widget to access it).
 * 8. Click "Deploy", authorize permissions if prompted.
 * 9. Copy the "Web app URL" and put it into your widget configuration.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the JSON string sent in the body
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Mobile Number", "Zone", "Roll Number", "Qualification Status"]);
      
      // Style headers to make them look professional
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackgroundColor("#f3f4f6");
    }
    
    var timestamp = new Date();
    var name = data.name || "N/A";
    var mobile = data.mobile || "N/A";
    var zone = data.zone || "N/A";
    var roll = data.roll || "N/A";
    var status = data.status || "N/A";
    
    // Append the candidate submission row
    sheet.appendRow([timestamp, name, mobile, zone, roll, status]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Submission logged successfully"
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("RRB ALP Result Checker Apps Script Web App is active. Send POST requests to record data.")
    .setMimeType(ContentService.MimeType.TEXT);
}
