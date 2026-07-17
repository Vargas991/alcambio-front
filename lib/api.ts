import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/backend',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);