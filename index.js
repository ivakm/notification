import http from 'node:http';
import cron from 'node-cron';
import { checkNewPosts } from './lib/nazk.js';
import { generateTextFromArray, sendResponse, getBody } from './lib/utils.js';
import { HEADERS } from './lib/constants.js';
import { initTelegramBot, sendPostsToTelegram } from './lib/telegram-bot.js';
import * as JSON_DB from './lib/json_db.js';

console.log(
  `start with variables : ${process.env.TELEGRAM_BOT_TOKEN}, ${process.env.JSON_DB_PATH}`,
);

const bot = initTelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const db = JSON_DB.init(process.env.JSON_DB_PATH);

const port = 8080;
let latestParsedData = [];
let chatIds = [];

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

    const { message, edited_message } = body;
    const chatId = (message?.chat ?? edited_message?.chat).id;

    if (!chatIds.includes(chatId)) {
      chatIds.push(chatId);
      db.push('chatIds[]', chatId);
      console.log(`Added chat ID ${chatId} to the list`);

      bot.sendMessage(
        chatId,
        '<p>Ви додані до розсилки нотифікацій від https://public.nazk.gov.ua</p>',
      );
    } else {
      bot.sendMessage(
        chatId,
        '<div><p>Ви ви вже додані до розсилки нотифікацій від https://public.nazk.gov.ua</p><p>наразі існує тільки підписка для нотифікацій.</p></div>',
      );
    }

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

try {
  chatIds = await db.getData('chatIds', []);
} catch (err) {
  console.error(err);
  db.push('chatIds', []);
}

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

    sendPostsToTelegram(chatIds, latestParsedData);

    if (latestParsedData.length > 0) {
      chatIds.forEach((chatId) => {
        bot.sendMessage(
          chatId,
          `Виявлено нові пости:\n\n${generateTextFromArray(latestParsedData)}`,
          {
            parse_mode: 'HTML',
          },
        );
      });
    }
  } catch (error) {
    console.error('Error nazk scraping:', error);
  }
});
