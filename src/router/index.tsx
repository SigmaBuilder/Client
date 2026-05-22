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
        handle: { breadcrumb: "breadcrumbs.projects" },
        children: [
          { index: true, element: <ProjectsList /> },
          {
            path: "account",
            element: <AccountPage />,
            handle: { breadcrumb: "breadcrumbs.account" },
          },
          {
            path: ":id",
            element: <ProjectLayout />,
            handle: {
              breadcrumb: ({ project }: any) => project?.name || "breadcrumbs.projectFallback",
            },
            children: [
              {
                index: true,
                element: <ProjectSitesPage />,
                handle: { breadcrumb: "breadcrumbs.sites" },
              },
              {
                path: "members",
                element: <ProjectMembersPage />,
                handle: { breadcrumb: "breadcrumbs.members" },
              },
              {
                path: "roles",
                element: <ProjectRolesPage />,
                handle: { breadcrumb: "breadcrumbs.roles" },
              },
              { path: "*", element: <DashboardNotFound /> },
            ],
          },
          {
            path: "site/:slug",
            element: <SiteLayout />,
            handle: {
              breadcrumb: ({ site }: any) =>
                site?.name || site?.slug || "breadcrumbs.siteFallback",
            },
            children: [
              {
                index: true,
                element: <SiteHomePage />,
                handle: { breadcrumb: "breadcrumbs.home" },
              },
              { path: "settings", element: <SiteSettings /> },
              {
                path: "pages",
                element: <PagesList />,
                handle: { breadcrumb: "breadcrumbs.pages" },
              },
              {
                path: "pages/new",
                element: <PageEditor />,
                handle: { breadcrumb: "breadcrumbs.newPage" },
              },
              {
                path: "pages/:pageId/edit",
                element: <PageEditor />,
                handle: { breadcrumb: "breadcrumbs.editPage" },
              },
              {
                path: "modules",
                element: <SiteModulesPage />,
                handle: { breadcrumb: "breadcrumbs.modules" },
              },
              {
                path: "docs",
                element: <SiteDocsPage />,
                handle: { breadcrumb: "breadcrumbs.apiDocs" },
              },
              {
                path: "media",
                element: <SiteMediaPage />,
                handle: { breadcrumb: "breadcrumbs.media" },
              },
              {
                path: "portfolio/sections",
                element: <PortfolioSectionsList />,
                handle: { breadcrumb: "breadcrumbs.portfolioSections" },
              },
              {
                path: "portfolio/sections/new",
                element: <PortfolioSectionForm />,
                handle: { breadcrumb: "breadcrumbs.newSection" },
              },
              {
                path: "portfolio/sections/:sectionId/edit",
                element: <PortfolioSectionForm />,
                handle: { breadcrumb: "breadcrumbs.editSection" },
              },
              {
                path: "portfolio/stack",
                element: <PortfolioStackList />,
                handle: { breadcrumb: "breadcrumbs.techStack" },
              },
              {
                path: "portfolio/stack/new",
                element: <PortfolioStackForm />,
                handle: { breadcrumb: "breadcrumbs.newTech" },
              },
              {
                path: "portfolio/stack/:stackId/edit",
                element: <PortfolioStackForm />,
                handle: { breadcrumb: "breadcrumbs.editTech" },
              },
              {
                path: "portfolio/items",
                element: <PortfolioItemsList />,
                handle: { breadcrumb: "breadcrumbs.portfolioProjects" },
              },
              {
                path: "portfolio/items/new",
                element: <PortfolioItemForm />,
                handle: { breadcrumb: "breadcrumbs.newProject" },
              },
              {
                path: "portfolio/items/:itemId/edit",
                element: <PortfolioItemForm />,
                handle: { breadcrumb: "breadcrumbs.editProject" },
              },
              {
                path: "blog",
                handle: { breadcrumb: "breadcrumbs.blog" },
                children: [
                  { index: true, element: <Navigate to="posts" replace /> },
                  {
                    path: "categories",
                    element: <SiteBlogCategoriesPage />,
                    handle: { breadcrumb: "breadcrumbs.categories" },
                  },
                  {
                    path: "posts",
                    element: <SiteBlogPostsPage />,
                    handle: { breadcrumb: "breadcrumbs.posts" },
                  },
                  {
                    path: "posts/new",
                    element: <SiteBlogPostEditorPage />,
                    handle: { breadcrumb: "breadcrumbs.newPost" },
                  },
                  {
                    path: "posts/:postId",
                    element: <SiteBlogPostEditorPage />,
                    handle: { breadcrumb: "breadcrumbs.editPost" },
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
