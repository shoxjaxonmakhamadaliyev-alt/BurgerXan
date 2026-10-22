import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const KEY = process.env.PIXABAY_KEY;
if (!KEY) { console.log('PIXABAY_KEY topilmadi. .env fayliga PIXABAY_KEY="kalit" yozing.'); process.exit(1); }

const CAT = {
  'Шаурма': 'shawarma wrap', 'Бургеры': 'burger', 'Хот-Дог': 'hot dog', 'Нонбургер': 'flatbread sandwich',
  'Пицца': 'pizza', 'Сэндвич': 'club sandwich', 'Крылышки': 'chicken wings', Strips: 'chicken strips',
  'Картошка': 'french fries', 'Соусы': 'dipping sauces', 'Напитки': 'cold drink',
};
const ITEM = {
  'Шаурма/Лаваш Классик': 'shawarma wrap', 'Шаурма/Лаваш Катта': 'large shawarma', 'Шаурма/Лаваш Мини': 'mini shawarma',
  'Шаурма/Лаваш Сыром': 'cheese shawarma', 'Шаурма/Лаваш с Котлетой': 'kebab wrap', 'Шаурма/Твистер': 'chicken twister wrap',
  'Шаурма/Твистер с Сыром': 'tortilla wrap cheese',
  'Бургеры/Гамбургер': 'hamburger', 'Бургеры/Чизбургер': 'cheeseburger', 'Бургеры/Биг Бургер': 'big burger double patty',
  'Бургеры/Биг Чизбургер': 'double cheeseburger', 'Бургеры/Чикен Бургер': 'chicken burger',
  'Бургеры/Чиккен Чизбургер': 'crispy chicken cheeseburger',
  'Хот-Дог/Хот-Дог Классик': 'hot dog', 'Хот-Дог/Хот-Дог Сыром': 'cheese hot dog', 'Хот-Дог/Хот-Дог Двойной': 'double hot dog',
  'Хот-Дог/Хот-Дог Двойной с Сыром': 'double cheese hot dog', 'Хот-Дог/Хот-Дог Королевский': 'sausage hot dog',
  'Хот-Дог/Хот-Дог Королевский с Сыром': 'loaded hot dog', 'Хот-Дог/Лонгер с Говядиной': 'long hot dog beef',
  'Хот-Дог/Лонгер с Курицей': 'chicken sausage sandwich',
  'Нонбургер/Нонбургер Классик': 'flatbread burger', 'Нонбургер/Нонбургер Сыром': 'cheese flatbread sandwich',
  'Нонбургер/Нонбургер Мини': 'mini sandwich', 'Нонбургер/Нонбургер Мини с Сыром': 'mini cheese sandwich',
  'Нонбургер/Нон Корн': 'corn dog', 'Нонбургер/Нон Кофте': 'meatball sandwich',
  'Пицца/Мясной': 'meat pizza', 'Пицца/Куриный': 'chicken pizza', 'Пицца/Ассорти': 'supreme pizza',
  'Пицца/Пепперони': 'pepperoni pizza', 'Пицца/Маргарита': 'margherita pizza',
  'Сэндвич/Клаб-Сэндвич с Фри': 'club sandwich fries', 'Сэндвич/Клаб-Сэндвич с Сыром и Фри': 'cheese sandwich fries',
  'Картошка/По-деревенски': 'potato wedges',
  'Соусы/Чесночный': 'garlic sauce', 'Соусы/Кетчуп': 'ketchup', 'Соусы/Чили': 'chili sauce',
  'Соусы/Сырный': 'cheese sauce', 'Соусы/Барбекю': 'barbecue sauce',
  'Напитки/Кола 0.5л': 'cola glass', 'Напитки/Кофе Чёрный': 'black coffee', 'Напитки/Три в Одном': 'coffee cup',
  'Напитки/Чай Классик': 'black tea cup', 'Напитки/Чай с Лимоном': 'lemon tea', 'Напитки/Чай с Малиной': 'raspberry tea',
};

fs.mkdirSync('uploads', { recursive: true });
const used = new Set();
async function pick(q) {
  const r = await fetch('https://pixabay.com/api/?image_type=photo&orientation=horizontal&safesearch=true&category=food&per_page=30&key=' + KEY + '&q=' + encodeURIComponent(q));
  if (!r.ok) { console.log('Pixabay xatosi', r.status, '(kalit to\'g\'rimi?)'); process.exit(1); }
  const hits = (await r.json()).hits || [];
  const words = q.toLowerCase().split(' ');
  const BAD = /(puppy|rooster|\bhen\b|farm|animal|\bcow\b|\bpet\b|bird|\bcat\b|goat|sheep|pig\b|chicks?\b|poultry|zoo|\bdogs?\b)/i;
  const free = hits.filter((h) => !used.has(h.id) && !BAD.test(h.tags.replace(/hot dog/gi, '')));
  const score = (h) => words.filter((w) => h.tags.toLowerCase().includes(w)).length;
  free.sort((a, b) => score(b) - score(a));
  return free[0] || null;
}

for (const p of await prisma.product.findMany({ where: { category: { not: 'Бургеры' } }, orderBy: { id: 'asc' } })) {
  const own = p.image && !p.image.startsWith('/uploads/cat-') && !p.image.startsWith('/uploads/photo-');
  if (own) continue; // qo'lda yuklangan rasmga tegmaymiz
  const q = ITEM[p.category + '/' + p.name] || CAT[p.category];
  if (!q) continue;
  const hit = await pick(q);
  if (!hit) { console.log('Topilmadi:', p.name, '(' + q + ')'); continue; }
  used.add(hit.id);
  const name = 'photo-' + p.id + '.jpg';
  fs.writeFileSync(path.join('uploads', name), Buffer.from(await (await fetch(hit.webformatURL)).arrayBuffer()));
  await prisma.product.update({ where: { id: p.id }, data: { image: '/uploads/' + name + '?v=' + hit.id } });
  console.log('Yuklandi:', p.name, '<-', q);
}
console.log('Tayyor!');
await prisma.$disconnect();
