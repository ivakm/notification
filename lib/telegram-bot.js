import TelegramBot from 'node-telegram-bot-api';
import { generateTextFromArray } from './utils';

let bot;

export const initTelegramBot = (token) => {
  bot = new TelegramBot(token, { polling: true });

  return bot;
};

export const sendPostsToTelegram = async (chatIds, parsedData) => {
  if(!bot) throw new Error('Bot not initialized');

  if (chatIds.length && parsedData.length) {
    chatIds.forEach(chatId => {
      bot.sendMessage(
        chatId,
        `Виявлено нові пости:\n${generateTextFromArray(parsedData)}`,
      );
    });
  }
};