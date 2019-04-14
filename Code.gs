function doGet(e) {
  Logger.log(e)
  if (e.parameter.name) handleFunction(e)
}

function doPost(e){
  handleFunction(e)
}

function handleFunction(request){
  var name = request.parameter.name;
  var email = request.parameter.email;
  var msg = request.parameter.msg;
  var lang = request.parameter.lang;
  var sheetName = request.parameter.sn;
  var uid = generateUUID()
  
  var spreadsheetId = "<your-sheet-id>"
  var ss = SpreadsheetApp.openById(spreadsheetId)
  var sheet = ss.getSheetByName(sheetName)

  var shouldTranslate = false
  if (lang !== "en")
    try{
      LanguageApp.translate('Hello', lang, 'en');
      shouldTranslate = true
    }catch(e){
      shouldTranslate = false
    }
 
  
  var translatedMsg = msg

  var txt1 = 'Hello '+name+', thank you for using our App and messaging us.'
  var txt2 = 'Your Message was'
  var txt3 = 'We will handle your request and get back to you as soon as possible.'
  var txt4 = 'Your message has been assigned the following identification code'
  var txt5 = 'Check out other awesome apps, made by us, on Google Play Store - https://play.google.com/store/apps/developer?id=Edge+Dev+Studio'
  var subject = "Contact Us" 
  if (lang !== "en" && shouldTranslate){
     translatedMsg = LanguageApp.translate(msg, '', 'en')
     txt1 = LanguageApp.translate(txt1, 'en', lang)
     txt2 = LanguageApp.translate(txt2, 'en', lang)
     txt3 = LanguageApp.translate(txt3, 'en', lang)
     txt4 = LanguageApp.translate(txt4, 'en', lang)
     txt5 = LanguageApp.translate(txt5, 'en', lang)
     subject = LanguageApp.translate(subject, 'en', lang)
  }
  
  subject += " - "+sheetName
   
  /*
  Hello Tom Cruise, thank you for using our App and messaging us.
  
  Your Message was:
  "How do i unsubscribe from you App??"
  
  We will handle your request and get back to you as soon as possible.
  
  Your message has been assigned the following identification code: 38d2ddcd-94f1-4600-bac4-ddd35d77b2fa
  
  Message in English: 
  How do i unsubscribe from you App??
  
  ****************************************
  Check out other awesome apps, made by us, on Google Play Store - https://play.google.com/store/apps/developer?id=Edge+Dev+Studio
  
  */
  var mailMsg = txt1+"\n\n"+txt2+":\n\""+msg+"\""+"\n\n"+txt3+"\n\n"+txt4+": "+uid+"\n\nMessage In English: \n"+translatedMsg+"\n\n****************************************\n"+txt5;
  
  var isMsgSent = sendMail(email,subject, mailMsg)
  
  var rowContent = sheet.appendRow([uid, Date.now(), name, email, msg, lang, translatedMsg, isMsgSent, '', false]);
  
  GmailApp.createDraft(email, "Re: "+subject, "****************************************\nClear this message!\n\nUser's Original Message:\n"+msg+"\n\nUser's Translated mesage:\n"+translatedMsg+"\n\nUser's Language: "+lang)
}

function sendMail(emailAddress, subject, msg){  
  var regex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  var isMsgSent = false;
  
  if (regex.test(emailAddress))
  try{
    GmailApp.sendEmail(emailAddress, subject, msg)  
    isMsgSent = true;
  }catch(e){
    isMsgSent = false;
    Logger.log("Error "+e)    
  }
  else
   isMsgSent = false

 return isMsgSent
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


function convertToDate(timestamp){
  return new Date(timestamp).toString()
}

function replyUsers(){
 var spreadsheet = SpreadsheetApp.getActive()
 var sheet = spreadsheet.getActiveSheet()
 var values =  sheet.getRange(2,1, sheet.getLastRow(), sheet.getLastColumn()).getValues()
 var rows = values.length
 for (var i = 0; i < rows; i++){
   var name = values[i][2]
   var emailAddress = values[i][3]
   var lang = values[i][5]
   var newMsg = values[i][8]
   
   var isReplySent = values[i][9]
   
   
   if (emailAddress.length < 5 || newMsg.length < 1 || isReplySent) {
     if(emailAddress.length < 5)
          sheet.getRange("D"+(i+2)).setBackground("#ff0000")
     else if (newMsg.length < 1 ) 
          sheet.getRange("I"+(i+2)).setBackground("#ff0000")
     continue; 
   }
   
   Logger.log("-------\nindex:" +(i+2)+ ", name: "+name+", isReplySent: "+isReplySent+"\n-------")
   
   var tranlatedMsg = newMsg
   var subject = "Contact Us"
   var outerPart = "Thank you for contacting us. Please, recommend and share "+sheet.getSheetName()+ " with your friends and family. You can also Check out other awesome apps, made by us - https://play.google.com/store/apps/developer?id=Edge+Dev+Studio - Thank you"
   
  var shouldTranslate = false
  if (lang !== "en")
    try{
      LanguageApp.translate('Hello', lang, 'en');
      shouldTranslate = true
    }catch(e){
      shouldTranslate = false
    }

   if (lang !== 'en' && shouldTranslate)
      try{
        tranlatedMsg = LanguageApp.translate(newMsg, 'en', lang)
        subject = LanguageApp.translate(subject, 'en', lang)
        outerPart = LanguageApp.translate(outerPart, 'en', lang)
      }catch (e){
      }
   
   subject += " - "+sheet.getSheetName()
  
  /*
     Well it's simple to unsubscribe, just go on playstore and simply deactivate the subscription. Read this: https://support.google.com/googleplay/answer/7018481?co=GENIE.Platform%3DAndroid
  
     ****************************************
     Thank you for contacting us. Please, recommend and share App Name with your and friends you can also Check out other awesome apps, made by us - https://play.google.com/store/apps/developer?id=Edge+Dev+Studio
  */
   var mailMsg = tranlatedMsg+'\n\n**********************************\n'+outerPart+'\n'+<insert-your-app-link>
   
   var isSent = sendMail(emailAddress, subject, mailMsg)

    sheet.getRange("J"+(i+2)).setValue(isSent)
 }
}

function extractEmails(){

 var spreadsheet = SpreadsheetApp.getActive()
 var sheet = spreadsheet.getActiveSheet()
 var values =  sheet.getRange(2,1, sheet.getLastRow(), sheet.getLastColumn()).getValues()
 var isSentIndex = []
 
 for (var i = 0; i < values.length; i++){
   var name = values[i][2]
   var emailAddress = values[i][3]
   var lang = values[i][5]
   var newMsg = values[i][8]
   var isReplySent = values[i][7]
   
   if (isReplySent) {
       var emailListSheet = spreadsheet.getSheetByName("Email List")
       emailListSheet.appendRow([name, emailAddress, lang, sheet.getName()])
       isSentIndex.push(i+2)
     }
  }
  
  var sheet1 = SpreadsheetApp.getActiveSheet()
  
  for (var i = isSentIndex.length; i > 0; i--){
     sheet1.deleteRow(isSentIndex[i-1])
  }
}
