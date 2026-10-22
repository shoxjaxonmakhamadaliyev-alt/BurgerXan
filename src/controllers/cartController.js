import config from '../config/default.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Story from '../models/Story.js';
import { notify } from './botController.js';

const fmt = (n) => n.toLocaleString('ru-RU') + " so'm";

export const stories = async (req, res) => res.json(await Story.listActive());
export const menu = async (req, res) => res.json(await Product.listActive());
export const me = async (req, res) => res.json({ user: req.user, orders: await Order.byUser(req.user.id) });

export const createOrder = async (req, res) => {
  const { items = [], cola = false, phone = '', location = '' } = req.body;
  if (!items.length || phone.length < 7 || location.length < 3) return res.status(400).json({ error: 'Telefon va manzilni kiriting' });
  const products = await Product.byIds(items.map((i) => +i.id));
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const lines = [];
  let total = 0;
  for (const i of items) {
    const p = byId[+i.id];
    const v = p && (p.variants.length ? p.variants[+i.idx] : { l: null, p: p.price });
    if (!v) return res.status(400).json({ error: 'Menyu o\'zgargan, qayta urinib ko\'ring' });
    const qty = Math.min(Math.max(+i.qty | 0, 1), 50);
    lines.push({ id: p.id, idx: +i.idx || 0, name: p.name, label: v.l, price: v.p, qty });
    total += v.p * qty;
  }
  if (cola) { lines.push({ id: 0, idx: 0, name: 'Кола', label: null, price: config.colaPrice, qty: 1 }); total += config.colaPrice; }
  await User.setPhone(req.user.id, phone);
  const order = await Order.create({ userId: req.user.id, items: lines, total, location });
  notify(req.user.telegramId, `Buyurtmangiz muvaffaqiyatli qabul qilindi! Kuryerimiz tez orada bog'lanadi 🍕\n\n№${order.id} · ${fmt(total)}`);
  res.json({ id: order.id, total });
};
