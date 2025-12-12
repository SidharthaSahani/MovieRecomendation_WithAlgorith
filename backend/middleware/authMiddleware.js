const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'f05b6b30d7bbea439991a14d275b3fbad07fea3c55d7529ef4f951fcf0fc58aeee764d64db446c665a6039ab87febcbb333617d73701ab6a171ac1211838d3b7';

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;