import axios from 'axios';
import { useAuthStore } from '~/store/app.store';

export const api = axios.create({
  baseURL: 'https://example.com/api',
});

api.interceptors.request.use(async (config) => {
  const token = undefined; // plug token source if available
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);

export default api;

