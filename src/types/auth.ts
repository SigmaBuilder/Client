export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  projects?: any[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
