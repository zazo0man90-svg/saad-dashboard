// Firebase services export
import { app, db } from './firebase.js';

// Database paths
const paths = {
  users: 'users',
  repositories: 'repositories',
  issues: 'issues',
  prs: 'prs',
  dashboardPrefs: 'dashboardPrefs'
};

// Database utilities
const dbUtils = {
  // Get a reference to a database path
  ref: (path) => {
    if (!db) return null;
    return new FirebaseRef(db, path);
  },
  
  // Save user data
  saveUserData: async (userId, userData) => {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    try {
      await set(ref(db, `${paths.users}/${userId}`), {
        ...userData,
        lastLogin: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Get user data
  getUserData: async (userId) => {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    try {
      const snapshot = await get(ref(db, `${paths.users}/${userId}`));
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Save dashboard preferences
  saveDashboardPrefs: async (userId, prefs) => {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    try {
      await set(ref(db, `${paths.users}/${userId}/${paths.dashboardPrefs}`), prefs);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Get dashboard preferences
  getDashboardPrefs: async (userId) => {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    try {
      const snapshot = await get(ref(db, `${paths.users}/${userId}/${paths.dashboardPrefs}`));
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: false, error: 'Preferences not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Save repository data
  saveRepoData: async (repoId, repoData) => {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    try {
      await set(ref(db, `${paths.repositories}/${repoId}`), {
        ...repoData,
        lastSynced: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Get repository data
  getRepoData: async (repoId) => {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    try {
      const snapshot = await get(ref(db, `${paths.repositories}/${repoId}`));
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      }
      return { success: false, error: 'Repository not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Save issues
  saveIssues: async (userId, issues) => {
    if (!db) return { success: false, error: 'Firebase not initialized' };
    try {
      await set(ref(db, `${paths.users}/${userId}/${paths.issues}`), {
        ...issues,
        syncedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

class FirebaseRef {
  constructor(dbInstance, path) {
    this.db = dbInstance;
    this.path = path;
  }
  
  get ref() {
    return new FirebaseRef(this.db, this.path);
  }
}

export { dbUtils, paths };
