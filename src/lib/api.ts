const API_URL = import.meta.env.PUBLIC_API_URL;

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

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
      try {
        const response = await fetch(`${this.API_URL}/${endpoint}`, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });

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
}

