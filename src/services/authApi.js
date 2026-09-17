import { apiRequest } from './api';

const LOGIN_PATH = process.env.EXPO_PUBLIC_LOGIN_PATH || '/auth/login';

export async function login(email, password) {
  try {
    return await apiRequest(LOGIN_PATH, {
      method: 'POST',
      body: { email, password },
    });
  } catch (error) {
    if (error?.status === 404) {
      error.message = `Login endpoint was not found: ${LOGIN_PATH}`;
    }
    throw error;
  }
}