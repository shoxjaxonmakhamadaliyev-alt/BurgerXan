require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const keep = await p.product.findMany({ where: { category: 'Бургеры' }, select: { image: true } });
  const keepFiles = new Set(keep.map((x) => (x.image || '').split('?')[0].split('/').pop()));
  const r = await p.product.updateMany({ where: { category: { not: 'Бургеры' } }, data: { image: null } });
  const dir = path.join(process.cwd(), 'uploads');
  let del = 0;
  for (const f of fs.readdirSync(dir)) {
    if (/^(photo-|ai-)/.test(f) && !keepFiles.has(f)) { fs.unlinkSync(path.join(dir, f)); del++; }
  }
  console.log('Rasmi olib tashlandi:', r.count, 'ta mahsulot; o\'chirilgan fayllar:', del);
  await p.$disconnect();
})();
