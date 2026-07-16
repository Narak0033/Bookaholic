import client from './client';

export const getBookReviews = async (bookId, sort = 'recent') => {
  const { data } = await client.get(`/reviews/book/${bookId}`, { params: { sort } });
  return data;
};

export const createReview = async (bookId, bookSnapshot, rating, content, containsSpoilers) => {
  const { data } = await client.post('/reviews', {
    bookId,
    bookSnapshot,
    rating,
    content,
    containsSpoilers,
  });
  return data;
};

export const likeReview = async (reviewId) => {
  const { data } = await client.post(`/reviews/${reviewId}/like`);
  return data;
};

export const getComments = async (reviewId) => {
  const { data } = await client.get(`/reviews/${reviewId}/comments`);
  return data;
};

export const addComment = async (reviewId, content) => {
  const { data } = await client.post(`/reviews/${reviewId}/comments`, { content });
  return data;
};