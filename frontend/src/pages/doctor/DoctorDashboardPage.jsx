import { useEffect, useState } from 'react';
import api from '../../api';
import { ErrorState, getLocalDateString, LoadingState, StatsGrid, StatusBadge } from '../../components/DashboardUI';
import { useToast } from '../../components/Toast';

const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function DoctorDashboardPage() {
  const [data, setData] = useState({ doctor: {}, appointments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00'
  });
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
  const [activeTab, setActiveTab] = useState('availability');
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

  async function saveAvailability(event) {
    event.preventDefault();
    setSavingAvailability(true);
    try {
      const response = await api.post('/doctor/availability', availabilityForm);
      const availabilities = data.doctor?.availabilities || [];
      setData({
        ...data,
        doctor: {
          ...data.doctor,
          availabilities: [
            ...availabilities.filter((slot) => slot.dayOfWeek !== response.data.dayOfWeek),
            response.data
          ].sort((first, second) => weekdays.indexOf(first.dayOfWeek) - weekdays.indexOf(second.dayOfWeek))
        }
      });
      toast('Weekly hours saved.');
    } catch (requestError) {
      toast(requestError.response?.data?.message || 'Could not save weekly hours.', 'error');
    } finally {
      setSavingAvailability(false);
    }
  }

  async function updateAppointmentStatus(appointment, status) {
    setUpdatingAppointmentId(appointment.id);
    try {
      await api.patch(`/appointments/${appointment.id}/status`, { status });
      setData((current) => ({
        ...current,
        appointments: current.appointments.map((item) => (
          item.id === appointment.id ? { ...item, status } : item
        ))
      }));
      toast(status === 'COMPLETED' ? 'Appointment marked as done.' : `Appointment ${status.toLowerCase()}.`);
    } catch (requestError) {
      toast(requestError.response?.data?.message || 'Could not update appointment status.', 'error');
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  if (loading) return <LoadingState>Loading your practice...</LoadingState>;
  if (error) return <ErrorState>{error}</ErrorState>;

  const appointments = data.appointments || [];
  const availabilities = data.doctor?.availabilities || [];
  const sortedAppointments = [...appointments].sort((first, second) => (
    `${first.appointmentDate}T${first.startTime}`.localeCompare(`${second.appointmentDate}T${second.startTime}`)
  ));
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
      <section className="panel doctor-workspace">
        <div className="dashboard-tabs" role="tablist" aria-label="Doctor workspace sections">
          <button className={`dashboard-tab${activeTab === 'availability' ? ' is-active' : ''}`} type="button" role="tab" aria-selected={activeTab === 'availability'} onClick={() => setActiveTab('availability')}>Weekly availability <span>{availabilities.length}</span></button>
          <button className={`dashboard-tab${activeTab === 'appointments' ? ' is-active' : ''}`} type="button" role="tab" aria-selected={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>All appointments <span>{appointments.length}</span></button>
        </div>
        {activeTab === 'availability' ? (
          <div className="doctor-tab-content" role="tabpanel">
            <div className="panel-heading"><div><h2 className="panel-title">Weekly availability</h2><p className="panel-subtitle">Set the hours patients can book with you.</p></div></div>
            {availabilities.length === 0 ? <p className="empty-state">No hours set yet. Add your clinic hours to accept bookings.</p> : (
              <div className="availability-grid">
                {weekdays.map((day) => {
                  const slot = availabilities.find((item) => item.dayOfWeek === day);
                  return <article className={`availability-card${slot ? '' : ' is-unavailable'}`} key={day}><strong>{day.charAt(0) + day.slice(1).toLowerCase()}</strong><span>{slot ? `${slot.startTime?.slice(0, 5)} – ${slot.endTime?.slice(0, 5)}` : 'Not available'}</span></article>;
                })}
              </div>
            )}
            <form className="availability-form" onSubmit={saveAvailability}>
              <label className="field-group"><span>Day</span><select required value={availabilityForm.dayOfWeek} onChange={(event) => setAvailabilityForm({ ...availabilityForm, dayOfWeek: event.target.value })}>{weekdays.map((day) => <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>)}</select></label>
              <label className="field-group"><span>Start time</span><input type="time" required value={availabilityForm.startTime} onChange={(event) => setAvailabilityForm({ ...availabilityForm, startTime: event.target.value })} /></label>
              <label className="field-group"><span>End time</span><input type="time" required value={availabilityForm.endTime} onChange={(event) => setAvailabilityForm({ ...availabilityForm, endTime: event.target.value })} /></label>
              <button className="btn btn-primary" type="submit" disabled={savingAvailability}>{savingAvailability ? 'Saving...' : 'Save hours'}</button>
            </form>
          </div>
        ) : (
          <div className="doctor-tab-content" role="tabpanel">
            <div className="panel-heading"><div><h2 className="panel-title">All appointments</h2><p className="panel-subtitle">Your complete patient booking list.</p></div><span className="result-count">{appointments.length} total</span></div>
            <div className="appointment-list">
              {sortedAppointments.length === 0 && <p className="empty-state">No appointments have been booked yet.</p>}
              {sortedAppointments.map((item) => <article className="appointment-row doctor-appointment-row" key={item.id}><div className="doctor-appointment-details"><strong>{item.patient?.fullName || 'Patient'}</strong><p>{item.appointmentDate} at {item.startTime?.slice(0, 5)}{item.reason ? ` · ${item.reason}` : ''}</p></div><div className="doctor-appointment-actions"><StatusBadge status={item.status} />{item.status === 'PENDING' && <><button className="btn btn-small btn-enable" type="button" disabled={updatingAppointmentId === item.id} onClick={() => updateAppointmentStatus(item, 'CONFIRMED')}>Accept</button><button className="btn btn-small btn-danger" type="button" disabled={updatingAppointmentId === item.id} onClick={() => updateAppointmentStatus(item, 'REJECTED')}>Decline</button></>}{item.status === 'CONFIRMED' && <button className="btn btn-small btn-enable" type="button" disabled={updatingAppointmentId === item.id} onClick={() => updateAppointmentStatus(item, 'COMPLETED')}>{updatingAppointmentId === item.id ? 'Saving...' : 'Mark done'}</button>}</div></article>)}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
