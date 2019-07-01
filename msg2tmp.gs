function getToken(){
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  return token
}

function strIns(str, idx, val){
  var res = str.slice(0, idx) + val + str.slice(idx);
  return res;
};

// URLをいい感じに切る
function splitUrl(url) {
  var ary = url.split('/');
  var channel = ary[4];
  var timestamp = strIns(ary[5].slice(1,-1), 10, '.');
  return { channel:channel, timestamp:timestamp }
}

// メッセージ取得
function getReaction(channel, timestamp) {
  var requestUrl = 'https://slack.com/api/reactions.get?';
  var payload = {
    token: getToken(),
    channel: channel,
    timestamp: timestamp
  };

  // パラメータ設定
  var param = [];
  for (var key in payload) {
    param.push(key + '=' + payload[key]);
  };
  requestUrl += param.join('&');
  return UrlFetchApp.fetch(requestUrl);
}

// 名前取得
function getUserName(user) {
  var requestUrl = 'https://slack.com/api/users.info?';
  var payload = {
    token: getToken(),
    user: user,
  };

  // パラメータ設定
  var param = [];
  for (var key in payload) {
    param.push(key + '=' + payload[key]);
  };
  requestUrl += param.join('&');
  var response = JSON.parse(UrlFetchApp.fetch(requestUrl));
  Logger.log('getName');
  var userName = response['user']['profile']['display_name'];
  return userName;
}

function getAttendList(reactions){
  // 出席絵文字の名前リスト取得
  for (var i in reactions){
    if (reactions[i]['name'] == 'woman-gesturing-ok'){
      var attend_users = reactions[i]['users'];
      //Logger.log(attend_users);
    }
  }
  // 出席者の名前を取得
  var attendNameList = [];
  for (var i in attend_users) {
    attendNameList += ('@' + getUserName(attend_users[i]) + ', ')
  }
  return attendNameList
}


// 新規のドキュメントファイルを作成→フォルダ移動
function newDocFile(docName, tarDirId) {
  // ドキュメントの作成
  docs = DocumentApp.create(docName);
  // docsをGoogleDrive内で扱えるようにする
  var ssId = docs.getId();
  var docFile = DriveApp.getFileById(ssId);

  // 移動先フォルダをIDで指定
  var tarDir = DriveApp.getFolderById(tarDirId);
  tarDir.addFile(docFile);
  DriveApp.getRootFolder().removeFile(docFile);

  return docs
}

// main flow
function flow(url) {

  var tarDirId = '0B4nkWeM5snYbSHZkVllObVIzUnc';



  // ドキュメントのタイトル(とりあえず日付の場合
  var today = new Date();
  var docName = Utilities.formatDate( today, "JST", "yyyyMMdd") + "MTG";
  Logger.log(docName);

  // ファイル作成
  docs = newDocFile(docName, tarDirId);

  // テンプレート記載
  var ssId = docs.getId();
  var contents = Utilities.formatDate(new Date(), "JST", "yyyy年MM月dd日") + "MTG 議事録\n";
  var spliturl = splitUrl(url);
  var response = JSON.parse(getReaction(spliturl.channel, spliturl.timestamp));
  var attendList = getAttendList(response.message.reactions);
  // 書き込み  
  docs.getBody().setText(contents + attendList);

  // 作成したドキュメントURLを取得
  var documentUrl = docs.getUrl();
  Logger.log(documentUrl);

  return documentUrl
}

function doPost(e) {
  var token = PropertiesService.getScriptProperties().getProperty(getToken());

  var options = { 
        channelId: "#mtg",
        bot_name: "カイルくん",
        icon: ":dolphin:",
  };

  var app = SlackApp.create(token);
  var url = e.parameter.text.substr(6);

  documentUrl = flow(url);

  var message = "こんばんは！議事録のテンプレートを作ったよ！\n" + documentUrl;

  return app.postMessage( options.channelId, message, { 
             username: options.bot_name, 
             icon_emoji: options.icon 
  });
};
