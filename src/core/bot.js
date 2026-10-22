import { Telegraf } from 'telegraf';
import config from '../config/default.js';
export default new Telegraf(config.botToken);
