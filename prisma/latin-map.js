const PH = [
  ['Клаб-Сэндвич с Сыром и Фри', 'Klab-Sendvich Pishloqli va Fri bilan'], ['Клаб-Сэндвич с Фри', 'Klab-Sendvich Fri bilan'],
  ['Хот-Дог Двойной с Сыром', 'Xot-Dog Ikkilangan Pishloqli'], ['Хот-Дог Королевский с Сыром', 'Xot-Dog Qirollik Pishloqli'],
  ['Нонбургер Мини с Сыром', 'Nonburger Mini Pishloqli'], ['Лаваш с Котлетой', 'Lavash Kotletli'],
  ['Лонгер с Говядиной', "Longer Mol go'shtli"], ['Лонгер с Курицей', 'Longer Tovuqli'],
  ['Твистер с Сыром', 'Tvister Pishloqli'], ['Кофе Чёрный', 'Qora kofe'], ['Три в Одном', '3 in 1'],
  ['Чай Классик', 'Klassik choy'], ['Чай с Лимоном', 'Limonli choy'], ['Чай с Малиной', 'Malinali choy'],
  ['Томатный соус', 'Pomidor sousi'], ['По-деревенски', 'Qishloqcha'], ['Кола 0.5л', 'Kola 0.5 l'],
  ['Хот-Дог', 'Xot-Dog'], ['Нонбургер', 'Nonburger'], ['Бургеры', 'Burgerlar'], ['Шаурма', 'Shaurma'], ['Пицца', 'Pitsa'],
  ['Сэндвич', 'Sendvich'], ['Крылышки', 'Qanotchalar'], ['Картошка', 'Kartoshka'], ['Соусы', 'Souslar'], ['Напитки', 'Ichimliklar'],
  ['Лаваш', 'Lavash'], ['Классик', 'Klassik'], ['Катта', 'Katta'], ['Мини', 'Mini'], ['Сыром', 'Pishloqli'],
  ['Твистер', 'Tvister'], ['Гамбургер', 'Gamburger'], ['Чизбургер', 'Chizburger'], ['Биг', 'Big'], ['Бургер', 'Burger'],
  ['Чиккен', 'Chiken'], ['Чикен', 'Chiken'], ['Двойной', 'Ikkilangan'], ['Королевский', 'Qirollik'], ['Нон', 'Non'],
  ['Корн', 'Korn'], ['Кофте', 'Kofte'], ['Мясной', "Go'shtli Pitsa"], ['Куриный', 'Tovuqli Pitsa'], ['Ассорти', 'Assorti Pitsa'],
  ['Пепперони', 'Pepperoni Pitsa'], ['Маргарита', 'Margarita Pitsa'], ['Фри', 'Fri'], ['Стрипсы', 'Strips'], ['Чесночный', 'Sarimsoqli sous'],
  ['Кетчуп', 'Ketchup'], ['Чили', 'Chili sous'], ['Сырный', 'Pishloqli sous'], ['Барбекю', 'Barbekyu sous'], ['Кола', 'Kola'],
  ['Говядина', "Mol go'shti"], ['Колбаса', 'Kolbasa'], ['Моцарелла', 'Mozzarella'], ['Курица', "Tovuq go'shti"],
  ['Грибы', "Qo'ziqorin"], ['Соус', 'Sous'], ['Помидоры', 'Pomidor'], ['Базилик', 'Rayhon'],
].sort((a, b) => b[0].length - a[0].length);
const CH = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 's', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya' };
export const lat = (s) => {
  if (s == null) return s;
  let t = String(s);
  for (const [ru, uz] of PH) t = t.split(ru).join(uz);
  t = t.replace(/[А-Яа-яЁё]/g, (c) => { const l = CH[c.toLowerCase()] ?? c; return c === c.toLowerCase() ? l : l.charAt(0).toUpperCase() + l.slice(1); });
  return t.replace(/\s+/g, ' ').trim();
};
