import client from './client';

export const getNotifications = async (page = 1) => {
  const { data } = await client.get('/notify', { params: { page } });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await client.get('/notify/unread-count');
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await client.patch(`/notify/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await client.patch('/notify/read-all');
  return data;
};

export const clearAllNotifications = async () => {
  const { data } = await client.delete('/notify/clear-all');
  return data;
};