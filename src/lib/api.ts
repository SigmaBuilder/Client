const API_URL =
  import.meta.env.PUBLIC_URL_API || "http://localhost:3000/api/v1";

interface ApiResponse<T> {
  success: boolean;
  error?: string | null;
  data?: T | null;
}

class ApiClient {
  API_URL: string;

  constructor(baseUrl: string) {
    this.API_URL = baseUrl;
  }

  getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _retry = false,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.API_URL}/${endpoint}`, {
        credentials: "include",
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (
        response.status === 401 &&
        !_retry &&
        !endpoint.includes("auth/login") &&
        !endpoint.includes("auth/refresh")
      ) {
        const refreshRes = await this.refresh<{ accessToken: string }>();
        if (refreshRes.success && refreshRes.data?.accessToken) {
          localStorage.setItem("accessToken", refreshRes.data.accessToken);
          return this.request<T>(endpoint, options, true);
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:expired"));
          }
          return {
            success: false,
            error: "Sesión expirada. Por favor, inicia sesión de nuevo.",
          };
        }
      }

      const body = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: body.error || body.message || "Error en la petición",
        };
      }

      // Si el backend devuelve { success: true, data: ... }, extraemos el data
      const returnData = body && body.data !== undefined ? body.data : body;

      return {
        success: true,
        data: returnData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Error en la petición",
      };
    }
  }

  async login<T>(email: string, password: string): Promise<ApiResponse<T>> {
    return this.request<T>("auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register<T>(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, first_name, last_name }),
    });
  }

  async refresh<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("auth/refresh", {
      method: "POST",
    });
  }

  async me<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("auth/me");
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request("auth/logout", { method: "POST" });
  }

  async getProjects<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("projects");
  }

  async getProject<T>(projectId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}`);
  }

  async createProject<T>(body: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<T>> {
    return this.request<T>("projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getProjectSites<T>(projectId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/sites`);
  }

  async createProjectSite<T>(
    projectId: string,
    body: { name: string; slug: string; template_type?: string },
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/sites`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getSiteBySlugGlobal<T>(
    slug: string,
    includeProject = false,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      `sites/slug/${slug}?includeProject=${includeProject}`,
    );
  }

  // Members
  async getProjectMembers<T>(projectId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/members`);
  }

  async addProjectMember<T>(
    projectId: string,
    userId: string,
    roleId: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId, roleId }),
    });
  }

  async updateProjectMemberRole<T>(
    projectId: string,
    userId: string,
    roleId: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ roleId }),
    });
  }

  async removeProjectMember<T>(
    projectId: string,
    userId: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  // Roles
  async getProjectRoles<T>(projectId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/roles`);
  }

  async getProjectAllPermissions<T>(
    projectId: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/roles/permissions`);
  }

  async createProjectRole<T>(
    projectId: string,
    body: { name: string; description?: string; permissionIds?: string[] },
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/roles`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateProjectRole<T>(
    projectId: string,
    roleId: string,
    body: { name?: string; description?: string },
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/roles/${roleId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deleteProjectRole<T>(
    projectId: string,
    roleId: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/roles/${roleId}`, {
      method: "DELETE",
    });
  }

  async setRolePermissions<T>(
    projectId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      `projects/${projectId}/roles/${roleId}/permissions`,
      {
        method: "PATCH",
        body: JSON.stringify({ permissionIds }),
      },
    );
  }
}

export const api = new ApiClient(API_URL);
export default api;
