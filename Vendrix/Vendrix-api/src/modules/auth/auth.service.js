const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

const register = async ({ name, email, password, role }) => {
  if (!name || !email || !password) throw Object.assign(new Error('Name, email and password required'), { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  // Only allow valid roles; default to PROCUREMENT_OFFICER
  const validRoles = ['ADMIN', 'PROCUREMENT_OFFICER', 'MANAGER', 'VENDOR'];
  const assignedRole = validRoles.includes(role) ? role : 'PROCUREMENT_OFFICER';
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: assignedRole },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return { user, token };
};

const login = async ({ email, password }) => {
  if (!email || !password) throw Object.assign(new Error('Email and password required'), { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const { password: _, ...userData } = user;
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return { user: userData, token };
};

const refreshToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const newToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return { token: newToken };
};

module.exports = { register, login, refreshToken };
