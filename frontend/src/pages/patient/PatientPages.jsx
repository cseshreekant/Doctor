import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { ErrorState, getLocalDateString, LoadingState, StatsGrid, StatusBadge } from '../../components/DashboardUI';
import { useToast } from '../../components/Toast';

export function DashboardPage() {
  const [data, setData] = useState({ patient: {}, appointments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/patient/dashboard')
      .then((response) => setData(response.data))
      .catch((requestError) => {
        const message = requestError.response?.data?.message || 'Could not load your dashboard.';
        setError(message);
        toast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <LoadingState>Loading your care overview...</LoadingState>;
  if (error) return <ErrorState>{error}</ErrorState>;

  const appointments = data.appointments || [];
  const upcoming = appointments.filter((item) => ['PENDING', 'CONFIRMED'].includes(item.status) && item.appointmentDate >= getLocalDateString());
  const stats = [
    { label: 'Upcoming visits', value: upcoming.length },
    { label: 'Completed', value: appointments.filter((item) => item.status === 'COMPLETED').length },
    { label: 'Pending', value: appointments.filter((item) => item.status === 'PENDING').length },
    { label: 'Total visits', value: appointments.length }
  ];

  return (
    <div className="page-shell dashboard-shell">
      <div className="dashboard-header"><div><span className="eyebrow muted">Patient space</span><h1>Good to see you, {localStorage.getItem('fullName') || 'there'}.</h1><p>Here’s what’s happening with your care.</p></div><Link to="/doctors" className="btn btn-primary">Find a doctor <span aria-hidden="true">→</span></Link></div>
      <StatsGrid items={stats} />
      <div className="panel-grid two-col">
        <section className="panel"><div className="panel-heading"><div><h2 className="panel-title">Your appointments</h2><p className="panel-subtitle">Keep up with upcoming and past visits.</p></div><Link to="/doctors">Find a doctor</Link></div>
          <div className="appointment-list">
            {appointments.length === 0 && <p className="empty-state">No appointments yet. Browse specialists to plan your first visit.</p>}
            {appointments.map((item) => <article className="appointment-row" key={item.id}><div><strong>{item.doctor?.fullName || 'Doctor visit'}</strong><p>{item.appointmentDate} at {item.startTime}</p></div><StatusBadge status={item.status} /></article>)}
          </div>
        </section>
        <section className="panel"><h2 className="panel-title">Your profile</h2><div className="profile-box"><div className="avatar medium">{data.patient.fullName?.charAt(0) || 'P'}</div><div><h3>{data.patient.fullName || 'Patient profile'}</h3><p>{data.patient.email || 'Your account details'}</p></div></div><Link className="text-link" to="/patient/profile">Manage profile <span aria-hidden="true">→</span></Link></section>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/patient/profile')
      .then((response) => setProfile(response.data))
      .catch((error) => toast(error.response?.data?.message || 'Could not load your profile.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/patient/profile', profile);
      setProfile(data);
      localStorage.setItem('fullName', data.fullName);
      toast('Your profile has been updated.');
    } catch (error) {
      toast(error.response?.data?.message || 'Could not save your profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState>Loading your profile...</LoadingState>;
  if (!profile) return <div className="page-shell"><p className="empty-state">Your profile is unavailable right now.</p></div>;

  return (
    <div className="page-shell auth-shell"><section className="auth-card profile-card">
      <div className="auth-header"><span className="eyebrow muted">Patient space</span><h2>Your profile</h2><p>Keep your details up to date for a smoother visit.</p></div>
      <form onSubmit={saveProfile}>
        <label className="field-group"><span>Full name</span><input required value={profile.fullName || ''} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} /></label>
        <label className="field-group"><span>Email address</span><input type="email" disabled value={profile.email || ''} /></label>
        <label className="field-group"><span>Phone number</span><input required type="tel" value={profile.phoneNumber || ''} onChange={(event) => setProfile({ ...profile, phoneNumber: event.target.value })} /></label>
        <label className="field-group"><span>Date of birth (optional)</span><input type="date" value={profile.dateOfBirth || ''} onChange={(event) => setProfile({ ...profile, dateOfBirth: event.target.value || null })} /></label>
        <label className="field-group"><span>Gender (optional)</span><input value={profile.gender || ''} onChange={(event) => setProfile({ ...profile, gender: event.target.value })} /></label>
        <label className="field-group"><span>Address (optional)</span><textarea value={profile.address || ''} onChange={(event) => setProfile({ ...profile, address: event.target.value })} /></label>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
      </form>
      <p className="helper-text"><Link to="/user">← Back to your dashboard</Link></p>
    </section></div>
  );
}

const PatientPages = { DashboardPage, ProfilePage };
export default PatientPages;
