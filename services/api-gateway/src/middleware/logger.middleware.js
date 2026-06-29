module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(
      `${color}[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)${reset}`
    );
  });

  next();
};