export interface Permission {
  id: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  super?: boolean;
  permissions?: Permission[];
}

export interface MemberProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

export interface Member {
  joined_at: string;
  role: Role | null;
  profile: MemberProfile;
}

export interface Site {
  id: string;
  project_id?: string;
  name: string;
  slug: string;
  template_type: string;
  features?: {
    modules?: Record<string, boolean>;
    [key: string]: any;
  };
  content?: any;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface WorkspaceProject {
  joined_at: string;
  project: Project;
  role: Role;
}
