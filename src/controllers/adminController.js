import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Story from '../models/Story.js';
import prisma from '../database/connection.js';
import { notify } from './botController.js';

const clean = (b) => ({
  name: String(b.name || '').trim(),
  image: b.image || null,
  description: b.description || null,
  category: String(b.category || '').trim(),
  price: parseInt(b.price, 10) || 0,
  oldPrice: b.oldPrice ? parseInt(b.oldPrice, 10) : null,
  ingredients: Array.isArray(b.ingredients) ? b.ingredients : [],
  variants: Array.isArray(b.variants) ? b.variants : [],
  active: b.active !== false,
});

export const login = (req, res) => res.json({ ok: true });
export const orders = async (req, res) => res.json(await Order.listAll());
export const setStatus = async (req, res) => {
  const status = req.body.status;
  if (!['pending', 'delivered', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Noto\'g\'ri holat' });
  const o = await Order.setStatus(+req.params.id, status);
  if (status === 'delivered') notify(o.user.telegramId, `Buyurtma №${o.id} yetkazildi. Yoqimli ishtaha! 🍕`);
  res.json({ ok: true });
};
export const products = async (req, res) => res.json(await Product.listAll());
export const createProduct = async (req, res) => res.json(await Product.create(clean(req.body)));
export const updateProduct = async (req, res) => res.json(await Product.update(+req.params.id, clean(req.body)));
export const deleteProduct = async (req, res) => { await Product.remove(+req.params.id); res.json({ ok: true }); };

export const upload = async (req, res) => {
  const m = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/.exec(req.body.data || '');
  if (!m) return res.status(400).json({ error: 'Rasm formati noto\'g\'ri' });
  const img = await prisma.image.create({ data: { mime: 'image/' + (m[1] === 'jpg' ? 'jpeg' : m[1]), data: Buffer.from(m[2], 'base64') } });
  res.json({ url: '/img/' + img.id });
};
export const listStories = async (req, res) => res.json(await Story.listAll());
export const createStory = async (req, res) => {
  const title = String(req.body.title || '').trim();
  if (!title || !req.body.image) return res.status(400).json({ error: 'Nom va rasm kerak' });
  const hours = Math.min(Math.max(parseInt(req.body.hours, 10) || 24, 1), 720);
  res.json(await Story.create({ title, text: req.body.text ? String(req.body.text) : null, image: req.body.image, expiresAt: new Date(Date.now() + hours * 3600 * 1000) }));
};
export const deleteStory = async (req, res) => { await Story.remove(+req.params.id); res.json({ ok: true }); };
