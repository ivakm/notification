const TelegramBot = require('node-telegram-bot-api');

let bot = new TelegramBot(token, { polling: true });

let chatId = null;

bot.on('message', (msg) => {
  chatId = msg.chat.id;
});

module.exports = {
  initTelegramBot(token) {
    bot = new TelegramBot(token, { polling: true });

    return bot;
  },
};

