const Admin = require('../models/Admin');

const adminOnly = async (req, res, next) => {
  if (req.user?.role === 'admin') {
    const admin = await Admin.findOne({ email: req.user.email });
    if (admin) {
      req.admin = admin;
      req.adminRole = admin.role;
    } else {
      req.adminRole = 'admin';
    }
    return next();
  }

  if (req.user?.role === 'super_admin' || req.user?.role === 'moderator') {
    req.admin = req.user;
    req.adminRole = req.user.role;
    return next();
  }

  return res.status(403).json({ message: 'Access denied. Admin only.' });
};

const superAdminOnly = (req, res, next) => {
  if (req.adminRole !== 'super_admin' && req.adminRole !== 'admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

module.exports = { adminOnly, superAdminOnly };
