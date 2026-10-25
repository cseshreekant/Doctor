import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { LoadingState } from '../../components/DashboardUI';
import DoctorAvatar from '../../components/DoctorAvatar';
import { useToast } from '../../components/Toast';

const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function getBookableDates(availabilities) {
  const scheduleByDay = new Map((availabilities || []).map((slot) => [slot.dayOfWeek, slot]));
  const today = new Date();

  return Array.from({ length: 60 }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const dayOfWeek = weekdays[date.getDay()];
    const schedule = scheduleByDay.get(dayOfWeek);
    if (!schedule) return null;

    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { value, dayOfWeek, schedule };
  }).filter(Boolean);
}

function getBookableTimes(schedule) {
  if (!schedule) return [];
  const toMinutes = (value) => {
    const [hours, minutes] = value.slice(0, 5).split(':').map(Number);
    return hours * 60 + minutes;
  };
  const start = toMinutes(schedule.startTime);
  const end = toMinutes(schedule.endTime);
  const times = [];

  for (let time = start; time + 30 <= end; time += 30) {
    times.push(`${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`);
  }
  return times;
}

export function HomePage() {
  return (
    <div className="page-shell landing-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Thoughtful care, simply booked</span>
          <h1>Make time for your health.</h1>
          <p>Find trusted specialists, choose a time that works, and keep every visit in one calm, clear place.</p>
          <div className="hero-actions">
            <Link to="/doctors" className="btn btn-primary">Explore doctors <span aria-hidden="true">→</span></Link>
            <Link to="/register" className="btn btn-secondary">Create patient account</Link>
          </div>
          <div className="hero-note"><span className="note-dot" /> A more considered way to manage your care</div>
        </div>
        <div className="hero-art" aria-label="DoctorBook healthcare services">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-cross">+</div>
          <div className="art-card">
            <span className="art-kicker">Your next step</span>
            <strong>Care that fits your life.</strong>
            <span className="art-line" />
            <span className="art-caption">Find a specialist and get started.</span>
          </div>
          <span className="art-caption-floating">Here for your wellbeing</span>
        </div>
      </section>

      <section className="landing-intro">
        <div><span className="eyebrow muted">A better care experience</span><h2>From finding care to feeling cared for.</h2></div>
        <p>Less time searching. More confidence in the care you choose.</p>
      </section>
      <section className="grid three">
        <article className="card feature-card"><span className="feature-number">01</span><h3>Find your specialist</h3><p>Compare doctor profiles, qualifications, and consultation fees with ease.</p></article>
        <article className="card feature-card"><span className="feature-number">02</span><h3>Plan your visit</h3><p>Review available appointment times and keep your booking details together.</p></article>
        <article className="card feature-card"><span className="feature-number">03</span><h3>Stay in the loop</h3><p>See appointment updates and your visit history from one simple dashboard.</p></article>
      </section>
    </div>
  );
}

export function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/doctors')
      .then((response) => setDoctors(response.data.content || response.data || []))
      .catch((error) => toast(error.response?.data?.message || 'Could not load doctors. Check that the backend is running.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <LoadingState>Finding available doctors...</LoadingState>;

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div><span className="eyebrow muted">Care directory</span><h2>Meet your specialists</h2><p>Find the right experience for your health needs.</p></div>
        <span className="result-count">{doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'}</span>
      </div>
      {doctors.length === 0 ? <p className="empty-state">No doctors are available right now.</p> : (
        <div className="grid three">
          {doctors.map((doctor) => (
            <article className="card doctor-card" key={doctor.id}>
              <div className="doctor-card-top"><DoctorAvatar doctor={doctor} /><span className="tag">{doctor.specialization}</span></div>
              <h3>{doctor.fullName}</h3>
              <p className="meta">{doctor.qualification}</p>
              <p className="meta">{doctor.yearsOfExperience} years of experience</p>
              <div className="doctor-footer"><strong>₹{doctor.consultationFee}</strong><Link to={`/doctors/${doctor.id}`}>View profile <span aria-hidden="true">→</span></Link></div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then((response) => setDoctor(response.data))
      .catch((error) => toast(error.response?.data?.message || 'Could not load this doctor profile.', 'error'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  if (loading) return <LoadingState>Loading doctor profile...</LoadingState>;
  if (!doctor) return <div className="page-shell"><Link className="text-link" to="/doctors">← Back to doctors</Link></div>;

  return (
    <div className="page-shell detail-shell">
      <article className="detail-card">
        <Link className="text-link back-link" to="/doctors">← All specialists</Link>
        <div className="detail-hero">
          <DoctorAvatar doctor={doctor} size="large" />
          <span className="eyebrow muted">Doctor profile</span>
          <h2>{doctor.fullName}</h2>
          <span className="tag">{doctor.specialization}</span>
        </div>
        <div className="detail-grid">
          <div className="detail-facts"><p><strong>Qualification</strong><span>{doctor.qualification}</span></p><p><strong>Experience</strong><span>{doctor.yearsOfExperience} years</span></p><p><strong>Consultation fee</strong><span>₹{doctor.consultationFee}</span></p></div>
          <div className="detail-facts"><strong>Availability</strong>{doctor.availabilities?.length ? doctor.availabilities.map((slot) => <p key={slot.id}><span>{slot.dayOfWeek}: {slot.startTime?.slice(0, 5)} – {slot.endTime?.slice(0, 5)}</span></p>) : <p><span>Availability has not been set yet.</span></p>}</div>
        </div>
        <p className="description">{doctor.description || 'Experienced doctor focused on patient care and treatment planning.'}</p>
        <div className="detail-actions"><Link className="btn btn-primary" to={`/doctors/${doctor.id}/book`}>Book appointment</Link><Link className="btn btn-secondary" to="/doctors">Back to doctors</Link></div>
      </article>
    </div>
  );
}

export function DoctorBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`appointment-draft-${id}`);
      return saved ? JSON.parse(saved) : { appointmentDate: '', startTime: '', reason: '' };
    } catch {
      return { appointmentDate: '', startTime: '', reason: '' };
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const bookableDates = getBookableDates(doctor?.availabilities);
  const selectedDate = bookableDates.find((date) => date.value === form.appointmentDate);
  const bookableTimes = getBookableTimes(selectedDate?.schedule);

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then((response) => setDoctor(response.data))
      .catch((error) => toast(error.response?.data?.message || 'Could not load this doctor profile.', 'error'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => {
    if (!doctor) return;
    const dates = getBookableDates(doctor.availabilities);
    const date = dates.find((item) => item.value === form.appointmentDate) || dates[0];
    const times = getBookableTimes(date?.schedule);
    const startTime = times.includes(form.startTime) ? form.startTime : times[0] || '';
    if (date?.value !== form.appointmentDate || startTime !== form.startTime) {
      setForm((current) => ({ ...current, appointmentDate: date?.value || '', startTime }));
    }
  }, [doctor]);

  async function submit(event) {
    event.preventDefault();
    if (!token || role !== 'PATIENT') {
      sessionStorage.setItem(`appointment-draft-${id}`, JSON.stringify(form));
      navigate(`/login?returnTo=${encodeURIComponent(`/doctors/${id}/book`)}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        doctorId: Number(id),
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        reason: form.reason
      });
      sessionStorage.removeItem(`appointment-draft-${id}`);
      toast('Appointment request sent successfully.');
      navigate('/user');
    } catch (error) {
      toast(error.response?.data?.message || 'Could not book this appointment. Check availability and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState>Preparing your appointment...</LoadingState>;
  if (!doctor) return <div className="page-shell"><Link className="text-link" to="/doctors">← Back to doctors</Link></div>;

  if (token && role !== 'PATIENT') {
    return <div className="page-shell"><section className="panel booking-panel"><span className="eyebrow muted">Patient booking</span><h1 className="booking-title">Appointments are for patient accounts.</h1><p className="panel-subtitle">You are signed in with a {String(role || 'different').toLowerCase()} account. Sign out and use a patient account to book with {doctor.fullName}.</p><div className="detail-actions"><Link className="btn btn-primary" to="/doctors">Continue browsing</Link></div></section></div>;
  }

  return (
    <div className="page-shell booking-shell">
      <section className="panel booking-panel">
        <Link className="text-link back-link" to={`/doctors/${doctor.id}`}>← Back to doctor</Link>
        <span className="eyebrow muted">Appointment request</span>
        <h1 className="booking-title">Book with {doctor.fullName}</h1>
        <p className="panel-subtitle">{doctor.specialization} · Consultation fee ₹{doctor.consultationFee}</p>
        {!token && <p className="booking-note">You can explore doctors without signing in. We’ll ask you to sign in when you submit your appointment request.</p>}
        {bookableDates.length === 0 ? (
          <p className="booking-note">This doctor hasn’t added appointment hours yet. Please check back later or choose another doctor.</p>
        ) : (
          <>
            <p className="field-hint">Available days: {[...new Set(bookableDates.slice(0, 14).map((date) => date.dayOfWeek))].map((day) => day.charAt(0) + day.slice(1).toLowerCase()).join(', ')}</p>
            <form onSubmit={submit} className="booking-form">
              <label className="field-group"><span>Appointment date</span><select required value={form.appointmentDate} onChange={(event) => {
                const date = bookableDates.find((item) => item.value === event.target.value);
                const times = getBookableTimes(date?.schedule);
                setForm({ ...form, appointmentDate: event.target.value, startTime: times[0] || '' });
              }}>{bookableDates.map((date) => <option key={date.value} value={date.value}>{new Date(`${date.value}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</option>)}</select></label>
              <label className="field-group"><span>Available time</span><select required value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })}>{bookableTimes.map((time) => <option key={time} value={time}>{time}</option>)}</select></label>
              <label className="field-group"><span>Reason for visit</span><textarea required maxLength={500} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Briefly describe what you need help with" /></label>
              <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Sending request...' : token ? 'Request appointment' : 'Continue to sign in'}</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

const PublicPages = { HomePage, DoctorsPage, DoctorDetailPage, DoctorBookingPage };
export default PublicPages;
