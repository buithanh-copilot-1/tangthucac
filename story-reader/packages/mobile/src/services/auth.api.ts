import { api } from './api';
import type { User } from '@story-reader/shared';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, email, password }),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  loginWithGoogle: (accessToken: string) =>
    api.post<AuthResponse>('/auth/google', { accessToken }),
  logout: () =>
    api.post<{ message: string }>('/auth/logout'),
};
