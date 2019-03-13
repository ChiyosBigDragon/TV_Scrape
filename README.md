任意の番組情報をSlackに通知します．

## 初期設定
SlackにBotsアプリを追加してトークンを確認し，`.env`を作って以下のように記述します．
```env
SLACK_API_TOKEN = xxxx-xxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_CHANNEL = #xxxxxx
```
また`url.json`を先例に則って書き換えます．`id`の内容は通知の先頭に表示されます．`url`には[番組を探す &mdash; Gガイド.テレビ王国][検索]で検索した際のURLを入力します．

## 実行
以下のコマンドで画像のように通知されるはずです．
```ps
$ node index.js
```
![rikisi][rikisi]<br>

## 他にやりたいこと
- AWSで定期的に実行．
- Slackの`slash-command`を用いた検索条件の追加削除．

[検索]: https://tv.so-net.ne.jp/search/
[rikisi]: ./images/capture.png
