const SEEN_KEY = 'tvme_notifications_seen_v1';

export function getNotifications() {
  return [
    {
      id: 'ntf_1',
      type: 'status',
      title: 'Welcome to TVME Loan',
      body: 'Your account is ready. Simple. Fast. Secure.',
      at: '2026-08-20T09:00:00.000Z',
      unread: false,
    },
    {
      id: 'ntf_2',
      type: 'profile',
      title: 'Profile created successfully',
      body: 'Your profile has been set up. You are all set to explore loans.',
      at: '2026-08-22T15:30:00.000Z',
      unread: true,
    },
    {
      id: 'ntf_3',
      type: 'loan',
      title: 'Loan offers coming soon',
      body: 'Personal loans up to ₹50,000 — be the first to apply at launch.',
      at: '2026-08-24T11:00:00.000Z',
      unread: true,
    },
  ];
}

export function hasUnreadNotifications() {
  try {
    return window.localStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export function markNotificationsSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, '1');
  } catch {
    return;
  }
}
