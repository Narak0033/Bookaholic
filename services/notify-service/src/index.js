require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const notifyRoutes = require('./routes/notify.routes');

const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notify-service' });
});

app.use('/notify', notifyRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Notify service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });