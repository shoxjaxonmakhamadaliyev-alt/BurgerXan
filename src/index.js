import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import prisma from './database/connection.js';
import { fileURLToPath } from 'url';
import config from './config/default.js';
import bot from './core/bot.js';
import botRoutes from './routes/bot.routes.js';
import clientRoutes from './routes/client.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { setMenuButton } from './controllers/botController.js';

BigInt.prototype.toJSON = function () { return Number(this); };

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.get('/health', (req, res) => res.send('ok'));
app.get('/img/:id', async (req, res) => {
  const img = await prisma.image.findUnique({ where: { id: parseInt(req.params.id, 10) || 0 } }).catch(() => null);
  if (!img) return res.sendStatus(404);
  res.set('Content-Type', img.mime).set('Cache-Control', 'public, max-age=31536000, immutable').send(Buffer.from(img.data));
});
const useWebhook = !!(process.env.RENDER || process.env.USE_WEBHOOK);
const hook = '/tg/' + crypto.createHash('sha256').update(String(config.botToken)).digest('hex').slice(0, 24);
if (useWebhook) app.use(bot.webhookCallback(hook));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/admin', adminRoutes);
app.use('/api', clientRoutes);

const adminDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../admin/dist');
app.use('/admin', express.static(adminDist));
app.get('/admin/*', (req, res) => res.sendFile(path.join(adminDist, 'index.html')));

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../miniapp/dist');
app.use(express.static(dist));
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));

botRoutes();
setMenuButton();
app.listen(config.port, () => {
  console.log(`Server: http://localhost:${config.port}`);
  if (useWebhook) bot.telegram.setWebhook(config.webAppUrl + hook).then(() => console.log('Webhook o\'rnatildi')).catch((e) => console.error('Webhook xatosi:', e.message));
  else bot.launch().catch((e) => console.error('Bot xatosi:', e.message));
});
const stop = () => { try { bot.stop(); } catch { /* ignore */ } };
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
