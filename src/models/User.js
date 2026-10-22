import prisma from '../database/connection.js';
export default {
  upsert: (tg) => {
    const name = [tg.first_name, tg.last_name].filter(Boolean).join(' ') || 'Mijoz';
    return prisma.user.upsert({ where: { telegramId: BigInt(tg.id) }, update: { name }, create: { telegramId: BigInt(tg.id), name } });
  },
  setPhone: (id, phone) => prisma.user.update({ where: { id }, data: { phone } }),
};
