const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');

const log = async ({ userId, action, entity, entityId, details }) => {
  try {
    return await prisma.activityLog.create({
      data: { userId, action, entity, entityId: String(entityId), details },
    });
  } catch (err) {
    // Non-blocking — don't fail the request if logging fails
  }
};

const getLogs = async (user, query) => {
  const { skip, take, page, limit } = paginate(query);
  const where = user.role !== 'ADMIN' ? { userId: user.id } : {};
  if (query.entity) where.entity = query.entity;
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      skip, take, where,
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.activityLog.count({ where }),
  ]);
  return paginatedResponse(logs, total, page, limit);
};

module.exports = { log, getLogs };
