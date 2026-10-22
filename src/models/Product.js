import prisma from '../database/connection.js';
export default {
  listActive: () => prisma.product.findMany({ where: { active: true }, orderBy: [{ sort: 'asc' }, { id: 'asc' }] }),
  listAll: () => prisma.product.findMany({ orderBy: [{ sort: 'asc' }, { id: 'asc' }] }),
  byIds: (ids) => prisma.product.findMany({ where: { id: { in: ids }, active: true } }),
  create: (data) => prisma.product.create({ data: { ...data, sort: 9999 } }),
  update: (id, data) => prisma.product.update({ where: { id }, data }),
  remove: (id) => prisma.product.delete({ where: { id } }),
};
