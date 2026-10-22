import 'dotenv/config';
import fs from 'fs';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const EN = {
  'Шаурма/Лаваш Классик': 'classic chicken shawarma in a lavash wrap',
  'Шаурма/Лаваш Катта': 'large chicken shawarma in a big lavash wrap',
  'Шаурма/Лаваш Мини': 'mini chicken shawarma in a small lavash wrap',
  'Шаурма/Лаваш Сыром': 'chicken shawarma lavash wrap with melted cheese',
  'Шаурма/Лаваш с Котлетой': 'lavash wrap with a meat cutlet, fresh vegetables and sauce',
  'Шаурма/Твистер': 'chicken twister tortilla wrap',
  'Шаурма/Твистер с Сыром': 'chicken twister tortilla wrap with cheese',
  'Бургеры/Гамбургер': 'classic hamburger with beef patty',
  'Бургеры/Чизбургер': 'cheeseburger with melted cheddar',
  'Бургеры/Биг Бургер': 'big double beef burger',
  'Бургеры/Биг Чизбургер': 'big double cheeseburger',
  'Бургеры/Чикен Бургер': 'crispy chicken burger',
  'Бургеры/Чиккен Чизбургер': 'crispy chicken cheeseburger',
  'Хот-Дог/Хот-Дог Классик': 'classic hot dog with sausage, ketchup and mustard',
  'Хот-Дог/Хот-Дог Сыром': 'hot dog with melted cheese',
  'Хот-Дог/Хот-Дог Двойной': 'double sausage hot dog',
  'Хот-Дог/Хот-Дог Двойной с Сыром': 'double sausage hot dog with cheese',
  'Хот-Дог/Хот-Дог Королевский': 'king-size hot dog with onions and sauces',
  'Хот-Дог/Хот-Дог Королевский с Сыром': 'king-size hot dog with cheese',
  'Хот-Дог/Лонгер с Говядиной': 'long sandwich (longer) with beef, vegetables and sauce',
  'Хот-Дог/Лонгер с Курицей': 'long sandwich (longer) with chicken, vegetables and sauce',
  'Нонбургер/Нонбургер Классик': 'burger in round Uzbek flatbread (non) with beef patty and vegetables',
  'Нонбургер/Нонбургер Сыром': 'burger in round Uzbek flatbread (non) with beef patty and melted cheese',
  'Нонбургер/Нонбургер Мини': 'small burger in Uzbek flatbread (non)',
  'Нонбургер/Нонбургер Мини с Сыром': 'small cheese burger in Uzbek flatbread (non)',
  'Нонбургер/Нон Корн': 'corn dog in Uzbek flatbread (non)',
  'Нонбургер/Нон Кофте': 'kofta meatballs in Uzbek flatbread (non) with vegetables',
  'Пицца/Мясной': 'meat pizza with beef and sausage',
  'Пицца/Куриный': 'chicken pizza with mushrooms',
  'Пицца/Ассорти': 'assorted supreme pizza with sausage, chicken and vegetables',
  'Пицца/Пепперони': 'pepperoni pizza',
  'Пицца/Маргарита': 'margherita pizza with basil',
  'Сэндвич/Клаб-Сэндвич с Фри': 'club sandwich served with french fries',
  'Сэндвич/Клаб-Сэндвич с Сыром и Фри': 'cheese club sandwich served with french fries',
  'Крылышки/Крылышки': 'fried chicken wings on a plate',
  'Strips/Стрипсы': 'crispy fried chicken strips',
  'Картошка/Картошка Фри': 'golden french fries in a paper box',
  'Картошка/По-деревенски': 'country-style potato wedges',
  'Соусы/Чесночный': 'small bowl of white garlic sauce',
  'Соусы/Кетчуп': 'small bowl of red ketchup',
  'Соусы/Чили': 'small bowl of red chili sauce',
  'Соусы/Сырный': 'small bowl of yellow cheese sauce',
  'Соусы/Барбекю': 'small bowl of dark barbecue sauce',
  'Напитки/Кола 0.5л': 'bottle of cola with a glass of cola and ice',
  'Напитки/Кофе Чёрный': 'cup of black coffee',
  'Напитки/Три в Одном': 'cup of 3-in-1 coffee',
  'Напитки/Чай Классик': 'glass cup of classic black tea',
  'Напитки/Чай с Лимоном': 'glass cup of tea with a lemon slice',
  'Напитки/Чай с Малиной': 'glass cup of tea with raspberries',
};
const T = (n) => `A professional food photography of ${n}, top-down angle or 45-degree angle, isolated on a clean pure solid white background. Studio lighting, soft shadows, highly detailed, vibrant and appetizing colors, commercial food menu style, 8k resolution, photorealistic --ar 1:1`;
fs.mkdirSync('rasmlar', { recursive: true });
let out = 'HAR BIR SO\'ROVNI RASM YARATUVCHIGA (Midjourney va h.k.) BERING.\nTayyor rasmni "rasmlar" papkasiga RAQAM.png nomi bilan saqlang (masalan 12.png), keyin: node prisma/import-images.js\n\n';
for (const p of await prisma.product.findMany({ orderBy: { id: 'asc' } })) {
  const en = EN[p.category + '/' + p.name] || p.name;
  out += `[${p.id}.png]  ${p.category} - ${p.name}\n${T(en)}\n\n`;
}
fs.writeFileSync('rasmlar/PROMPTLAR.txt', out);
console.log('Tayyor: rasmlar/PROMPTLAR.txt');
await prisma.$disconnect();
