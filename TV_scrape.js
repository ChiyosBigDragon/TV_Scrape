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
