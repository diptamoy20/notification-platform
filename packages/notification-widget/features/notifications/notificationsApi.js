import api from '../../lib/api';

export const sendNotification = (payload) =>
  api.post('/notifications/send', payload);

export const fetchLogs = (params) => api.get('/notifications/logs', { params });
