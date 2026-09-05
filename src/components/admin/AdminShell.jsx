import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { logoutAdmin } from '../../services/adminService';

export default function AdminShell({ children }) {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-topbar">
          <div className="admin-topbar__brand">
            <Logo size={30} />
            <span>TVME Admin</span>
          </div>
          <span className="admin-topbar__badge">Admin</span>
          <span className="admin-topbar__spacer" />
          <button type="button" className="admin-topbar__link" onClick={() => navigate('/admin/settings')}>
            Settings
          </button>
          <button type="button" className="admin-topbar__link" onClick={() => navigate('/')}>
            Exit to App
          </button>
          <button
            type="button"
            className="admin-topbar__link"
            onClick={() => {
              logoutAdmin();
              navigate('/admin');
            }}
          >
            Logout
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
