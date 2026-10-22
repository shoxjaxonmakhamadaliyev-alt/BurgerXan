import 'dotenv/config';
export default {
  port: process.env.PORT || 3000,
  botToken: process.env.BOT_TOKEN,
  botUsername: process.env.BOT_USERNAME,
  webAppUrl: process.env.WEBAPP_URL,
  adminPassword: process.env.ADMIN_PASSWORD,
  myId: process.env.MY_TELEGRAM_ID,
  colaPrice: 5000,
};
