import { createBrowserRouter } from "react-router-dom";
import GlobalLayout from "../layouts/GlobalLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProjectLayout from "../layouts/ProjectLayout";
import SiteLayout from "../layouts/SiteLayout";
import { AuthProvider } from "../hooks/use-auth";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import Landing from "../pages/landing";
import Login from "../pages/login";
import Signup from "../pages/signup";
import { WorkspaceProvider } from "../hooks/use-workspace";
import ProjectsList from "../pages/dashboard";
import ProjectSitesPage from "../pages/dashboard/project-sites";
import ProjectMembersPage from "../pages/dashboard/project-members";
import ProjectRolesPage from "../pages/dashboard/project-roles";
import SiteDashboard from "../pages/dashboard/site-dashboard";
import { InvitePage } from "../pages/invite";
import AccountPage from "../pages/dashboard/account";
import { ResetPasswordPage } from "../pages/reset-password";
import NotFoundPage from "../pages/not-found";
import DashboardNotFound from "../pages/dashboard/not-found";
import ErrorPage from "@/pages/error";
import SiteMediaPage from "@/pages/dashboard/site-media";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <GlobalLayout />
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Landing /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      {
        path: "invite",
        element: (
          <ProtectedRoute>
            <InvitePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <WorkspaceProvider>
              <DashboardLayout />
            </WorkspaceProvider>
          </ProtectedRoute>
        ),
        handle: { breadcrumb: "Proyectos" },
        children: [
          { index: true, element: <ProjectsList /> },
          {
            path: "account",
            element: <AccountPage />,
            handle: { breadcrumb: "Cuenta" },
          },
          {
            path: ":id",
            element: <ProjectLayout />,
            handle: { breadcrumb: ({ project }: any) => project?.name || "Proyecto" },
            children: [
              { index: true, element: <ProjectSitesPage />, handle: { breadcrumb: "Sitios" } },
              {
                path: "members",
                element: <ProjectMembersPage />,
                handle: { breadcrumb: "Miembros" },
              },
              {
                path: "roles",
                element: <ProjectRolesPage />,
                handle: { breadcrumb: "Roles y Permisos" },
              },
              { path: "*", element: <DashboardNotFound /> },
            ],
          },
          {
            path: "site/:slug",
            element: <SiteLayout />,
            handle: { breadcrumb: ({ site }: any) => site?.name || site?.slug || "Sitio" },
            children: [
              { index: true, element: <SiteDashboard /> },
              {
                path: "media",
                element: <SiteMediaPage />,
                handle: { breadcrumb: "Medios" },
              },
            ],
          },
          { path: "*", element: <DashboardNotFound /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
