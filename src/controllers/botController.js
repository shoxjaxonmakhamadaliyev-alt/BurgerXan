import { Markup } from 'telegraf';
import config from '../config/default.js';
import bot from '../core/bot.js';

export const start = (ctx) => {
  if (!config.webAppUrl) return ctx.reply('Mini App manzili hali sozlanmagan (WEBAPP_URL).');
  return ctx.reply('🍔 FastFood — tez va mazali!\nMenyuni ochish uchun tugmani bosing 👇',
    Markup.keyboard([[Markup.button.webApp('🛒 Menyu / Buyurtma', config.webAppUrl)]]).resize());
};
export const notify = (telegramId, text) => bot.telegram.sendMessage(Number(telegramId), text).catch(() => {});
export const setMenuButton = () => config.webAppUrl &&
  bot.telegram.setChatMenuButton({ menuButton: { type: 'web_app', text: 'Menyu', web_app: { url: config.webAppUrl } } }).catch(() => {});
