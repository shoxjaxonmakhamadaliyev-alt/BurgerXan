import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const KEY = process.env.PIXABAY_KEY;
if (!KEY) { console.log('PIXABAY_KEY topilmadi (.env).'); process.exit(1); }

// To'liq almashtiriladigan bo'limlar
const WHOLE = ['Нонбургер', 'Пицца', 'Сэндвич', 'Крылышки', 'Strips'];
// Alohida almashtiriladigan mahsulotlar
const ONLY = new Set([
  'Шаурма/Лаваш Мини', 'Шаурма/Лаваш Сыром', 'Шаурма/Лаваш с Котлетой',
  'Хот-Дог/Хот-Дог Классик', 'Хот-Дог/Хот-Дог Двойной', 'Хот-Дог/Хот-Дог Королевский',
  'Хот-Дог/Хот-Дог Королевский с Сыром', 'Хот-Дог/Лонгер с Говядиной', 'Хот-Дог/Лонгер с Курицей',
  'Картошка/По-деревенски', 'Соусы/Чесночный', 'Соусы/Чили', 'Соусы/Сырный',
]);
const Q = {
  'Шаурма/Лаваш Мини': ['doner wrap small', 'shawarma sandwich', 'kebab wrap'],
  'Шаурма/Лаваш Сыром': ['chicken wrap cheese', 'shawarma cheese', 'tortilla wrap'],
  'Шаурма/Лаваш с Котлетой': ['meat wrap sandwich', 'kebab wrap', 'doner kebab'],
  'Хот-Дог/Хот-Дог Классик': ['hot dog ketchup mustard', 'hot dog sausage bun'],
  'Хот-Дог/Хот-Дог Двойной': ['two hot dogs', 'hot dogs sausage bun'],
  'Хот-Дог/Хот-Дог Королевский': ['hot dog toppings', 'loaded hot dog'],
  'Хот-Дог/Хот-Дог Королевский с Сыром': ['cheese hot dog bun', 'hot dog cheese sauce'],
  'Хот-Дог/Лонгер с Говядиной': ['sausage in long bun', 'hot dog long bun'],
  'Хот-Дог/Лонгер с Курицей': ['sausage sandwich baguette', 'hot dog baguette'],
  'Нонбургер/Нонбургер Классик': ['sandwich round bread meat', 'burger flatbread', 'pita sandwich meat'],
  'Нонбургер/Нонбургер Сыром': ['cheese sandwich flatbread', 'sandwich round bread cheese'],
  'Нонбургер/Нонбургер Мини': ['mini sandwich bread meat', 'small sandwich bun'],
  'Нонбургер/Нонбургер Мини с Сыром': ['mini cheese sandwich', 'small cheese sandwich bun'],
  'Нонбургер/Нон Корн': ['corn dog', 'corn dogs fried'],
  'Нонбургер/Нон Кофте': ['meatballs sandwich', 'meatball sub bread'],
  'Пицца/Мясной': ['meat pizza', 'pizza sausage ham'],
  'Пицца/Куриный': ['chicken pizza', 'pizza chicken'],
  'Пицца/Ассорти': ['pizza assorted toppings', 'supreme pizza'],
  'Пицца/Пепперони': ['pepperoni pizza', 'pizza salami'],
  'Пицца/Маргарита': ['margherita pizza', 'pizza tomato mozzarella basil'],
  'Сэндвич/Клаб-Сэндвич с Фри': ['club sandwich fries', 'club sandwich'],
  'Сэндвич/Клаб-Сэндвич с Сыром и Фри': ['club sandwich cheese', 'sandwich fries'],
  'Картошка/По-деревенски': ['potato wedges fried', 'country style potatoes fried'],
  'Соусы/Чесночный': ['garlic sauce bowl', 'white sauce dip'],
  'Соусы/Чили': ['chili sauce bowl', 'red hot sauce dip'],
  'Соусы/Сырный': ['cheese sauce dip', 'cheese dip bowl'],
};
const CATQ = { 'Крылышки': ['fried chicken wings', 'buffalo wings plate', 'crispy chicken wings food'], Strips: ['chicken strips fried crispy', 'chicken tenders fried', 'chicken nuggets plate'] };

const BAD = /(puppy|rooster|\bhen\b|farm|animal|\bcow\b|\bpet\b|bird|\bcat\b|goat|sheep|pig\b|chicks?\b|poultry|zoo|\bdogs?\b|cartoon|drawing|vector|illustration)/i;
const used = new Set();
async function search(q) {
  const r = await fetch('https://pixabay.com/api/?image_type=photo&orientation=horizontal&safesearch=true&category=food&per_page=40&key=' + KEY + '&q=' + encodeURIComponent(q));
  if (!r.ok) { console.log('Pixabay xatosi', r.status); process.exit(1); }
  return (await r.json()).hits || [];
}
async function pick(queries, oldId) {
  for (const q of queries) {
    const words = q.toLowerCase().split(' ');
    const hits = (await search(q)).filter((h) => !used.has(h.id) && String(h.id) !== oldId && !BAD.test(h.tags.replace(/hot dog/gi, '')));
    hits.sort((a, b) => words.filter((w) => b.tags.toLowerCase().includes(w)).length - words.filter((w) => a.tags.toLowerCase().includes(w)).length);
    if (hits[0]) return { hit: hits[0], q };
  }
  return null;
}

for (const p of await prisma.product.findMany({ orderBy: { id: 'asc' } })) {
  const key = p.category + '/' + p.name;
  if (!WHOLE.includes(p.category) && !ONLY.has(key)) continue;
  const own = p.image && !p.image.startsWith('/uploads/photo-') && !p.image.startsWith('/uploads/cat-');
  if (own) { console.log('Qo\'lda rasm, tegilmadi:', p.name); continue; }
  const oldId = (p.image || '').split('?v=')[1];
  const res = await pick(Q[key] || CATQ[p.category] || [p.name], oldId);
  if (!res) { console.log('Topilmadi:', p.name); continue; }
  used.add(res.hit.id);
  const name = 'photo-' + p.id + '.jpg';
  fs.writeFileSync(path.join('uploads', name), Buffer.from(await (await fetch(res.hit.webformatURL)).arrayBuffer()));
  await prisma.product.update({ where: { id: p.id }, data: { image: '/uploads/' + name + '?v=' + res.hit.id } });
  console.log('Almashtirildi:', p.name, '<-', res.q, '(' + res.hit.tags + ')');
}
console.log('Tayyor!');
await prisma.$disconnect();
