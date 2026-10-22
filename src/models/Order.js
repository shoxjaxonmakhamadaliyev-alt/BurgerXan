import prisma from '../database/connection.js';
export default {
  create: (data) => prisma.order.create({ data }),
  byUser: (userId) => prisma.order.findMany({ where: { userId }, orderBy: { id: 'desc' }, take: 20 }),
  listAll: () => prisma.order.findMany({ include: { user: true }, orderBy: { id: 'desc' }, take: 200 }),
  setStatus: (id, status) => prisma.order.update({ where: { id }, data: { status }, include: { user: true } }),
};
