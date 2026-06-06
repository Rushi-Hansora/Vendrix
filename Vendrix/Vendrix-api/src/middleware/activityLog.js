const { log } = require('../modules/activityLog/activityLog.service');

/**
 * Auto-logs every mutating request (POST/PUT/PATCH/DELETE) to the ActivityLog table.
 * Attach AFTER authenticate middleware so req.user is available.
 */
const activityLogger = (entity) => async (req, res, next) => {
  // Only log mutations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  if (!req.user) return next();

  // Intercept the response to capture the entity ID after creation
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    try {
      const entityId = body?.data?.id || req.params?.id || 'unknown';
      const action = `${req.method} ${req.path}`;
      await log({
        userId: req.user.id,
        action,
        entity,
        entityId: String(entityId),
        details: { method: req.method, path: req.path, status: res.statusCode },
      });
    } catch (_) {
      // Non-blocking
    }
    return originalJson(body);
  };

  next();
};

module.exports = { activityLogger };
