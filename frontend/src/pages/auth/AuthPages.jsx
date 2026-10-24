import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { getDashboardPath } from '../../components/routes';
import { useToast } from '../../components/Toast';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('fullName', data.fullName);
      toast(`Welcome back, ${data.fullName || 'there'}.`);
      const returnTo = searchParams.get('returnTo');
      navigate(data.role === 'PATIENT' && returnTo?.startsWith('/') ? returnTo : getDashboardPath(data.role), { replace: true });
    } catch (error) {
      toast(error.response?.data?.message || 'Login failed. Check your email and password.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell auth-shell">
      <section className="auth-card">
        <div className="auth-header"><span className="eyebrow muted">Welcome back</span><h2>Sign in to MediBook</h2><p>Your care dashboard is ready when you are.</p></div>
        <form onSubmit={submit}>
          <label className="field-group"><span>Email address</span><input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
          <label className="field-group"><span>Password</span><input type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Your password" /></label>
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="helper-text">New to MediBook? <Link to={searchParams.get('returnTo') ? `/register?returnTo=${encodeURIComponent(searchParams.get('returnTo'))}` : '/register'}>Create a patient account</Link></p>
      </section>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phoneNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('fullName', data.fullName);
      toast('Your patient account is ready.');
      const returnTo = searchParams.get('returnTo');
      navigate(returnTo?.startsWith('/') ? returnTo : '/user', { replace: true });
    } catch (error) {
      toast(error.response?.data?.message || (error.response ? 'Registration failed. Check the details and try again.' : 'Unable to reach MediBook. Check that the backend is running.'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell auth-shell">
      <section className="auth-card">
        <div className="auth-header"><span className="eyebrow muted">Your care, in one place</span><h2>Create your account</h2><p>Join as a patient to find specialists and manage your visits.</p></div>
        <form onSubmit={submit}>
          <label className="field-group"><span>Full name</span><input autoComplete="name" required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Your full name" /></label>
          <label className="field-group"><span>Email address</span><input autoComplete="email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
          <label className="field-group"><span>Password</span><input autoComplete="new-password" type="password" required minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create a secure password" /><small>At least 8 characters with a letter, a number, and a symbol.</small></label>
          <label className="field-group"><span>Phone number</span><input autoComplete="tel" type="tel" required value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} placeholder="Your phone number" /></label>
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="helper-text">Already have an account? <Link to={searchParams.get('returnTo') ? `/login?returnTo=${encodeURIComponent(searchParams.get('returnTo'))}` : '/login'}>Sign in</Link></p>
      </section>
    </div>
  );
}

const AuthPages = { LoginPage, RegisterPage };
export default AuthPages;
