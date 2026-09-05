const DB_KEY = 'tvme_mock_db_v5';

const seedDb = {
  users: [],
};

function load() {
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) return parsed;
    }
  } catch {
    const fresh = structuredClone(seedDb);
    persist(fresh);
    return fresh;
  }
  const fresh = structuredClone(seedDb);
  persist(fresh);
  return fresh;
}

function persist(database) {
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(database));
  } catch {
    return;
  }
}

let db = load();

export const mockDb = {
  getUsers() {
    db = load();
    return [...db.users];
  },
  findUserByMobile(mobile) {
    db = load();
    return db.users.find((user) => user.mobile === mobile) || null;
  },
  insertUser(user) {
    db = load();
    db.users.push(user);
    persist(db);
    return user;
  },
  updateUser(mobile, patch) {
    db = load();
    const index = db.users.findIndex((user) => user.mobile === mobile);
    if (index === -1) return null;
    db.users[index] = { ...db.users[index], ...patch };
    persist(db);
    return db.users[index];
  },
  reset() {
    db = structuredClone(seedDb);
    persist(db);
  },
};
