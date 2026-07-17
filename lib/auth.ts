import axios from 'axios';

export async function logout() {
  await axios.post('/api/auth/logout');
  window.location.href = '/login';
}