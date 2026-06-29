const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: 'Admin not found or deactivated' });
      }
      req.admin = admin;
      req.adminRole = admin.role;
      req.user = { _id: admin._id, email: admin.email, role: admin.role };
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      User.findByIdAndUpdate(decoded.id, { lastActive: new Date() }).catch(() => {});
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type === 'admin') {
        const admin = await Admin.findById(decoded.id).select('-password');
        if (admin) {
          req.admin = admin;
          req.user = { _id: admin._id, email: admin.email, role: 'admin' };
        }
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // silently continue
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
