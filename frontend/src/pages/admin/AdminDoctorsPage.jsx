import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { LoadingState } from '../../components/DashboardUI';
import DoctorAvatar from '../../components/DoctorAvatar';
import { useToast } from '../../components/Toast';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  specialization: '',
  qualification: '',
  yearsOfExperience: '',
  consultationFee: '',
  description: '',
  profileImageUrl: '',
  active: true
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  const loadDoctors = useCallback(async () => {
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast(error.response?.data?.message || 'Could not load the doctor list.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function createDoctor(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/doctors', {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience),
        consultationFee: Number(form.consultationFee)
      });
      setForm(emptyForm);
      toast('Doctor account created. Share the login details securely.');
      await loadDoctors();
    } catch (error) {
      toast(error.response?.data?.message || 'Could not create the doctor account.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell dashboard-shell">
      <div className="dashboard-header"><div><span className="eyebrow muted">Administration · Care network</span><h1>Doctors</h1><p>Create doctor profiles and review the current care team.</p></div><div className="header-actions"><Link to="/admin/users" className="btn btn-secondary">All users</Link><Link to="/admin" className="btn btn-secondary">Overview</Link></div></div>
      <div className="panel-grid two-col admin-doctors-grid">
        <section className="panel">
          <h2 className="panel-title">Doctor details</h2>
          <form onSubmit={createDoctor}>
            <div className="form-grid">
              <label className="field-group"><span>Full name</span><input name="fullName" autoComplete="name" required value={form.fullName} onChange={updateField} placeholder="Dr. Asha Sharma" /></label>
              <label className="field-group"><span>Email address</span><input name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} placeholder="doctor@example.com" /></label>
              <label className="field-group full-width"><span>Temporary password</span><input name="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={updateField} placeholder="Create a secure password" /><small>At least 8 characters with a letter, number, and symbol.</small></label>
              <label className="field-group"><span>Specialization</span><input name="specialization" required value={form.specialization} onChange={updateField} placeholder="Cardiology" /></label>
              <label className="field-group"><span>Qualification</span><input name="qualification" required value={form.qualification} onChange={updateField} placeholder="MBBS, MD" /></label>
              <label className="field-group"><span>Years of experience</span><input name="yearsOfExperience" type="number" min="1" required value={form.yearsOfExperience} onChange={updateField} placeholder="5" /></label>
              <label className="field-group"><span>Consultation fee (₹)</span><input name="consultationFee" type="number" min="1" step="0.01" required value={form.consultationFee} onChange={updateField} placeholder="500" /></label>
              <label className="field-group full-width"><span>Short profile</span><textarea name="description" maxLength={1000} value={form.description} onChange={updateField} placeholder="A short introduction to the doctor's practice" /></label>
              <label className="field-group full-width"><span>Profile image URL (optional)</span><input name="profileImageUrl" type="url" value={form.profileImageUrl} onChange={updateField} placeholder="https://example.com/doctor.jpg" /></label>
              <label className="checkbox-field full-width"><input name="active" type="checkbox" checked={form.active} onChange={updateField} /><span>Active and visible to patients</span></label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Creating doctor...' : 'Create doctor account'}</button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-heading"><div><h2 className="panel-title">Doctor accounts</h2><p className="panel-subtitle">Your existing care team.</p></div><span className="result-count">{doctors.length} total</span></div>
          {loading ? <div className="loader-box" role="status">Loading doctors...</div> : doctors.length === 0 ? <p className="empty-state">No doctor profiles yet. Add the first doctor using the form.</p> : (
            <div className="doctor-admin-list">{doctors.map((doctor) => <article className="doctor-admin-row" key={doctor.id}><DoctorAvatar doctor={doctor} /><div className="doctor-admin-info"><strong>{doctor.fullName}</strong><span>{doctor.specialization} · {doctor.email}</span></div><span className={`account-state ${doctor.active ? 'is-active' : 'is-inactive'}`}>{doctor.active ? 'Active' : 'Inactive'}</span></article>)}</div>
          )}
        </section>
      </div>
    </div>
  );
}
