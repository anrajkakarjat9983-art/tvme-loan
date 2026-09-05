import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SESSION_KEY = 'tvme_session_v1';

const EMPTY_SESSION = Object.freeze({
  mobile: null,
  otpVerified: false,
  isNewUser: false,
  accountJustCreated: false,
  user: null,
});

const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return { ...EMPTY_SESSION };
    return { ...EMPTY_SESSION, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_SESSION };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  useEffect(() => {
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      return;
    }
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      startLogin(mobile, isNewUser) {
        setSession({ ...EMPTY_SESSION, mobile, isNewUser });
      },
      markOtpVerified() {
        setSession((prev) => ({ ...prev, otpVerified: true }));
      },
      loginExistingUser(user) {
        setSession((prev) => ({
          ...prev,
          user,
          otpVerified: true,
          isNewUser: false,
        }));
      },
      updateUser(user) {
        setSession((prev) => ({ ...prev, user }));
      },
      completeSignup(user) {
        setSession((prev) => ({
          ...prev,
          user,
          isNewUser: false,
          accountJustCreated: true,
        }));
      },
      finishAccountCreation() {
        setSession((prev) => ({ ...prev, accountJustCreated: false }));
      },
      logout() {
        setSession({ ...EMPTY_SESSION });
      },
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
