import TelegramBot from 'node-telegram-bot-api';
import { generateTextFromArray } from './utils.js';

let bot;

export const initTelegramBot = (token, webHook) => {
  bot = new TelegramBot(token, {
    webHook: {
      https: webHook,
    },
  });

  return bot;
};

export const sendPostsToTelegram = async (chatIds, parsedData) => {
  if (!bot) throw new Error('Bot not initialized');

  if (chatIds.length && parsedData.length) {
    chatIds.forEach((chatId) => {
      bot.sendMessage(
        chatId,
        `Виявлено нові пости:\n${generateTextFromArray(parsedData)}`,
      );
    });
  }
};
