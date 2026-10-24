import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useToast } from '../../components/Toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.get('/admin/users')
      .then((response) => setUsers(response.data))
      .catch((error) => toast(error.response?.data?.message || 'Could not load user accounts.', 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const visibleUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || user.fullName.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
    return matchesRole && matchesQuery;
  });

  async function toggleUserStatus(user) {
    setUpdatingId(user.id);
    try {
      const response = await api.patch(`/admin/users/${user.id}/status`, { enabled: !user.enabled });
      setUsers((current) => current.map((item) => item.id === user.id ? response.data : item));
      toast(`${user.fullName}'s account ${response.data.enabled ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      toast(error.response?.data?.message || `Could not update ${user.fullName}'s account.`, 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page-shell dashboard-shell">
      <div className="dashboard-header">
        <div><span className="eyebrow muted">Administration · Accounts</span><h1>All users</h1><p>Patients, doctors, and administrator accounts in one directory.</p></div>
        <Link to="/admin/doctors" className="btn btn-primary">Add a doctor <span aria-hidden="true">→</span></Link>
      </div>
      <section className="panel user-directory">
        <div className="user-directory-tools">
          <label className="field-group user-search"><span>Search accounts</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" /></label>
          <label className="field-group user-role-filter"><span>Account type</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="ALL">All accounts</option><option value="PATIENT">Patients</option><option value="DOCTOR">Doctors</option><option value="ADMIN">Admins</option></select></label>
          <span className="result-count">{visibleUsers.length} of {users.length} accounts</span>
        </div>
        {loading ? <div className="loader-box" role="status">Loading user accounts...</div> : visibleUsers.length === 0 ? <p className="empty-state">{users.length ? 'No accounts match these filters.' : 'No user accounts found.'}</p> : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead><tr><th scope="col">User</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
              <tbody>{visibleUsers.map((user) => <tr key={user.id}><td><div className="user-name"><span className="avatar">{user.fullName?.charAt(0) || 'U'}</span><strong>{user.fullName}</strong></div></td><td>{user.email}</td><td><span className="role-pill">{user.role}</span></td><td><span className={`account-state ${user.enabled ? 'is-active' : 'is-inactive'}`}>{user.enabled ? 'Active' : 'Inactive'}</span></td><td>{user.role === 'ADMIN' ? <span className="protected-account">Protected</span> : <button className={`btn btn-small ${user.enabled ? 'btn-danger' : 'btn-enable'}`} type="button" disabled={updatingId === user.id} onClick={() => toggleUserStatus(user)}>{updatingId === user.id ? 'Updating...' : user.enabled ? 'Deactivate' : 'Activate'}</button>}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
