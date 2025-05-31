require('dotenv').config();
const http = require('http');
const cron = require('node-cron');
const { checkNewPosts } = require('./lib/nazk');
const { generateTextFromArray, sendResponse, getBody } = require('./lib/utils');
const { HEADERS } = require('./lib/constants');
const port = 8080;
let latestParsedData = [];

const routing = {
  '/': '<h1>welcome to my server</h1>',
  '/nazk/refresh': async (req, res) => {
    console.log('refreshing started...');
    try {
      latestParsedData = await checkNewPosts();
      console.log(`Latest parsed data length: ${latestParsedData.length}`);
    } catch (error) {
      console.error('Error first nazk scraping:', error);
    }
    console.log('refreshing ended');

    sendResponse(res, 200, 'refreshed');
  },
  '/nazk/webhook': async (req, res) => {
    const body = await getBody(req);
    if (!body) return void sendResponse(res, 400, { message: 'Bad request' });

    console.dir(body);

    try {
      sendResponse(res, 200, 'OK');
    } catch (err) {
      console.error(err);
      sendResponse(res, 500, { message: 'Internal server error' });
    }
  },
  '/nazk/list': async (req, res) => {
    const responseText = latestParsedData.length
      ? `Виявлено нові пости:\n
                        ${generateTextFromArray(latestParsedData)}`
      : 'Не має нових постів';

    sendResponse(res, 200, { message: responseText });
  },
};

const types = {
  object: (o) => [200, JSON.stringify(o)],
  string: (s) => [200, s],
  undefined: () => [404, 'Page not found'],
  function: (fn, req, res) => void fn(req, res),
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  for (const [header, value] of HEADERS) res.setHeader(header, value);
  if (method === 'OPTIONS') return void res.writeHead(204).end();

  const data = routing[url];
  const type = typeof data;
  const serializer = types[type];
  const result = serializer(data, req, res);

  if (!result) return;
  const [code, response] = result;
  const contentType = type === 'object' ? 'application/json' : 'text/html';
  res.writeHead(code, { 'Content-Type': contentType }).end(response);
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
