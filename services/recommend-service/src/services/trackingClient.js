const axios = require('axios');

const TRACKING_URL = process.env.TRACKING_SERVICE_URL || 'http://localhost:5003';

exports.getFinishedShelf = async (authHeader) => {
  const response = await axios.get(
    `${TRACKING_URL}/tracking/shelf?status=finished`,
    { headers: { Authorization: authHeader } }
  );
  return response.data.shelf || [];
};

exports.getReadingLogs = async (authHeader) => {
  const response = await axios.get(
    `${TRACKING_URL}/tracking/logs`,
    { headers: { Authorization: authHeader } }
  );
  return response.data.logs || [];
};