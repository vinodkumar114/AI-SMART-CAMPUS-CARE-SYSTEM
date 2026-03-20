import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Component imports
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import AdminDashboard from './pages/AdminDashboard';

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-2xl font-extrabold text-gray-900">Unauthorized</div>
      <div className="mt-2 text-gray-600">You don’t have access to that page.</div>
    </div>
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <div className="app-container min-h-screen bg-background text-gray-800 font-sans">
      <Routes>
        <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['counselor']} />}>
          <Route path="/counselor/dashboard" element={<CounselorDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Redirect empty paths */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
