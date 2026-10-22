import bot from '../core/bot.js';
import { start } from '../controllers/botController.js';
export default () => { bot.start(start); };
