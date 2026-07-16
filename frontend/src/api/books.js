import client from './client';

export const searchBooks = async (query) => {
  const { data } = await client.get(`/books/search`, { params: { q: query } });
  return data;
};

export const createManualBook = async (bookData) => {
  const { data } = await client.post('/books', bookData);
  return data;
};

export const getBookById = async (id) => {
  const { data } = await client.get(`/books/${id}`);
  return data;
};