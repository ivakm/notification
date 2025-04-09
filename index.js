require('dotenv').config();
const http = require('http');
const cron = require('node-cron');
const { checkNewPosts } = require('./lib/nazk');
const { generateTextFromArray } = require('./lib/utils');

const port = 8080;
let latestParsedData = [];

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  console.log(
    'Request received, latestParsedDataLength = ',
    latestParsedData.length,
  );
  const responseText = latestParsedData.length
    ? `Виявлено нові пости:\n
                        ${generateTextFromArray(latestParsedData)}`
    : 'Не має нових постів';
  res.end(responseText);
});

server.listen(port, '0.0.0.0', async () => {
  console.log(`Server running on PORT=${port}`);
  try {
    latestParsedData = await checkNewPosts();
    console.log(`Latest parsed data length: ${latestParsedData.length}`);
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
