import 'dotenv/config';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const R = {
  "Шаурма": {
    "Катта": "Лаваш Катта",
    "Мини": "Лаваш Мини",
    "Сыром": "Лаваш Сыром",
    "С Котлетой": "Лаваш с Котлетой"
  },
  "Хот-Дог": {
    "Сыром": "Хот-Дог Сыром",
    "Двойной": "Хот-Дог Двойной",
    "Двойной с Сыром": "Хот-Дог Двойной с Сыром",
    "Королевский": "Хот-Дог Королевский",
    "Королевский с Сыром": "Хот-Дог Королевский с Сыром"
  },
  "Нонбургер": {
    "Сыром": "Нонбургер Сыром",
    "Мини": "Нонбургер Мини",
    "Мини с Сыром": "Нонбургер Мини с Сыром"
  }
};
for (const [category, m] of Object.entries(R))
  for (const [from, to] of Object.entries(m)) {
    const r = await prisma.product.updateMany({ where: { category, name: from }, data: { name: to } });
    console.log(category + ': ' + from + ' -> ' + to + ' (' + r.count + ')');
  }
console.log('Tayyor!');
await prisma.$disconnect();
