import axios from 'axios';
import { useAuthStore } from '~/store/app.store';
import { auth } from '~/services/firebase';

export const api = axios.create({
  baseURL: 'https://example.com/api',
});

api.interceptors.request.use(async (config) => {
  try {
    const currentUser = auth.currentUser;
    const token = await currentUser?.getIdToken();
    if (token) {
      // Preserve axios headers object shape to satisfy types
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // noop
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
