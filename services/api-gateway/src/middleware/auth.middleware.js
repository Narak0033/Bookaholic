const jwt = require('jsonwebtoken');

// These routes don't need a token
const PUBLIC_ROUTES = [
  { method: 'POST', pattern: /^\/auth\/register$/ },
  { method: 'POST', pattern: /^\/auth\/login$/ },
  { method: 'GET',  pattern: /^\/books\/search/ },
  { method: 'GET',  pattern: /^\/books\/google\// },
  { method: 'GET',  pattern: /^\/books\/[^/]+$/ },
  { method: 'GET',  pattern: /^\/reviews\/book\// },
  { method: 'GET',  pattern: /^\/reviews\/user\// },
  { method: 'GET',  pattern: /^\/reviews\/[^/]+\/comments/ },
  { method: 'GET',  pattern: /^\/social\/clubs/ },
  { method: 'GET',  pattern: /^\/social\/followers\// },
  { method: 'GET',  pattern: /^\/social\/following\// },
  { method: 'GET',  pattern: /^\/social\/activity\// },
  { method: 'GET',  pattern: /^\/social\/discussions\// },
  { method: 'POST', pattern: /^\/social\/activity$/ },
  { method: 'POST', pattern: /^\/notify\/$/ },
  { method: 'POST', pattern: /^\/notify$/ },
];

const isPublic = (method, path) => {
  return PUBLIC_ROUTES.some(
    r => r.method === method && r.pattern.test(path)
  );
};

module.exports = (req, res, next) => {
  if (isPublic(req.method, req.path)) return next();

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Pass userId to downstream services via header
    req.headers['x-user-id'] = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};