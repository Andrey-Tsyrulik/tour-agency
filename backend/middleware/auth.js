const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tour_agency_secret_2024';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Токен не предоставлен' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Неверный или истёкший токен' });
  }
};

module.exports = authMiddleware;
