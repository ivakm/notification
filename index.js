import http from 'node:http';
import cron from 'node-cron';
import { checkNewPosts } from './lib/nazk.js';
import { generateTextFromArray, sendResponse, getBody } from './lib/utils.js';
import { HEADERS } from './lib/constants.js';
import {
  initTelegramBot,
  sendPostsToTelegram,
  sendMessageToTelegram,
} from './lib/telegram-bot.js';
import * as JSON_DB from './lib/json_db.js';
import { writeToFile } from './lib/file.js';

const bot = initTelegramBot(process.env.TELEGRAM_BOT_TOKEN);
await bot.setWebHook(process.env.TELEGRAM_BOT_WEBHOOK_URL);
const db = JSON_DB.init(process.env.JSON_DB_PATH);

const port = 8080;
let latestUpdateAt = null;
let chatIds = (await db.exists('/chatIds')) ? await db.getData('/chatIds') : [];
let parsedData = (await db.exists('/parsedData'))
  ? await db.getData('/parsedData')
  : {};
let latestParsedData = [];

function verifyParsedData(parsedData, latestParsedData) {
  latestParsedData.filter((item) => {
    if (Reflect.has(parsedData, item.indexKey)) {
      return false;
    }

    Reflect.set(parsedData, item.indexKey, item);
    db.push(`/parsedData/${item.indexKey}`, item);
    return true;
  });
}

const routing = {
  '/': '<h1>welcome to my server</h1>',
  '/nazk/refresh': async (req, res) => {
    console.log('refreshing started...');
    try {
      latestParsedData = await checkNewPosts((context) => {
        writeToFile(JSON.stringify(context));
      });

      console.log(`Latest parsed data length: ${latestParsedData.length}`);
    } catch (error) {
      console.error('Error first nazk scraping:', error);
    }
    console.log('refreshing ended');

    sendResponse(res, 200, 'refreshed');
  },
  [`/nazk/webhook/${process.env.TELEGRAM_BOT_TOKEN.slice(0, 10)}`]: async (
    req,
    res,
  ) => {
    try {
      const body = await getBody(req);
      if (!body) return void sendResponse(res, 400, { message: 'Bad request' });

      const { message, edited_message } = body;
      const chatId = (message?.chat ?? edited_message?.chat)?.id;

      if (!chatId) {
        sendResponse(res, 400, { message: 'No chat ID found in the message' });
        return;
      }

      if (!chatIds.includes(chatId)) {
        chatIds.push(chatId);
        db.push('/chatIds[]', chatId);
        console.log(`Added chat ID ${chatId} to the list`);

        sendMessageToTelegram(
          [chatId],
          'Ви додані до розсилки нотифікацій Вільне Радіо 🎙️🎙️🎙️ по справах - https://public.nazk.gov.ua',
        );
      } else {
        sendMessageToTelegram(
          [chatId],
          'Ви ви вже додані до розсилки нотифікацій 📻 \n Наразі існує тільки підписка для нотифікацій.',
        );
      }

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
  '/nazk/status': async (req, res) => {
    sendResponse(res, 200, {
      message: `latest update at ${latestUpdateAt.toISOString()}`,
    });
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
    latestParsedData = await checkNewPosts((context) => {
      writeToFile(JSON.stringify(context));
    });
    latestUpdateAt = new Date();
    console.log(`Latest parsed data length: ${latestParsedData.length}`);
  } catch (error) {
    console.error('Error first nazk scraping:', error);
  }
});

cron.schedule(process.env.CRON_SCHEDULE, async () => {
  try {
    latestParsedData = await checkNewPosts((context) => {
      writeToFile(JSON.stringify(context));
    });
    latestUpdateAt = new Date();

    // latestParsedData = verifyParsedData(parsedData, latestParsedData);

    sendPostsToTelegram(chatIds, latestParsedData);
  } catch (error) {
    console.error('Error nazk scraping:', error);
  }
});
