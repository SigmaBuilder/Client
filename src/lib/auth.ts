import api from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  projects?: any[]; // Incluido al hacer fetch de me()
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const setAuthData = (accessToken: string, user: User) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const login = async (email: string, password: string) => {
  const response = await api.login<AuthResponse>(email, password);
  if (response.success && response.data) {
    setAuthData(response.data.accessToken, response.data.user);
  }
  return response;
};

export const register = async (email: string, password: string, first_name: string, last_name: string) => {
  const response = await api.register<AuthResponse>(email, password, first_name, last_name);
  if (response.success && response.data) {
    setAuthData(response.data.accessToken, response.data.user);
  }
  return response;
};

export const refresh = async () => {
  const response = await api.refresh<{ accessToken: string }>();
  if (response.success && response.data) {
    localStorage.setItem('accessToken', response.data.accessToken);
  } else {
    clearAuthData();
  }
  return response;
};

export const fetchMe = async () => {
  return api.me<{ user: User }>();
};

export const logout = async () => {
  const response = await api.logout();
  clearAuthData();
  return response;
};
