import { Navigate, Route, Routes } from 'react-router-dom';
import { Footer, Navbar, ProtectedRoute } from './components/AppShell';
import { getDashboardPath } from './components/routes';
import { ToastProvider } from './components/Toast';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AuthPages from './pages/auth/AuthPages';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import PublicPages from './pages/public/PublicPages';
import PatientPages from './pages/patient/PatientPages';

function LandingPage() {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  return token && role ? <Navigate to={getDashboardPath(role)} replace /> : <PublicPages.HomePage />;
}

export default function App() {
  return (
    <ToastProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/doctors" element={<PublicPages.DoctorsPage />} />
          <Route path="/doctors/:id" element={<PublicPages.DoctorDetailPage />} />
          <Route path="/doctors/:id/book" element={<PublicPages.DoctorBookingPage />} />
          <Route path="/login" element={<AuthPages.LoginPage />} />
          <Route path="/register" element={<AuthPages.RegisterPage />} />
          <Route path="/user" element={<ProtectedRoute role="PATIENT"><PatientPages.DashboardPage /></ProtectedRoute>} />
          <Route path="/patient/dashboard" element={<ProtectedRoute role="PATIENT"><PatientPages.DashboardPage /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute role="PATIENT"><PatientPages.ProfilePage /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute role="DOCTOR"><DoctorDashboardPage /></ProtectedRoute>} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="DOCTOR"><DoctorDashboardPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute role="ADMIN"><AdminDoctorsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><AdminUsersPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </ToastProvider>
  );
}
