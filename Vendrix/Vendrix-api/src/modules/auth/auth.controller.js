const authService = require('./auth.service');
const { success, created, error } = require('../../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    created(res, result, 'Registration successful');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    success(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const { password, ...user } = req.user;
    success(res, user);
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body.token);
    success(res, result);
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, refreshToken };
