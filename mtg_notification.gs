function postSlackMessage() {
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');

  var slackApp = SlackApp.create(token);
  // 来週の日付を取得
  var nowDate = new Date();
  var next_week_date = new Date(nowDate.getYear(), nowDate.getMonth(), nowDate.getDate()+7);
  
  var next_date = Utilities.formatDate(next_week_date, "JST", "yyyy年MM月dd日")
  // 対象チャンネル
  var channelId = "#test-space";
  // 投稿するメッセージ
  var message = "<!here> MTG "+ next_date + " 19時〜\n\n" +
                "場所：Palmy house\n \t①みんなに報告したいこと\n \t②みんなと議論・相談したいこと\n \t③その他\n\n" +
                "出席:woman-gesturing-ok: 欠席:woman-gesturing-no:" +
                "\t 遅刻・早退される方は、だいたいの時間を教えてください ⏰\n" +
                "欠席される方は、その理由をちょこっと教えてください\n";
　//
  var options = {
    username: "えらい秘書",
    icon_emoji: ":squirrel:"
  }
  slackApp.postMessage(channelId, message, options);
}
