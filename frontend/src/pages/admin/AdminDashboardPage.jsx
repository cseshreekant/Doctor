import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { ErrorState, LoadingState, StatsGrid, StatusBadge } from '../../components/DashboardUI';
import { useToast } from '../../components/Toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((response) => setStats(response.data))
      .catch((requestError) => {
        const message = requestError.response?.data?.message || 'Could not load the admin dashboard.';
        setError(message);
        toast(message, 'error');
      });
  }, [toast]);

  if (error) return <ErrorState>{error}</ErrorState>;
  if (!stats) return <LoadingState>Loading administration overview...</LoadingState>;

  const summary = [
    { label: 'Patients', value: stats.totalPatients },
    { label: 'Active doctors', value: stats.totalDoctors },
    { label: 'Appointments', value: stats.totalAppointments },
    { label: 'Pending', value: stats.pendingAppointments }
  ];

  return (
    <div className="page-shell dashboard-shell">
      <div className="dashboard-header"><div><span className="eyebrow muted">Administration</span><h1>System overview</h1><p>A clear picture of your care network.</p></div><div className="header-actions"><Link to="/admin/users" className="btn btn-secondary">View users</Link><Link to="/admin/doctors" className="btn btn-primary">Add a doctor <span aria-hidden="true">→</span></Link></div></div>
      <StatsGrid items={summary} />
      <section className="panel"><div className="panel-heading"><div><h2 className="panel-title">Recent appointments</h2><p className="panel-subtitle">Latest activity across MediBook.</p></div><Link to="/admin/doctors">Manage doctors</Link></div>
        <div className="table-list">
          {(stats.recentAppointments || []).length === 0 && <p className="empty-state">Appointments will appear here when patients book a visit.</p>}
          {(stats.recentAppointments || []).map((item) => <article className="table-row" key={item.id}><div><strong>{item.patient?.fullName || 'Patient'}</strong><p>{item.doctor?.fullName || 'Doctor'}</p></div><div><strong>{item.appointmentDate}</strong><p>{item.startTime}</p></div><StatusBadge status={item.status} /></article>)}
        </div>
      </section>
    </div>
  );
}
