const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    console.log("[ROLE] req.user:", req.user);
    console.log("[ROLE] allowedRoles:", allowedRoles);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = roleMiddleware;

