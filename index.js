const http = require('http');
const cron = require('node-cron');
const cheerio = require('cheerio');

const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello from native Node.js server!');
});

server.listen(port, () => {
    checkNewPosts();
    console.log(`Server running at http://localhost:${ port }/`);
});

const checkNewPosts = async () => {
    const now = Math.floor(Date.now() / 1000);
    const oneHourAgo = now - 3600;
    const domain = "https://public.nazk.gov.ua";
    const codes = ["44762032", "44675474", "04052732", "04340493", "33852448"];
    const url = `${ domain }/documents/list?q=${ encodeURIComponent(codes.join(',+')) }&full_search=1&date_from=${ oneHourAgo }&date_to=${ now }`;
    try {
        const response = await fetch(url);

        if (response) {
            const result = await response.text();
            const $ = cheerio.load(result);
            const html = $('.fio a');

            let parsedData = [];
            for (let i = 0; i < html.length; i++) {
                console.log((html[i]).attribs.href);
                parsedData.push({
                    name: `${ cheerio.load(html[i]).text() }`,
                    url: `${ domain }${ html[i].attribs.href }`
                });
            }
            console.log(parsedData)
        }

    } catch (error) {
        console.error('Помилка запиту:', error);
    }
};

cron.schedule('0 * * * *', () => {
    checkNewPosts();
})