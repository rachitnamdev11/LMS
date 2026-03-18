import { verifyJwt } from '../utils/jwt.util.js';
import { ROLES } from '../config/roles.constants.js';
import User from '../models/User.model.js';

export const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJwt(token);

    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return next();
};

export const isStudent = authorizeRoles(ROLES.STUDENT);
export const isTeacher = authorizeRoles(ROLES.TEACHER);
export const isAdmin = authorizeRoles(ROLES.ADMIN);

