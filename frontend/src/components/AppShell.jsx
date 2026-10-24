import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getDashboardPath } from './routes';

export function Navbar() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    navigate('/');
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link className="brand-wrap" to={token ? getDashboardPath(role) : '/'}>
          <span className="brand-icon" aria-hidden="true">+</span>
          <span className="brand-text">MediBook</span>
        </Link>
        <div className="nav-links">
          {!token && <>
            <Link to="/">Home</Link>
            <Link to="/doctors">Find doctors</Link>
            <Link to="/login">Sign in</Link>
            <Link className="btn btn-small btn-primary" to="/register">Get started</Link>
          </>}
          {token && role === 'PATIENT' && <>
            <Link to="/user">Overview</Link>
            <Link to="/doctors">Find doctors</Link>
            <Link to="/patient/profile">My profile</Link>
          </>}
          {token && role === 'DOCTOR' && <Link to="/doctor">My practice</Link>}
          {token && role === 'ADMIN' && <>
            <Link to="/admin">Overview</Link>
            <Link to="/admin/doctors">Doctors</Link>
            <Link to="/admin/users">Users</Link>
          </>}
          {token && <button className="btn btn-small btn-outline" onClick={logout}>Sign out</button>}
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return <footer className="footer"><span>© 2026 MediBook</span><span>Care, made simpler.</span></footer>;
}

export function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const currentRole = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (role && currentRole !== role) {
    return <Navigate to={token && currentRole ? getDashboardPath(currentRole) : '/'} replace />;
  }
  return children;
}
