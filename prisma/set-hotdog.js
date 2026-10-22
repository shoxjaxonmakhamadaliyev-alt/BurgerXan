import 'dotenv/config';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const r = await prisma.product.updateMany({ where: { category: 'Хот-Дог' }, data: { image: '/uploads/hotdog.jpg?v=' + Date.now() } });
console.log('Хот-Дог rasmi qo\'yildi:', r.count, 'ta mahsulot');
await prisma.$disconnect();
