const telegramApi = require('node-telegram-bot-api');
const token = '5599846852:AAEU7WUJNmeZpIA9Kbo3w_TxeqS5rkYNe5Q';
const bot = new telegramApi(token, { polling: true });

// Создадим некий аналог бд, объект, который содержит выдаваемые клиентом цифры
const chats = {};

// Пишем стандартные команды для бота
bot.setMyCommands([
   { command: '/start', description: 'Начальное приветствие' },
   { command: '/info', description: 'Получить информацию о пользователе' },
   { command: '/game', description: 'Игра - отгадай цифру' },
])
// Импортируем объект с  кнопками (opnions) из файла option.js, делая сразу деструктуризацию (достаем необходимые нам поля)
const { gameOptions, againOptions } = require('./options');

// Пишем отдельную  функцию для старта игры
const startGame = async (chatId) => {
   await bot.sendMessage(chatId, `Давай сыграем в очень интересную игру, я загадаю цифру от 0 до 9, а ты попробуешь ее отгадать! `);
   const randomNumber = Math.floor(Math.random() * 10);
   chats[chatId] = randomNumber;
   await bot.sendMessage(chatId, `Отгадывай!`, gameOptions);
}

// Пишем функцию, в которую включаем сценарий, выполняемый при старте (старт заключается в вызове этой функции)
const start = () => {
   // Устанавливаем прослушивание событий для обработки полученных сообщений (событие: message, это когда пользователь отправляет сообщение)
   bot.on('message', async msg => {
      // Достаем из сообщения, полученного от бота параметры, которые нас интересуют
      const text = msg.text;
      const chatId = msg.chat.id;
      // Пишем ответ боту
      if (text === '/start') {
         await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/d97/520/d9752080-3329-3735-a442-988a9de22f1b/1.webp')
         return bot.sendMessage(chatId, `Здравствуйте, добро пожаловать в тренировочный бот Николая Ходоновича.
       Для продолжения нажмите 'Меню', а если этой кнопки еще нет, то '/'`);
      }

      if (text === '/info') {
         return bot.sendMessage(chatId, `Вас зовут ${msg.from.first_name} ${msg.from.last_name} ?`);
      }

      if (text === '/game') {
         return startGame(chatId);
      }
      return bot.sendMessage(chatId, `Я тебя не понимаю, попробуй еще раз`);
   })
   // Организуем прослушивание наших кнопок через событие callback_query, это когда пользователь нажимает на какую-то нашу кнопку
   bot.on('callback_query', msg => {
      // Вытаскиваем нужные нам поля      
      const data = msg.data;
      const chatId = msg.message.chat.id;
      //  Если пользователь нажал на кнопку попробуй еще раз
      if (data === '/again') {
         return startGame(chatId);
      }

      if (data === String(chats[chatId])) {
         return bot.sendMessage(chatId, `Поздравляю, ты угадал цифру ${data}`, againOptions);
      } else {
         return bot.sendMessage(chatId, `К сожалению ты не угадал, я загадал цифру ${chats[chatId]}`, againOptions);
      }
   })
}
// Стартуем
start();
