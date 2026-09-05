import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import ScreenHeader from '../components/ScreenHeader';
import { BellIcon, UserIcon, WalletIcon } from '../components/icons';
import { getNotifications, markNotificationsSeen } from '../services/notificationService';
import { formatDate } from '../utils/format';

const NOTIFICATION_ICONS = {
  profile: UserIcon,
  loan: WalletIcon,
  status: BellIcon,
};

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const notifications = getNotifications();

  useEffect(() => {
    markNotificationsSeen();
  }, []);

  return (
    <Screen width="wide" withNav>
      <ScreenHeader onBack={() => navigate('/home')} backLabel="Back to home" />
      <h1 className="screen-title">Notifications</h1>
      <p className="screen-subtitle">Updates about your account and loans.</p>

      <div className="home-card" style={{ marginTop: 18 }}>
        <div className="activity-list">
          {notifications.map((item) => {
            const NotificationIcon = NOTIFICATION_ICONS[item.type] ?? BellIcon;
            return (
              <div key={item.id} className="activity-item">
                <span className={`activity-item__icon activity-item__icon--${item.type}`}>
                  <NotificationIcon size={18} />
                </span>
                <div className="activity-item__body">
                  <p className="activity-item__title">
                    {item.unread && <span className="notif-unread" aria-label="Unread" />}
                    {item.title}
                  </p>
                  <p className="activity-item__detail">{item.body}</p>
                </div>
                <div className="activity-item__meta">
                  <span>{formatDate(item.at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </Screen>
  );
}
