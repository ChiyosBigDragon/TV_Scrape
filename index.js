require('dotenv').config();
const slack = require('./slack');
const TVScrape = require('./TV_scrape');
const fs = require('fs');

function main() {
    const jsonObject = JSON.parse(fs.readFileSync('./url.json', 'utf8'));
    jsonObject.list.forEach(async (obj) => {
        const scheduleList = await TVScrape.fetch(obj.url);
        const scheduleListText = TVScrape.stringifyList(scheduleList);
        const slackMessageText = '*<' + obj.id + ' の番組情報>*\n\n' + scheduleListText;
        const token = process.env.Slack_API_TOKEN;
        slack.postMessage(token, '#瓦版', slackMessageText);
    });
}

main();
