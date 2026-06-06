const success = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

const created = (res, data, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Something went wrong', status = 500, errors = null) => {
  return res.status(status).json({ success: false, message, ...(errors && { errors }) });
};

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

module.exports = { success, created, error, notFound, unauthorized, forbidden };
