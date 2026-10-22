import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const dir = process.argv[2] || 'rasmlar';
fs.mkdirSync('uploads', { recursive: true });
let n = 0;
for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
  const m = /^(\d+)\.(png|jpe?g|webp)$/i.exec(f);
  if (!m) continue;
  const id = +m[1];
  const name = `ai-${id}.${m[2].toLowerCase()}`;
  fs.copyFileSync(path.join(dir, f), path.join('uploads', name));
  const r = await prisma.product.updateMany({ where: { id }, data: { image: `/uploads/${name}?v=${Date.now()}` } });
  console.log(r.count ? 'Biriktirildi: ' + f : 'Bunday mahsulot yo\'q: ' + f);
  n += r.count;
}
console.log(n + ' ta rasm yuklandi.');
await prisma.$disconnect();
