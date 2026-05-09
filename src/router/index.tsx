import { createBrowserRouter } from 'react-router-dom'
import GlobalLayout from '../layouts/GlobalLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import { AuthProvider } from '../hooks/use-auth'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import Landing from '../pages/landing'
import DashboardIndex from '../pages/dashboard/index'
import Login from '../pages/login'
import Signup from '../pages/signup'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthProvider><GlobalLayout /></AuthProvider>,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: <DashboardIndex /> }
            ]
          }
        ]
      }
    ]
  }
])
