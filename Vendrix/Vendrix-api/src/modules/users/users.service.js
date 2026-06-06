const prisma = require('../../config/db');
const { paginate, paginatedResponse } = require('../../utils/pagination');

const getAllUsers = async (query) => {
  const { skip, take, page, limit } = paginate(query);
  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip, take, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.user.count(),
  ]);
  return paginatedResponse(users, total, page, limit);
};

const getUserById = async (id) => {
  return prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
};

const updateUser = async (id, data) => {
  const { password, ...safe } = data;
  return prisma.user.update({ where: { id }, data: safe, select: { id: true, name: true, email: true, role: true } });
};

const deleteUser = async (id) => {
  return prisma.user.delete({ where: { id } });
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
