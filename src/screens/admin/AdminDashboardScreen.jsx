import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import { ChevronRightIcon } from '../../components/icons';
import { getAllUsers } from '../../services/adminService';
import { getKyc, KYC_BADGES } from '../../services/kycService';
import { initialsOf } from '../../utils/format';

function StatCard({ label, value, tone }) {
  return (
    <div className={`admin-stat${tone ? ` admin-stat--${tone}` : ''}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

export default function AdminDashboardScreen() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setUsers(getAllUsers()), 3000);
    return () => clearInterval(id);
  }, []);

  const stats = {
    users: users.length,
    kycPending: users.filter((user) => getKyc(user).status === 'under_review').length,
    appsPending: users.reduce(
      (count, user) =>
        count + (user.applications ?? []).filter((app) => app.status === 'under_review').length,
      0
    ),
    activeLoans: users.filter((user) => user.activeLoan).length,
  };

  return (
    <AdminShell>
      <div>
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-subtitle">Manage users, KYC verification and loan applications.</p>
      </div>

      <div className="admin-stats">
        <StatCard label="Total Users" value={stats.users} />
        <StatCard label="KYC Under Review" value={stats.kycPending} tone="gold" />
        <StatCard label="Applications Pending" value={stats.appsPending} tone="gold" />
        <StatCard label="Active Loans" value={stats.activeLoans} tone="green" />
      </div>

      <h2 className="admin-section-title">Users</h2>
      <div className="admin-user-list">
        {users.length === 0 && (
          <div className="home-card">
            <div className="empty-state">
              <h3>No users yet</h3>
              <p>Users who sign up in the app will appear here.</p>
            </div>
          </div>
        )}
        {users.map((user) => {
          const kyc = getKyc(user);
          const badge = KYC_BADGES[kyc.status];
          return (
            <button
              key={user.mobile}
              type="button"
              className="admin-user-row"
              onClick={() => navigate(`/admin/user/${user.mobile}`)}
            >
              <span className="avatar avatar--sm">{initialsOf(user.fullName)}</span>
              <span className="admin-user-row__body">
                <strong>{user.fullName}</strong>
                <small>
                  +91 {user.mobile} &middot; {(user.applications ?? []).length} application(s)
                  {user.activeLoan ? ' · active loan' : ''}
                </small>
              </span>
              <span className={`status-chip ${badge.chipClass}`}>{badge.label}</span>
              <ChevronRightIcon size={16} className="admin-user-row__chevron" />
            </button>
          );
        })}
      </div>
    </AdminShell>
  );
}
