import crypto from 'crypto';
import config from '../config/default.js';
import User from '../models/User.js';

function verify(initData) {
  if (!initData) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get('hash');
  p.delete('hash');
  const str = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(config.botToken).digest();
  if (crypto.createHmac('sha256', secret).update(str).digest('hex') !== hash) return null;
  try { return JSON.parse(p.get('user')); } catch { return null; }
}

export const tgAuth = async (req, res, next) => {
  try {
    const tg = verify(req.get('x-init-data'));
    if (!tg) return res.status(401).json({ error: 'Telegram orqali oching' });
    req.user = await User.upsert(tg);
    next();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server xatosi' }); }
};

export const adminAuth = (req, res, next) =>
  req.get('x-admin-password') === config.adminPassword ? next() : res.status(401).json({ error: 'Parol noto\'g\'ri' });
