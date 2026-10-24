import { useEffect, useState } from 'react';
import api from '../../api';
import { ErrorState, getLocalDateString, LoadingState, StatsGrid, StatusBadge } from '../../components/DashboardUI';
import { useToast } from '../../components/Toast';

export default function DoctorDashboardPage() {
  const [data, setData] = useState({ doctor: {}, appointments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/doctor/dashboard')
      .then((response) => setData(response.data))
      .catch((requestError) => {
        const message = requestError.response?.data?.message || 'Could not load your dashboard.';
        setError(message);
        toast(message, 'error');
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <LoadingState>Loading your practice...</LoadingState>;
  if (error) return <ErrorState>{error}</ErrorState>;

  const appointments = data.appointments || [];
  const stats = [
    { label: 'Today', value: appointments.filter((item) => item.appointmentDate === getLocalDateString()).length },
    { label: 'Pending', value: appointments.filter((item) => item.status === 'PENDING').length },
    { label: 'Confirmed', value: appointments.filter((item) => item.status === 'CONFIRMED').length },
    { label: 'Completed', value: appointments.filter((item) => item.status === 'COMPLETED').length }
  ];

  return (
    <div className="page-shell dashboard-shell">
      <div className="dashboard-header"><div><span className="eyebrow muted">Doctor workspace</span><h1>Welcome, {data.doctor?.fullName || localStorage.getItem('fullName') || 'Doctor'}.</h1><p>Your patient schedule, all in one place.</p></div><span className="tag">{data.doctor?.specialization || 'Practice dashboard'}</span></div>
      <StatsGrid items={stats} />
      <section className="panel"><div className="panel-heading"><div><h2 className="panel-title">Appointment schedule</h2><p className="panel-subtitle">Patient bookings and their current status.</p></div><span className="result-count">{appointments.length} total</span></div>
        <div className="appointment-list">
          {appointments.length === 0 && <p className="empty-state">No appointments have been booked yet.</p>}
          {appointments.map((item) => <article className="appointment-row" key={item.id}><div><strong>{item.patient?.fullName || 'Patient'}</strong><p>{item.appointmentDate} at {item.startTime}{item.reason ? ` · ${item.reason}` : ''}</p></div><StatusBadge status={item.status} /></article>)}
        </div>
      </section>
    </div>
  );
}
