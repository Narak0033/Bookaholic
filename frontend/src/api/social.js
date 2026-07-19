import client from './client';

export const getClubs = async (search) => {
  const { data } = await client.get('/social/clubs', { params: search ? { search } : {} });
  return data;
};

export const getMyClubs = async () => {
  const { data } = await client.get('/social/clubs/mine');
  return data;
};

export const getClubById = async (id) => {
  const { data } = await client.get(`/social/clubs/${id}`);
  return data;
};

export const createClub = async (clubData) => {
  const { data } = await client.post('/social/clubs', clubData);
  return data;
};

export const joinClub = async (id) => {
  const { data } = await client.post(`/social/clubs/${id}/join`);
  return data;
};

export const leaveClub = async (id) => {
  const { data } = await client.delete(`/social/clubs/${id}/leave`);
  return data;
};

export const getDiscussions = async (clubId) => {
  const { data } = await client.get(`/social/clubs/${clubId}/discussions`);
  return data;
};

export const createDiscussion = async (clubId, title, bookId, bookSnapshot) => {
  const { data } = await client.post(`/social/clubs/${clubId}/discussions`, {
    title,
    bookId,
    bookSnapshot,
  });
  return data;
};

export const getMessages = async (discussionId) => {
  const { data } = await client.get(`/social/discussions/${discussionId}/messages`);
  return data;
};

export const sendMessage = async (discussionId, content, parentMessageId = null) => {
  const { data } = await client.post(`/social/discussions/${discussionId}/messages`, {
    content,
    parentMessageId,
  });
  return data;
};

export const followUser = async (userId) => {
  const { data } = await client.post(`/social/follow/${userId}`);
  return data;
};

export const getFeed = async () => {
  const { data } = await client.get('/social/feed');
  return data;
};

export const unfollowUser = async (userId) => {
  const { data } = await client.delete(`/social/unfollow/${userId}`);
  return data;
};

export const checkFollowing = async (userId) => {
  const { data } = await client.get(`/social/follow/check/${userId}`);
  return data;
};

export const getFollowers = async (userId) => {
  const { data } = await client.get(`/social/followers/${userId}`);
  return data;
};

export const getFollowing = async (userId) => {
  const { data } = await client.get(`/social/following/${userId}`);
  return data;
};

export const updateMessage = async (messageId, content) => {
  const { data } = await client.put(`/social/messages/${messageId}`, { content });
  return data;
};

export const deleteMessage = async (messageId) => {
  const { data } = await client.delete(`/social/messages/${messageId}`);
  return data;
};