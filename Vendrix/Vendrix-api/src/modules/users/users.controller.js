const usersService = require('./users.service');
const { success, notFound } = require('../../utils/apiResponse');

const getAllUsers = async (req, res, next) => {
  try { success(res, await usersService.getAllUsers(req.query)); } catch (err) { next(err); }
};
const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) return notFound(res);
    success(res, user);
  } catch (err) { next(err); }
};
const updateUser = async (req, res, next) => {
  try { success(res, await usersService.updateUser(req.params.id, req.body)); } catch (err) { next(err); }
};
const deleteUser = async (req, res, next) => {
  try { await usersService.deleteUser(req.params.id); success(res, null, 'User deleted'); } catch (err) { next(err); }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
