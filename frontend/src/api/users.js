import client from './client';

export const getUsersByIds = async (userIds) => {
  const { data } = await client.post('/auth/users/batch', { userIds });
  return data;
};