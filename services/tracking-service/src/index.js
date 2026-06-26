require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const trackingRoutes = require('./routes/tracking.routes');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tracking-service' });
});

app.use('/tracking', trackingRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Tracking service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });