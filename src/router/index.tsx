import { createBrowserRouter } from 'react-router-dom'
import GlobalLayout from '../layouts/GlobalLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProjectLayout from '../layouts/ProjectLayout'
import { AuthProvider } from '../hooks/use-auth'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import Landing from '../pages/landing'
import Login from '../pages/login'
import Signup from '../pages/signup'
import { WorkspaceProvider } from '../hooks/use-workspace'
import ProjectsList from '../pages/dashboard'
import ProjectSitesPage from '../pages/dashboard/project-sites'
import ProjectMembersPage from '../pages/dashboard/project-members'
import ProjectRolesPage from '../pages/dashboard/project-roles'
import SiteDashboard from '../pages/dashboard/site-dashboard'
import { InvitePage } from '../pages/invite'
import AccountPage from '../pages/dashboard/account'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthProvider><GlobalLayout /></AuthProvider>,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      {
        path: 'invite',
        element: <ProtectedRoute><InvitePage /></ProtectedRoute>
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><WorkspaceProvider><DashboardLayout /></WorkspaceProvider></ProtectedRoute>,
        children: [
              { index: true, element: <ProjectsList /> },
              { path: 'account', element: <AccountPage /> },
              {
                path: ':id',
                element: <ProjectLayout />,
                children: [
                  { index: true, element: <ProjectSitesPage /> },
                  { path: 'members', element: <ProjectMembersPage /> },
                  { path: 'roles', element: <ProjectRolesPage /> },
                ],
              },
              { path: 'site/:slug', element: <SiteDashboard /> },
            ],
      },
    ],
  },
])
