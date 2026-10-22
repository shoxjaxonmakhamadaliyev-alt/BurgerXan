import prisma from '../database/connection.js';
export default {
  listActive: () => prisma.story.findMany({ where: { expiresAt: { gt: new Date() } }, orderBy: { id: 'desc' } }),
  listAll: () => prisma.story.findMany({ orderBy: { id: 'desc' } }),
  create: (data) => prisma.story.create({ data }),
  remove: (id) => prisma.story.delete({ where: { id } }),
};
