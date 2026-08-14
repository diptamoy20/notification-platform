import api from '../../lib/api';

export const fetchUsers = (params) => api.get('/users', { params });
