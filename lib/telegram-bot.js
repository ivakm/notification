const TelegramBot = require('node-telegram-bot-api');

let bot;

module.exports = {
  initTelegramBot(token) {
    bot = new TelegramBot(token, { polling: true });

    return bot;
  },
};
