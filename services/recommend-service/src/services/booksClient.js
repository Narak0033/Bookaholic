const axios = require('axios');

const BOOKS_URL = process.env.BOOKS_SERVICE_URL || 'http://localhost:5002';

exports.searchByQuery = async (query, maxResults = 20) => {
  const response = await axios.get(
    `${BOOKS_URL}/books/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
  );
  return response.data.books || [];
};