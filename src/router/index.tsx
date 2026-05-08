import { createBrowserRouter } from 'react-router-dom'
import GlobalLayout from '../layouts/GlobalLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import Landing from '../pages/landing'
import DashboardIndex from '../pages/dashboard/index'
import Login from '../pages/dashboard/login'
import Signup from '../pages/dashboard/signup'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardIndex /> }
        ]
      }
    ]
  }
])
