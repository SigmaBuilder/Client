export const API_URL =
  import.meta.env.VITE_API_URL || import.meta.env.PUBLIC_URL_API || "http://localhost:3000/api/v1";

interface ApiResponse<T> {
  success: boolean;
  error?: string | null;
  data?: T | null;
  meta?: any;
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
      // Si el body es FormData, el navegador necesita generar el boundary, no le forzamos application/json
      const isFormData = options.body instanceof FormData;
      const headers = { ...this.getAuthHeaders(), ...options.headers };
      if (isFormData && headers['Content-Type'] === 'application/json') {
        delete (headers as any)['Content-Type'];
      }

      const response = await fetch(`${this.API_URL}/${endpoint}`, {
        credentials: "include",
        ...options,
        headers,
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

      if (response.status === 204) {
        return { success: true, data: null };
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

  async forgotPassword<T>(email: string): Promise<ApiResponse<T>> {
    return this.request<T>("auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword<T>(token: string, newPassword: string): Promise<ApiResponse<T>> {
    return this.request<T>("auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
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

  async updateProfile<T>(body: { first_name?: string; last_name?: string }): Promise<ApiResponse<T>> {
    return this.request<T>("auth/me/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async uploadAvatar<T>(formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>("auth/me/avatar", {
      method: "POST",
      body: formData as any,
    });
  }

  async updateEmail<T>(email: string): Promise<ApiResponse<T>> {
    return this.request<T>("auth/me/email", {
      method: "PATCH",
      body: JSON.stringify({ email }),
    });
  }

  async updatePassword<T>(current_password: string, new_password: string): Promise<ApiResponse<T>> {
    return this.request<T>("auth/me/password", {
      method: "PATCH",
      body: JSON.stringify({ current_password, new_password }),
    });
  }

  async getSessions<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("auth/sessions");
  }

  async deleteSession<T>(sessionId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`auth/sessions/${sessionId}`, { method: "DELETE" });
  }

  async logoutAll<T>(): Promise<ApiResponse<T>> {
    return this.request<T>("auth/logout-all", { method: "POST" });
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

  async getSitePublicDocs<T>(
    slug: string,
    simple = false,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      `public/sites/${slug}/docs?simple=${simple}`,
    );
  }

  async updateSite<T>(
    siteId: string,
    body: {
      name?: string;
      slug?: string;
      status?: "draft" | "public";
      features?: Record<string, any>;
      content?: Record<string, any>;
    },
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
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

  async inviteProjectMember<T>(
    projectId: string,
    email: string,
    roleId: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/members/invite`, {
      method: "POST",
      body: JSON.stringify({ email, roleId }),
    });
  }

  // Invitations
  async getInvitation<T>(token: string): Promise<ApiResponse<T>> {
    return this.request<T>(`invitations/${token}`);
  }

  async acceptInvitation<T>(token: string): Promise<ApiResponse<T>> {
    return this.request<T>(`invitations/${token}/accept`, {
      method: "POST",
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
  // Media
  async getMediaFolders<T>(projectId: string, queryParams = ""): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/media/folders${queryParams}`);
  }

  async createMediaFolder<T>(projectId: string, name: string, parentId: string | null): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/media/folders`, {
      method: "POST",
      body: JSON.stringify({ name, parentId }),
    });
  }

  async getMediaAssets<T>(projectId: string, queryParams = ""): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/media/assets${queryParams}`);
  }

  async uploadMediaAsset<T>(projectId: string, formData: FormData): Promise<ApiResponse<T>> {
    // FormData NO debe llevar header de Content-Type 'application/json' ni ninguno manual para que el browser ponga el boundary
    return this.request<T>(`projects/${projectId}/media/assets/upload`, {
      method: "POST",
      body: formData as any,
    });
  }

  async moveMediaAsset<T>(projectId: string, assetId: string, folderId: string | null): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/media/assets/${assetId}`, {
      method: "PUT",
      body: JSON.stringify({ folderId }),
    });
  }

  async deleteMediaAsset<T>(projectId: string, assetId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/media/assets/${assetId}`, {
      method: "DELETE",
    });
  }

  async deleteMediaFolder<T>(projectId: string, folderId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`projects/${projectId}/media/folders/${folderId}`, {
      method: "DELETE",
    });
  }
  // Portfolio Sections
  async getPortfolioSections<T>(siteId: string, page = 1, limit = 10, search = ""): Promise<ApiResponse<T>> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    return this.request<T>(`sites/${siteId}/modules/portfolio/sections?page=${page}&limit=${limit}${searchParam}`);
  }

  async getPortfolioSection<T>(siteId: string, sectionId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/sections/${sectionId}`);
  }

  async createPortfolioSection<T>(
    siteId: string,
    body: { title: string; content?: any; sort_order?: number }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/sections`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updatePortfolioSection<T>(
    siteId: string,
    sectionId: string,
    body: { title?: string; content?: any; sort_order?: number }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/sections/${sectionId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deletePortfolioSection<T>(siteId: string, sectionId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/sections/${sectionId}`, {
      method: "DELETE",
    });
  }

  // Portfolio Stack
  async getPortfolioStack<T>(siteId: string, page = 1, limit = 20, search = ""): Promise<ApiResponse<T>> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    return this.request<T>(`sites/${siteId}/modules/portfolio/stack?page=${page}&limit=${limit}${searchParam}`);
  }

  async getPortfolioStackItem<T>(siteId: string, stackId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/stack/${stackId}`);
  }

  async createPortfolioStackItem<T>(
    siteId: string,
    body: { name: string; icon_url?: string }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/stack`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updatePortfolioStackItem<T>(
    siteId: string,
    stackId: string,
    body: { name?: string; icon_url?: string }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/stack/${stackId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deletePortfolioStackItem<T>(siteId: string, stackId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/stack/${stackId}`, {
      method: "DELETE",
    });
  }

  // Portfolio Items (Projects)
  async getPortfolioItems<T>(siteId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/items`);
  }

  async getPortfolioItem<T>(siteId: string, itemId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/items/${itemId}`);
  }

  async createPortfolioItem<T>(
    siteId: string,
    body: { title: string; description?: string; image_url?: string; live_url?: string; repository_url?: string; sort_order?: number }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/items`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updatePortfolioItem<T>(
    siteId: string,
    itemId: string,
    body: { title?: string; description?: string; image_url?: string; live_url?: string; repository_url?: string; sort_order?: number }
  ): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deletePortfolioItem<T>(siteId: string, itemId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/portfolio/items/${itemId}`, {
      method: "DELETE",
    });
  }

  // Blog
  async getBlogCategories<T>(siteId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/categories`);
  }

  async createBlogCategory<T>(siteId: string, body: { name: string; slug: string }): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/categories`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateBlogCategory<T>(siteId: string, categoryId: string, body: { name?: string; slug?: string }): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/categories/${categoryId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deleteBlogCategory<T>(siteId: string, categoryId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/categories/${categoryId}`, {
      method: "DELETE",
    });
  }

  async getBlogPosts<T>(siteId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/posts`);
  }

  async getBlogPost<T>(siteId: string, postId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/posts/${postId}`);
  }

  async createBlogPost<T>(siteId: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/posts`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async updateBlogPost<T>(siteId: string, postId: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/posts/${postId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async deleteBlogPost<T>(siteId: string, postId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/modules/blog/posts/${postId}`, {
      method: "DELETE",
    });
  }

  // Site Pages
  async getSitePages<T>(siteId: string, page = 1, limit = 10, search = ""): Promise<ApiResponse<T>> {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    return this.request<T>(`sites/${siteId}/pages?page=${page}&limit=${limit}${searchParam}`);
  }

  async getSitePage<T>(siteId: string, pageId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/pages/${pageId}`);
  }

  async createSitePage<T>(siteId: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/pages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSitePage<T>(siteId: string, pageId: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async setSitePageAsHome<T>(siteId: string, pageId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/pages/${pageId}/set-home`, {
      method: "PATCH",
    });
  }

  async deleteSitePage<T>(siteId: string, pageId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`sites/${siteId}/pages/${pageId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient(API_URL);
export default api;
