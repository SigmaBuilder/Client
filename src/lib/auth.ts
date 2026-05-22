import api from './api';
import { User, AuthResponse } from '../types/auth';

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

export const updateProfile = async (data: { first_name?: string; last_name?: string }) => {
  const response = await api.updateProfile<{ user: User }>(data);
  if (response.success && response.data?.user) {
    const currentToken = getAccessToken();
    if (currentToken) setAuthData(currentToken, response.data.user);
  }
  return response;
};

export const updateEmail = async (email: string) => {
  const response = await api.updateEmail<{ user: User }>(email);
  if (response.success && response.data?.user) {
    const currentToken = getAccessToken();
    if (currentToken) setAuthData(currentToken, response.data.user);
  }
  return response;
};

export const updatePassword = async (current_password: string, new_password: string) => {
  return api.updatePassword<{ message: string }>(current_password, new_password);
};

export const getSessions = async () => {
  return api.getSessions<{ sessions: any[] }>();
};

export const deleteSession = async (sessionId: string) => {
  return api.deleteSession<{ message: string }>(sessionId);
};

export const logoutAll = async () => {
  const response = await api.logoutAll();
  clearAuthData();
  return response;
};

export const logout = async () => {
  const response = await api.logout();
  clearAuthData();
  return response;
};
