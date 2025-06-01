import TelegramBot from 'node-telegram-bot-api';

let bot;

export const initTelegramBot = (token) => {
  bot = new TelegramBot(token, { polling: true });

  return bot;
};
