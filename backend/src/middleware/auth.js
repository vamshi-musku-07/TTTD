const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
