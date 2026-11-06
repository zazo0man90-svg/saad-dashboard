import { auth, db, ref, get, set, update } from './firebase.js';

const paths = {
  users: 'users', repositories: 'repositories', issues: 'issues',
  prs: 'prs', dashboardPrefs: 'dashboardPrefs'
};

function userPath(userId) {
  if (!auth?.currentUser || auth.currentUser.uid !== userId) {
    throw new Error('Sign in to access your Firebase data.');
  }
  return `${paths.users}/${userId}`;
}

async function run(operation) {
  if (!db) return { success: false, error: 'Firebase not initialized' };
  try {
    return { success: true, data: await operation() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function read(path) {
  const snapshot = await get(ref(db, path));
  return snapshot.exists() ? snapshot.val() : null;
}

const dbUtils = {
  // Expose a real Firebase reference scoped to the current user.
  ref: path => {
    if (!db) return null;
    const base = userPath(auth?.currentUser?.uid);
    if (path !== base && !path.startsWith(`${base}/`)) {
      throw new Error('Database references must belong to the signed-in user.');
    }
    return ref(db, path);
  },
  // Update the profile without overwriting preferences and other saved data.
  saveUserData: (userId, data) => run(() => update(ref(db, userPath(userId)), {
    name: data.name || '', email: data.email || '', avatar: data.avatar || '',
    lastLogin: new Date().toISOString()
  })),
  getUserData: userId => run(() => read(userPath(userId))),
  saveDashboardPrefs: (userId, prefs) => run(() => set(ref(db, `${userPath(userId)}/${paths.dashboardPrefs}`), prefs)),
  getDashboardPrefs: userId => run(() => read(`${userPath(userId)}/${paths.dashboardPrefs}`)),
  saveRepoData: (repoId, data) => run(() => set(ref(db,
    `${userPath(auth?.currentUser?.uid)}/${paths.repositories}/${repoId}`), {
    ...data, lastSynced: new Date().toISOString()
  })),
  getRepoData: repoId => run(() => read(`${userPath(auth?.currentUser?.uid)}/${paths.repositories}/${repoId}`)),
  saveIssues: (userId, issues) => run(() => set(ref(db, `${userPath(userId)}/${paths.issues}`), {
    items: issues, syncedAt: new Date().toISOString()
  }))
};

export { dbUtils, paths };
