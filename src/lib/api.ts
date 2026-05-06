const API_URL = import.meta.env.PUBLIC_URL_API || 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
    success: boolean;
    error?: string | null;
    data?: T | null;
}

class ApiClient {
    API_URL: string;

    constructor(baseUrl:string){
      this.API_URL = baseUrl;
    }

    getAuthHeaders() {
      const token = localStorage.getItem('accessToken');
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      }
    }

    async request<T>(endpoint: string, options: RequestInit = {}, _retry = false): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(`${this.API_URL}/${endpoint}`, {
          credentials: 'include',
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });

        if (response.status === 401 && !_retry && !endpoint.includes('auth/login') && !endpoint.includes('auth/refresh')) {
          const refreshRes = await this.refresh<{ accessToken: string }>();
          if (refreshRes.success && refreshRes.data?.accessToken) {
            localStorage.setItem('accessToken', refreshRes.data.accessToken);
            return this.request<T>(endpoint, options, true);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return { success: false, error: 'Sesión expirada. Por favor, inicia sesión de nuevo.' };
          }
        }

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error || data.message || 'Error en la petición'
          }
        }

        return {
            success: true,
            data: data
        }
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Error en la petición'
            }
        }
    }

    async login<T>(email: string, password: string): Promise<ApiResponse<T>> {
      return this.request<T>('auth/login', {
        method: 'POST',
        body: JSON.stringify({email, password}),
      })
    }

    async register<T>(email: string, password: string, first_name: string, last_name: string): Promise<ApiResponse<T>> {
      return this.request<T>('auth/register', {
        method: 'POST',
        body: JSON.stringify({email, password, first_name, last_name}),
      })
    }

    async refresh<T>(): Promise<ApiResponse<T>> {
      return this.request<T>('auth/refresh', {
        method: 'POST',
      });
    }
}

export const api = new ApiClient(API_URL);
export default api;