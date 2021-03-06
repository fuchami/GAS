function getTrivia() {
  // スプレッドシートを取得
  var spreadsheet = SpreadsheetApp.openById('*******');
  // 現在のシートを取得
  var sheet = spreadsheet.getActiveSheet();
  var maxRow=sheet.getDataRange().getLastRow(); //シートの使用範囲のうち最終行を取得
  var numRow=Math.floor(1+Math.random()*(maxRow-1)); //2～maxRowの間のランダムの整数をチョイス
  var trivia = sheet.getRange(numRow,1).getValue() 
  return trivia
}

function postSlackMessage() {
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');

  var slackApp = SlackApp.create(token);
  // 来週の日付を取得
  var nowDate = new Date();
  var next_week_date = new Date(nowDate.getYear(), nowDate.getMonth(), nowDate.getDate()+7);
  var next_date = Utilities.formatDate(next_week_date, "JST", "yyyy年MM月dd日")
  // トリビア
  var today_trivia = getTrivia();
  var trivia = "【今日のトリビア】\n ・" + today_trivia + "\n";
  Logger.log(trivia);
  // 対象チャンネル
  var channelId = "#mtg";
  // 投稿するメッセージ
  var message = "<!here> MTG "+ next_date + " 19時〜\n\n" + trivia + 
                "\n場所：\n \t①みんなに報告したいこと\n \t②みんなと議論・相談したいこと\n \t③その他\n\n" +
                "出席:woman-gesturing-ok: 欠席:woman-gesturing-no:" +
                "\t遅刻・早退される方は、だいたいの時間を教えてください⏰\n" +
                "欠席される方は、その理由をちょこっと教えてください\n";
  
  var test_message = "これはテストメッセージです";
                
  var options = {
    username: "おでん",
    icon_emoji: ":oden:"
  }
  slackApp.postMessage(channelId, message, options);
}