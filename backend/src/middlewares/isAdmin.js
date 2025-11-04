const isAdmin = (req, res, next) => {
  // Check if authenticated user's role is admin (role 1)
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: "Access denied: Admins only." });
  }
  next();
};

module.exports = isAdmin;