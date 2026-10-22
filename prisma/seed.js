import 'dotenv/config';
import pkg from '@prisma/client';
const prisma = new pkg.PrismaClient();
const S = (name, price, ingredients = []) => ({ name, price, variants: [], ingredients });
const V = (name, labels, prices, ingredients = []) => ({ name, price: prices[0], variants: prices.map((p, i) => ({ l: labels[i], p })), ingredients });
const PZ = ['S', 'M', 'L'];
const data = [
  ['Shaurma', [S('Lavash Klassik', 36000), S('Lavash Katta', 40000), S('Lavash Mini', 30000), S('Lavash Pishloqli', 39000), S('Lavash Kotletli', 36000), S('Tvister', 33000), S('Tvister Pishloqli', 36000)]],
  ['Burgerlar', [S('Gamburger', 36000), S('Chizburger', 39000), S('Big Burger', 53000), S('Big Chizburger', 59000), S('Chiken Burger', 33000), S('Chiken Chizburger', 36000)]],
  ['Xot-Dog', [S('Xot-Dog Klassik', 13000), S('Xot-Dog Pishloqli', 16000), S('Xot-Dog Ikkilangan', 16000), S('Xot-Dog Ikkilangan Pishloqli', 19000), S('Xot-Dog Qirollik', 22000), S('Xot-Dog Qirollik Pishloqli', 25000), S('Longer Mol go\'shtli', 36000), S('Longer Tovuqli', 33000)]],
  ['Nonburger', [S('Nonburger Klassik', 36000), S('Nonburger Pishloqli', 39000), S('Nonburger Mini', 30000), S('Nonburger Mini Pishloqli', 33000), S('Non Korn', 33000), S('Non Kofte', 45000)]],
  ['Pitsa', [
    V('Go\'shtli Pitsa', PZ, [70000, 95000, 120000], ['Mol go\'shti', 'Kolbasa', 'Mozzarella', 'Pomidor sousi']),
    V('Tovuqli Pitsa', PZ, [65000, 85000, 105000], ['Tovuq go\'shti', 'Mozzarella', 'Qo\'ziqorin', 'Sous']),
    V('Assorti Pitsa', PZ, [70000, 90000, 110000], ['Kolbasa', 'Tovuq go\'shti', 'Pomidor', 'Mozzarella']),
    V('Pepperoni Pitsa', PZ, [70000, 90000, 110000], ['Pepperoni', 'Mozzarella', 'Pomidor sousi']),
    V('Margarita Pitsa', PZ, [60000, 75000, 90000], ['Mozzarella', 'Pomidor', 'Rayhon', 'Pomidor sousi'])]],
  ['Sendvich', [S('Klab-Sendvich Fri bilan', 40000), S('Klab-Sendvich Pishloqli va Fri bilan', 46000)]],
  ['Qanotchalar', [V('Qanotchalar', ['3x', '5x', '7x', '0.5 kg', '1 kg'], [24000, 35000, 45000, 60000, 120000])]],
  ['Strips', [V('Strips', ['5x', '10x', '0.5 kg', '1 kg'], [25000, 48000, 60000, 120000])]],
  ['Kartoshka', [V('Kartoshka Fri', ['100g', '150g'], [15000, 20000]), V('Qishloqcha', ['100g', '150g'], [15000, 20000])]],
  ['Souslar', ['Sarimsoqli sous', 'Ketchup', 'Chili sous', 'Pishloqli sous', 'Barbekyu sous'].map((n) => S(n, 2000))],
  ['Ichimliklar', [S('Kola 0.5 l', 5000), S('Qora kofe', 10000), S('3 in 1', 10000), S('Klassik choy', 5000), S('Limonli choy', 10000), S('Malinali choy', 10000)]],
];
if ((await prisma.product.count()) > 0) console.log('Menyu allaqachon mavjud.');
else {
  let sort = 0;
  for (const [category, items] of data) for (const it of items) await prisma.product.create({ data: { ...it, category, sort: sort++ } });
  console.log('Menyu yuklandi:', sort, 'ta mahsulot');
}
await prisma.$disconnect();
