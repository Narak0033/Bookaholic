const axios = require('axios');

const BASE_URL = 'https://www.googleapis.com/books/v1';

const formatBook = (item) => {
  const info = item.volumeInfo || {};
  return {
    googleBooksId: item.id,
    title: info.title || 'Unknown Title',
    authors: info.authors || [],
    description: info.description || '',
    coverImage: info.imageLinks?.thumbnail
      ? info.imageLinks.thumbnail.replace('http://', 'https://')
      : '',
    genres: info.categories || [],
    pageCount: info.pageCount || 0,
    publishedDate: info.publishedDate || '',
    publisher: info.publisher || '',
    isbn: info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || '',
    language: info.language || 'en',
    googleRating: info.averageRating || 0,
    googleRatingsCount: info.ratingsCount || 0,
  };
};

exports.searchBooks = async (query, maxResults = 10, startIndex = 0) => {
  const params = { q: query, maxResults, startIndex, printType: 'books' };
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    params.key = process.env.GOOGLE_BOOKS_API_KEY;
  }

  const response = await axios.get(`${BASE_URL}/volumes`, { params });
  return {
    totalItems: response.data.totalItems || 0,
    books: (response.data.items || []).map(formatBook),
  };
};

exports.getBookById = async (googleBooksId) => {
  const params = {};
  if (process.env.GOOGLE_BOOKS_API_KEY) {
    params.key = process.env.GOOGLE_BOOKS_API_KEY;
  }

  const response = await axios.get(`${BASE_URL}/volumes/${googleBooksId}`, { params });
  return formatBook(response.data);
};