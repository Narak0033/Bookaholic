import client from './client';

export const getRecommendations = async () => {
  const { data } = await client.get('/recommend');
  return data;
};

export const getPreferences = async () => {
  const { data } = await client.get('/recommend/preferences');
  return data;
};