/**
 * Code written by saitagrapher. Please use and share responsibly.
 * This is an educational tool and does not constitute as financial advice
 * in any capacity. This script uses the debank.com API, for more information visit their website.
 * To view info about this script, visit:
 * https://github.com/saitagrapher/reflections-tracking/blob/main/README.md
 * 
 * Note: After making changes below, you need to create a trigger. More info in the README^^
 */

/** Adds a new row with the retrieved information (trigger will call this function) */
function addNewRow() {

  // prevent unwanted triggers from messing up the spreadsheet
  cleanupTriggers();

  // Connect to the correct spreadsheet (https://docs.google.com/spreadsheets/d/[this-is-your-spreadsheet-id]/edit#gid=0)
  var spreadsheet = SpreadsheetApp.openById("1HRifcm-7akuDyP4w2jfXUzIF1l5PTAS8GHkjAE1Ugqg"); // replace with your spreadsheet id from the URL
  var sheet = spreadsheet.getSheetByName("Sheet1");

  // Insert a new row and get the current date & time
  sheet.insertRowBefore(2);
  var today = new Date();
  today = today.toISOString();

  // Retrieve the data from debank
  var data = getWalletData("0x12c8ca9643a53e3aeb8e5dfdd38093dc94277345"); // replace this wallet address with your wallet address

  // Grab just the desired token data
  var saitamaData = data["data"].filter(x => x.symbol === "SAITAMA")[0]; // replace SAITAMA with whatever other ETH token you're checking the balance of

  // Clean up some data, do some math and transforming so it's correct
  const balance = saitamaData.balance/1000000000;
  const currentPrice = saitamaData.price;
  const prevPrice = Number(sheet.getRange(3,3).getValue());
  const avgPrice = (prevPrice+currentPrice)/2;
  const reflections = balance - Number(sheet.getRange(3,2).getValue());

  // Insert the data
  sheet.getRange(2,1).setValue(today);
  sheet.getRange(2,2).setValue(balance);
  sheet.getRange(2,3).setValue(currentPrice);
  sheet.getRange(2,4).setValue(reflections);
  sheet.getRange(2,5).setValue(reflections*avgPrice);
  sheet.getRange(2,6).setValue(balance*currentPrice);
  sheet.getRange("B:B").setNumberFormat("#,##0.00");
  sheet.getRange("C:C").setNumberFormat("#,##0.000000000000");
  sheet.getRange("D:D").setNumberFormat("#,##0.00");
  sheet.getRange("E:E").setNumberFormat("$#,##0.00");
  sheet.getRange("F:F").setNumberFormat("$#,##0.00");

    /**
     * Reduces a sequence of names to initials.
     * @param  {String} address  Input wallet address
     * @return {Obj}       debank data for the given wallet address
     */
  function getWalletData(address) {
    var response = UrlFetchApp.fetch(`https://api.debank.com/token/balance_list?user_addr=${address}&is_all=false&chain=eth`);
    var json = response.getContentText();
    var data = JSON.parse(json);
    // console.log(data);
    return data;
  }
}

/**No funny business. Clean up any unwanted triggers */
function cleanupTriggers() {
  // Loop over all triggers.
  const safeTriggers = ["10613978", "10613985"]
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let index = 0; index < allTriggers.length; index++) {
    // If the current trigger is the correct one, delete it.
    if (!safeTriggers.includes(allTriggers[index].getUniqueId())) {
      console.log(`deleting unwanted trigger ${allTriggers[index].getUniqueId()}`);
      ScriptApp.deleteTrigger(allTriggers[index]);
    }
  }
}
