import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import api from "../lib/api";
import { Project, Site, WorkspaceProject } from "../types/project";

interface WorkspaceContextType {
  projects: WorkspaceProject[] | null;
  currentProject: Project | null;
  sites: Site[] | null;
  currentSite: Site | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  fetchProjectSites: (projectId: string) => Promise<void>;
  fetchSiteBySlug: (slug: string) => Promise<void>;
  clearWorkspace: () => void;
  setCurrentSite: (site: Site | null) => void;
  setCurrentProject: (project: Project | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<WorkspaceProject[] | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[] | null>(null);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeRequests = useRef({
    projects: 0,
    projectSites: 0,
    site: 0,
  });

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const requestId = ++activeRequests.current.projects;
    try {
      const res = await api.getProjects<{ projects: WorkspaceProject[] }>();
      if (activeRequests.current.projects !== requestId) return;

      if (res.success && res.data) {
        setProjects(res.data.projects || []);
      } else {
        setError(res.error || "Failed to fetch projects");
      }
    } catch (err: any) {
      if (activeRequests.current.projects !== requestId) return;
      setError(err.message || "An error occurred");
    } finally {
      if (activeRequests.current.projects === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchProjectSites = useCallback(
    async (projectId: string) => {
      setIsLoading(true);
      setError(null);
      const requestId = ++activeRequests.current.projectSites;
      try {
        // Intentar establecer el proyecto actual si ya lo tenemos en la lista
        const found = projects?.find((p) => p.project.id === projectId);
        if (found) {
          setCurrentProject(found.project);
        } else {
          // Fetch project if not in list
          const projectRes = await api.getProject<{ project: Project }>(
            projectId,
          );
          if (activeRequests.current.projectSites !== requestId) return;
          if (projectRes.success && projectRes.data?.project) {
            setCurrentProject(projectRes.data.project);
          }
        }

        const res = await api.getProjectSites<{ sites: Site[] }>(projectId);
        if (activeRequests.current.projectSites !== requestId) return;

        if (res.success && res.data) {
          setSites(res.data.sites || []);
        } else {
          setError(res.error || "Failed to fetch sites");
        }
      } catch (err: any) {
        if (activeRequests.current.projectSites !== requestId) return;
        setError(err.message || "An error occurred");
      } finally {
        if (activeRequests.current.projectSites === requestId) {
          setIsLoading(false);
        }
      }
    },
    [projects],
  );

  const fetchSiteBySlug = useCallback(async (slug: string) => {
    if (currentSite && currentSite.slug === slug) return;
    setCurrentSite(null);
    setIsLoading(true);
    setError(null);
    const requestId = ++activeRequests.current.site;
    try {
      // Usamos el nuevo endpoint global que devuelve el site y el project
      const res = await api.getSiteBySlugGlobal<{
        site: Site;
        project?: Project;
      }>(slug, true);

      if (activeRequests.current.site !== requestId) return;

      if (res.success && res.data) {
        setCurrentSite(res.data.site);
        if (res.data.project) {
          setCurrentProject(res.data.project);
        }
      } else {
        setError(res.error || "Failed to fetch site");
      }
    } catch (err: any) {
      if (activeRequests.current.site !== requestId) return;
      setError(err.message || "An error occurred");
    } finally {
      if (activeRequests.current.site === requestId) {
        setIsLoading(false);
      }
    }
  }, [currentSite]);

  const clearWorkspace = useCallback(() => {
    activeRequests.current.projects++;
    activeRequests.current.projectSites++;
    activeRequests.current.site++;
    
    setCurrentProject(null);
    setCurrentSite(null);
    setSites(null);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        currentProject,
        sites,
        currentSite,
        isLoading,
        error,
        fetchProjects,
        fetchProjectSites,
        fetchSiteBySlug,
        clearWorkspace,
        setCurrentSite,
        setCurrentProject,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
