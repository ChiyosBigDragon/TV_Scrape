## 先に
この記事はこれのパクリ．<br>
[Node.jsでテレビの映画放映情報をWebスクレイピングしてSlackに通知する &mdash; ほんじゃらねっと][ブログ]<br>
もはや写経だが勉強記録用．

## 動機
家で新聞を取らなくなってからテレビの番組表はwebで確認しているのだが，いかんせん扱いにくい．どうせなら自分が興味のあるものだけ抜き出してしまおうというアレ．スクレイピングはPythonでかじっているのでいけるはず．

## 検索
[番組を探す &mdash; Gガイド.テレビ王国][検索]で見たい番組のキーワードや芸能人の名前を入力しURLを生成する．`地上波`+`金属バット`[^1]で検索したところ以下のURLが得られた．<br>
`https://tv.so-net.ne.jp/schedulesBySearch.action?condition.genres[0].parentId=-1&condition.genres[0].childId=-1&stationPlatformId=1&condition.keyword=%E9%87%91%E5%B1%9E%E3%83%90%E3%83%83%E3%83%88&submit=%E6%A4%9C%E7%B4%A2&descriptive=true`<br>
このページのソースを元にスクレイピングする．

## TV_scrape.js
```js
const httpClient = require('cheerio-httpcli');

async function fetch(url) {
    const baseUrl = url;
    const scheduleList = [];
    const result = await httpClient.fetch(baseUrl);
    const $ = result.$;
    $('.utileList', '.contBlockNB').each(function () {
        const row = $(this);
        scheduleList.push({
            title: $('h2 a', row).text().trim(),
            date: $('.utileListProperty', row).text().trim().replace(/([\s\t\n]|&nbsp;)+/g, ' '),
            caps: $('.utileListDetail', row).text().trim(),
        });
    });
    return scheduleList;
}

function stringifyList(scheduleList) {
    return scheduleList.map(schedule => stringify(schedule)).join('\n\n');
}

function stringify(schedule) {
    let text = schedule.date + '\n';
    text += '*' + schedule.title + '*' + '\n';
    text += '>' + schedule.caps + '\n';
    return text;
}

module.exports = {
    fetch,
    stringifyList,
    stringify
}
```
- ライブラリは`cheerio-httpcli`を使う．`require`は`import`みたいなものか．
- 関数名の前に`async`を置くと内部で`await`が使える．`await`は待機と例外処理を担う？
- `index`側から`fetch`にURLを投げる．
- タグはそのまま，`id`は`#`，`class`は`.`を付けて表現する．
- `module.exports`は外から呼んだときに使えるようにするもの？

## slack.js
```js
const request = require('request');

module.exports = {
    postMessage: async (token, channel, text) => {
        const options = {
            headers: {
                'Authorization': 'Bearer ' + token
            },
            form: {
                channel: channel,
                text: text,
                as_user: true
            },
            json: true
        };
        return new Promise((resolve,reject) => {
            request.post('https://slack.com/api/chat.postMessage', options, (error, res, body) => {
                if(error) {
                    reject(error);
                }
                resolve({
                    response: res,
                    body: body
                });
            });
        });
    }
};
```
- 一言一句違わず申し訳ない気持ちになる．
- やっていることは単純だが一から書くとなると…

## index.js
通知といったら瓦版なのでチャンネル名は`#瓦版`．`fetch`の前に`await`を入れないとエラーを吐くので気を付ける．
```js
const slack = require('./slack');
const TVScrape = require('./TV_scrape');
const fs = require('fs');

function main() {
    const jsonObject = JSON.parse(fs.readFileSync('./url.json', 'utf8'));
    jsonObject.list.forEach(async (obj) => {
        const scheduleList = await TVScrape.fetch(obj.url);
        const scheduleListText = TVScrape.stringifyList(scheduleList);
        const slackMessageText = '*<' + obj.id + ' の番組情報>*\n\n' + scheduleListText;
        const token = 'API_TOKEN';
        slack.postMessage(token, '#瓦版', slackMessageText);
    });
}

main();
```
`url.json`の中身はこんな感じ．`id`には自分で検索条件の説明を入れられる．`list`に2要素以上入れてもok．
```json
{
    "list": [
        {
            "id": "地上波+金属バット",
            "url": "https://tv.so-net.ne.jp/schedulesBySearch.action?condition.genres%5B0%5D.parentId=-1&condition.genres%5B0%5D.childId=-1&stationPlatformId=1&condition.keyword=%E9%87%91%E5%B1%9E%E3%83%90%E3%83%83%E3%83%88&submit=%E6%A4%9C%E7%B4%A2&descriptive=true"
        }
    ]
}
```
<br>

以上のコードを実行するとSlackに通知が来る．<br>
![rikisi][rikisi]<br>

## 他にやりたいこと
- AWSで定期的に実行．
- Slackの`slash-command`を用いた検索条件の追加削除．

今回はここまで．

[ブログ]: https://blog.honjala.net/entry/2018/09/13/004442
[検索]: https://tv.so-net.ne.jp/search/
[^1]: https://ja.wikipedia.org/wiki/%E9%87%91%E5%B1%9E%E3%83%90%E3%83%83%E3%83%88_(%E3%81%8A%E7%AC%91%E3%81%84%E3%82%B3%E3%83%B3%E3%83%93)
[rikisi]: ./images/capture.png
