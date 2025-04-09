require('dotenv').config();
const http = require('http');
const cron = require('node-cron');
const cheerio = require('cheerio');
const { checkNewPosts } = require('./lib/nazk');

const port = 3000;
let latestParsedData = [];

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  const responseText = `Виявлено нові пости:\n
                        ${generateTextFromArray(latestParsedData)}`;
  res.end(responseText);
});

server.listen(port, async () => {
  try {
    latestParsedData = await checkNewPosts();
  } catch (error) {
    console.error('Error first nazk scraping:', error);
  }
});

cron.schedule('0 * * * *', async () => {
  try {
    latestParsedData = await checkNewPosts();
  } catch (error) {
    console.error('Error nazk scraping:', error);
  }
});
