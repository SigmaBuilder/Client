import { createBrowserRouter, Navigate } from "react-router-dom";
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
import SiteSettings from "../pages/dashboard/site-settings";
import { InvitePage } from "../pages/invite";
import AccountPage from "../pages/dashboard/account";
import { ResetPasswordPage } from "../pages/reset-password";
import NotFoundPage from "../pages/not-found";
import DashboardNotFound from "../pages/dashboard/not-found";
import ErrorPage from "@/pages/error";
import SiteMediaPage from "@/pages/dashboard/site-media";
import PortfolioSectionsList from "../pages/dashboard/site-portfolio/sections-list";
import PortfolioSectionForm from "../pages/dashboard/site-portfolio/section-form";
import PortfolioStackList from "../pages/dashboard/site-portfolio/stack-list";
import PortfolioStackForm from "../pages/dashboard/site-portfolio/stack-form";
import PortfolioItemsList from "../pages/dashboard/site-portfolio/items-list";
import PortfolioItemForm from "../pages/dashboard/site-portfolio/item-form";
import SiteBlogCategoriesPage from "@/pages/dashboard/blog/site-blog-categories";
import SiteBlogPostsPage from "@/pages/dashboard/blog/site-blog-posts";
import SiteBlogPostEditorPage from "@/pages/dashboard/blog/site-blog-post-editor";
import SiteModulesPage from "@/pages/dashboard/site-modules";
import PagesList from "@/pages/dashboard/site-pages/pages-list";
import PageEditor from "@/pages/dashboard/site-pages/page-editor";
import SiteHomePage from "@/pages/dashboard/site-home";
import SiteDocsPage from "@/pages/dashboard/site-docs";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <GlobalLayout />
      </AuthProvider>
    ),
    errorElement: (
      <AuthProvider>
        <ErrorPage />
      </AuthProvider>
    ),
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
            handle: {
              breadcrumb: ({ project }: any) => project?.name || "Proyecto",
            },
            children: [
              {
                index: true,
                element: <ProjectSitesPage />,
                handle: { breadcrumb: "Sitios" },
              },
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
            handle: {
              breadcrumb: ({ site }: any) =>
                site?.name || site?.slug || "Sitio",
            },
            children: [
              {
                index: true,
                element: <SiteHomePage />,
                handle: { breadcrumb: "Inicio" },
              },
              { path: "settings", element: <SiteSettings /> },
              {
                path: "pages",
                element: <PagesList />,
                handle: { breadcrumb: "Páginas" },
              },
              {
                path: "pages/new",
                element: <PageEditor />,
                handle: { breadcrumb: "Nueva Página" },
              },
              {
                path: "pages/:pageId/edit",
                element: <PageEditor />,
                handle: { breadcrumb: "Editar Página" },
              },
              {
                path: "modules",
                element: <SiteModulesPage />,
                handle: { breadcrumb: "Módulos" },
              },
              {
                path: "docs",
                element: <SiteDocsPage />,
                handle: { breadcrumb: "Documentación API" },
              },
              {
                path: "media",
                element: <SiteMediaPage />,
                handle: { breadcrumb: "Medios" },
              },
              {
                path: "portfolio/sections",
                element: <PortfolioSectionsList />,
                handle: { breadcrumb: "Secciones de Portfolio" },
              },
              {
                path: "portfolio/sections/new",
                element: <PortfolioSectionForm />,
                handle: { breadcrumb: "Nueva Sección" },
              },
              {
                path: "portfolio/sections/:sectionId/edit",
                element: <PortfolioSectionForm />,
                handle: { breadcrumb: "Editar Sección" },
              },
              {
                path: "portfolio/stack",
                element: <PortfolioStackList />,
                handle: { breadcrumb: "Stack Tecnológico" },
              },
              {
                path: "portfolio/stack/new",
                element: <PortfolioStackForm />,
                handle: { breadcrumb: "Nueva Tecnología" },
              },
              {
                path: "portfolio/stack/:stackId/edit",
                element: <PortfolioStackForm />,
                handle: { breadcrumb: "Editar Tecnología" },
              },
              {
                path: "portfolio/items",
                element: <PortfolioItemsList />,
                handle: { breadcrumb: "Proyectos" },
              },
              {
                path: "portfolio/items/new",
                element: <PortfolioItemForm />,
                handle: { breadcrumb: "Nuevo Proyecto" },
              },
              {
                path: "portfolio/items/:itemId/edit",
                element: <PortfolioItemForm />,
                handle: { breadcrumb: "Editar Proyecto" },
              },
              {
                path: "blog",
                handle: { breadcrumb: "Blog" },
                children: [
                  { index: true, element: <Navigate to="posts" replace /> },
                  {
                    path: "categories",
                    element: <SiteBlogCategoriesPage />,
                    handle: { breadcrumb: "Categorías" },
                  },
                  {
                    path: "posts",
                    element: <SiteBlogPostsPage />,
                    handle: { breadcrumb: "Posts" },
                  },
                  {
                    path: "posts/new",
                    element: <SiteBlogPostEditorPage />,
                    handle: { breadcrumb: "Nuevo Post" },
                  },
                  {
                    path: "posts/:postId",
                    element: <SiteBlogPostEditorPage />,
                    handle: { breadcrumb: "Editar Post" },
                  },
                ],
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
