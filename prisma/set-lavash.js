import 'dotenv/config';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const v = '?v=' + Date.now();
const all = await prisma.product.findMany({ where: { category: 'Шаурма' } });
for (const p of all) {
  const img = p.name.startsWith('Твистер') ? '/uploads/twister.jpg' : p.name.startsWith('Лаваш') ? '/uploads/lavash.jpg' : null;
  if (!img) continue;
  await prisma.product.update({ where: { id: p.id }, data: { image: img + v } });
  console.log('Qo\'yildi:', p.name, '<-', img);
}
await prisma.$disconnect();
