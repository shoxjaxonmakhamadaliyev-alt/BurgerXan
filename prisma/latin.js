import 'dotenv/config';
import pkg from '@prisma/client';
import { lat } from './latin-map.js';
const prisma = new pkg.PrismaClient();
let n = 0;
for (const p of await prisma.product.findMany()) {
  const data = {
    name: lat(p.name), category: lat(p.category), description: p.description ? lat(p.description) : p.description,
    ingredients: (p.ingredients || []).map((x) => lat(x).replace(/ Pitsa$/, '')),
    variants: (p.variants || []).map((v) => ({ ...v, l: lat(v.l) })),
  };
  await prisma.product.update({ where: { id: p.id }, data });
  console.log(p.name, '->', data.name);
  n++;
}
console.log('Lotinga o\'tkazildi:', n, 'ta mahsulot');
await prisma.$disconnect();
