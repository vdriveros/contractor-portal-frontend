import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

//Client pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjectDetail from './pages/client/ClientProjectDetail';

// Clients routes
import ClientList from './pages/clients/ClientList';
import ClientCreate from './pages/clients/ClientCreate';
import ClientEdit from './pages/clients/ClientEdit';

// Projects routes
import ProjectList from './pages/projects/ProjectList.jsx'
import ProjectCreate from './pages/projects/ProjectCreate.jsx'
import ProjectEdit from './pages/projects/ProjectEdit.jsx'

// Users routes
import UserList from './pages/users/UserList.jsx'
import UserCreate from './pages/users/UserCreate.jsx'
import UserEdit from './pages/users/UserEdit.jsx'

// Component to redirect based on role
function RoleBasedRedirect() {
  const { user } = useAuth();

  if (user?.role === 'client') {
    return <Navigate to="/client/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
          />

          {/* Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
          />

          {/* Client Routes */}
          <Route path="/client/dashboard" element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientDashboard />
            </ProtectedRoute>
          }
          />
          <Route path="/client/projects/:id" element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientProjectDetail />
            </ProtectedRoute>
          }
          />

          {/* Contractor Client Routes */}
          <Route path="/clients" element={
            <ProtectedRoute>
              <ClientList />
            </ProtectedRoute>
          }
          />
          <Route path="/clients/create" element={
            <ProtectedRoute>
              <ClientCreate />
            </ProtectedRoute>
          }
          />
          <Route path="/clients/:id/edit" element={
            <ProtectedRoute>
              <ClientEdit />
            </ProtectedRoute>
          }
          />

          {/* Contractor Project Routes */}
          <Route path="/projects" element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
          />
          <Route path="/projects/create" element={
            <ProtectedRoute>
              <ProjectCreate />
            </ProtectedRoute>
          }
          />
          <Route path="/projects/:id/edit" element={
            <ProtectedRoute>
              <ProjectEdit />
            </ProtectedRoute>
          }
          />

          {/* Contractor User Routes */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['contractor']}>
              <UserList />
            </ProtectedRoute>
          }
          />
          <Route path="/users/create" element={
            <ProtectedRoute allowedRoles={['contractor']}>
              <UserCreate />
            </ProtectedRoute>
          }
          />
          <Route path="/users/:id/edit" element={
            <ProtectedRoute allowedRoles={['contractor']}>
              <UserEdit />
            </ProtectedRoute>
          }
          />

          {/* Root redirect */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;