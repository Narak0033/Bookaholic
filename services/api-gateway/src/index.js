require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const authMiddleware = require('./middleware/auth.middleware');
const loggerMiddleware = require('./middleware/logger.middleware');

const app = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const SERVICES = {
  auth:      process.env.AUTH_SERVICE_URL      || 'http://localhost:5001',
  books:     process.env.BOOKS_SERVICE_URL     || 'http://localhost:5002',
  tracking:  process.env.TRACKING_SERVICE_URL  || 'http://localhost:5003',
  reviews:   process.env.REVIEWS_SERVICE_URL   || 'http://localhost:5004',
  social:    process.env.SOCIAL_SERVICE_URL    || 'http://localhost:5005',
  recommend: process.env.RECOMMEND_SERVICE_URL || 'http://localhost:5006',
  notify:    process.env.NOTIFY_SERVICE_URL    || 'http://localhost:5007',
};

// Global middleware
app.use(cors());
app.use(loggerMiddleware);

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { message: 'Too many requests, please try again later' }
});
app.use(limiter);

// Gateway health check — pings every service
app.get('/health', async (req, res) => {
  const checks = await Promise.all(
    Object.entries(SERVICES).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        return { name, status: 'up', ...response.data };
      } catch {
        return { name, status: 'down' };
      }
    })
  );

  const allUp = checks.every(c => c.status === 'up');

  res.status(allUp ? 200 : 207).json({
    service: 'api-gateway',
    status: 'up',
    port: PORT,
    services: checks,
    timestamp: new Date().toISOString(),
  });
});

// JWT verification for all routes except public ones
app.use(authMiddleware);

// Proxy options
const proxyOptions = {
  changeOrigin: true,
  logLevel: 'silent',
};

// Route to each service
app.use('/auth',      createProxyMiddleware({ target: SERVICES.auth,      ...proxyOptions }));
app.use('/books',     createProxyMiddleware({ target: SERVICES.books,     ...proxyOptions }));
app.use('/tracking',  createProxyMiddleware({ target: SERVICES.tracking,  ...proxyOptions }));
app.use('/reviews',   createProxyMiddleware({ target: SERVICES.reviews,   ...proxyOptions }));
app.use('/social',    createProxyMiddleware({ target: SERVICES.social,    ...proxyOptions }));
app.use('/recommend', createProxyMiddleware({ target: SERVICES.recommend, ...proxyOptions }));
app.use('/notify',    createProxyMiddleware({ target: SERVICES.notify,    ...proxyOptions }));

// 404 — route not matched
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.path} not found on this gateway` });
});

app.listen(PORT, () => {
  console.log(`\x1b[36m[API Gateway] Running on port ${PORT}\x1b[0m`);
  console.log(`\x1b[36m[API Gateway] Routing to ${Object.keys(SERVICES).length} services\x1b[0m`);
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`  → /${name} → ${url}`);
  });
});