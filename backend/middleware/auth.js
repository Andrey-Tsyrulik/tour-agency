const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: 'Нет токена' });

  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};

module.exports = authMiddleware;