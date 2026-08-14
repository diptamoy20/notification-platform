import axios from 'axios';

/**
 * Creates a REST adapter for the notification widget.
 *
 * @param {Object} config
 * @param {string} config.baseUrl - The base URL of the API (e.g. 'http://localhost:5000/api/v1')
 * @returns {Object} The adapter object.
 */
export function createRestAdapter({ baseUrl }) {
  return {
    getUsers: async ({ search = '', page = 1, limit = 20 }) => {
      try {
        const response = await axios.get(`${baseUrl}/users`, {
          params: { search, page, limit },
        });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Network error';
        throw new Error(message);
      }
    },
    
    sendNotification: async ({ userIds, message }) => {
      try {
        const response = await axios.post(`${baseUrl}/notifications/send`, {
          userIds,
          message,
        });
        return response.data;
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Network error';
        throw new Error(message);
      }
    },
  };
}
