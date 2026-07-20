import client from './client';

export const getShelf = async (status) => {
  const { data } = await client.get('/tracking/shelf', {
    params: status ? { status } : {},
  });
  return data;
};

export const addToShelf = async (bookId, bookSnapshot, status = 'want_to_read') => {
  const { data } = await client.post('/tracking/shelf', {
    bookId,
    bookSnapshot,
    status,
  });
  return data;
};

export const updateShelfEntry = async (bookId, updates) => {
  const { data } = await client.patch(`/tracking/shelf/${bookId}`, updates);
  return data;
};

export const removeFromShelf = async (bookId) => {
  const { data } = await client.delete(`/tracking/shelf/${bookId}`);
  return data;
};

export const getWrapped = async (year) => {
  const { data } = await client.get(`/tracking/wrapped/${year}`);
  return data;
};