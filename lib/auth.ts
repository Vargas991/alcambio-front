import axios from 'axios';

export async function logout(redirectTo = '/login') {
  await axios.post('/api/auth/logout');
  window.location.href = redirectTo;
}
