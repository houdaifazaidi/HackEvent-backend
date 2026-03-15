module.exports = function (req, res, next) {
  console.log(`[MIDDLEWARE] Checking session: ${req.sessionID}, adminId: ${req.session.adminId || 'none'}`);

  if (!req.session.adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};