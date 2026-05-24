import { createBrowserRouter, Navigate } from "react-router-dom";
import GlobalLayout from "@/layouts/GlobalLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProjectLayout from "@/features/project/layouts/ProjectLayout";
import SiteLayout from "@/features/site/layouts/SiteLayout";
import { AuthProvider } from "@/features/auth/hooks/use-auth";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import Landing from "@/features/landing/pages/landing";
import Login from "@/features/auth/pages/login";
import Signup from "@/features/auth/pages/signup";
import { WorkspaceProvider } from "@/hooks/use-workspace";
import ProjectsList from "@/features/project/pages/projects-list";
import ProjectSitesPage from "@/features/project/pages/project-sites";
import ProjectMembersPage from "@/features/project/pages/project-members";
import ProjectRolesPage from "@/features/project/pages/project-roles";
import SiteSettings from "@/features/site/pages/site-settings";
import { InvitePage } from "@/features/auth/pages/invite";
import AccountPage from "@/features/account/pages/index";
import { ResetPasswordPage } from "@/features/auth/pages/reset-password";
import NotFoundPage from "@/components/shared/pages/not-found";
import DashboardNotFound from "@/components/shared/pages/dashboard-not-found";
import ErrorPage from "@/components/shared/pages/error";
import SiteMediaPage from "@/features/site/pages/site-media";
import PortfolioSectionsList from "@/features/site-portfolio/pages/sections-list";
import PortfolioSectionForm from "@/features/site-portfolio/pages/section-form";
import PortfolioStackList from "@/features/site-portfolio/pages/stack-list";
import PortfolioStackForm from "@/features/site-portfolio/pages/stack-form";
import PortfolioItemsList from "@/features/site-portfolio/pages/items-list";
import PortfolioItemForm from "@/features/site-portfolio/pages/item-form";
import SiteBlogCategoriesPage from "@/features/site-blog/pages/site-blog-categories";
import SiteBlogPostsPage from "@/features/site-blog/pages/site-blog-posts";
import SiteBlogPostEditorPage from "@/features/site-blog/pages/site-blog-post-editor";
import SiteModulesPage from "@/features/site/pages/site-modules";
import PagesList from "@/features/site-pages/pages/pages-list";
import PageEditor from "@/features/site-pages/pages/page-editor";
import SiteHomePage from "@/features/site/pages/site-home";
import SiteDocsPage from "@/features/site/pages/site-docs";

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
