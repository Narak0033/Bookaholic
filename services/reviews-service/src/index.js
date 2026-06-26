require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const reviewsRoutes = require('./routes/reviews.routes');

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'reviews-service' });
});

app.use('/reviews', reviewsRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Reviews service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });