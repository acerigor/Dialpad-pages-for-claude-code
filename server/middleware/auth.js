const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'coreconnect-dev-secret-change-in-prod';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, initials: user.initials, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { authMiddleware, signToken, JWT_SECRET };
