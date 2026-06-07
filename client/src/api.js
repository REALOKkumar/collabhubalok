// src/api.js
// Client API Adapter that communicates with our Express/MongoDB Atlas backend.

export const API_BASE = window.location.port === "5000"
  ? ""
  : `http://${window.location.hostname}:5000`;

// --- Helper Functions ---
const getStoredUser = () => {
  try {
    const user = localStorage.getItem("collabhub_current_user");
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};

const setStoredUser = (user, token) => {
  if (user) {
    localStorage.setItem("collabhub_current_user", JSON.stringify(user));
    if (token) {
      localStorage.setItem("collabhub_auth_token", token);
    }
  } else {
    localStorage.removeItem("collabhub_current_user");
    localStorage.removeItem("collabhub_auth_token");
  }
  auth.currentUser = user;
  authListeners.forEach(listener => listener(user));
};

const getHeaders = () => {
  const token = localStorage.getItem("collabhub_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

const authListeners = new Set();

// --- Auth Client ---
export const auth = {
  currentUser: getStoredUser()
};

export const getAuth = () => auth;

export const onAuthStateChanged = (authObj, callback) => {
  callback(auth.currentUser);
  authListeners.add(callback);
  return () => {
    authListeners.delete(callback);
  };
};

export const createUserWithEmailAndPassword = async (authObj, email, password) => {
  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to sign up.");
  }
  setStoredUser(data.user, data.token);
  return { user: data.user };
};

export const signInWithEmailAndPassword = async (authObj, email, password) => {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to log in.");
  }
  setStoredUser(data.user, data.token);
  return { user: data.user };
};

export class GoogleAuthProvider {}
export class GithubAuthProvider {}

export const signInWithPopup = async (authObj, provider) => {
  const isGoogle = provider instanceof GoogleAuthProvider;
  const name = isGoogle ? "Google User" : "GitHub User";
  const email = isGoogle ? "google.user@example.com" : "github.user@example.com";
  const password = "oauth_password_dummy";

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      setStoredUser(data.user, data.token);
      return { user: data.user };
    }
  } catch (e) {}

  const response = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "OAuth failed.");
  }
  
  const profileRes = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${data.token}`
    },
    body: JSON.stringify({ displayName: name })
  });
  const profileData = await profileRes.json();
  setStoredUser(profileData, data.token);
  return { user: profileData };
};

export const updateProfile = async (user, profileData) => {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update profile.");
  }
  setStoredUser(data, localStorage.getItem("collabhub_auth_token"));
  return {};
};

export const signOut = async (authObj) => {
  setStoredUser(null, null);
};

// --- Database Operations Client Mock ---
export const db = {};

export const collection = (dbObj, path) => {
  return { path };
};

export const addDoc = async (colRef, data) => {
  const collectionName = colRef.path;
  let endpoint = `/api/${collectionName}`;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  const resData = await response.json();
  if (!response.ok) {
    throw new Error(resData.error || "Failed to save document.");
  }
  return resData;
};

export const getDocs = async (queryObj) => {
  const collectionName = queryObj.path;
  let endpoint = `/api/${collectionName}`;
  if (collectionName === "users") {
    endpoint = "/api/users";
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch documents.");
  }
  
  return {
    docs: data.map(doc => ({
      id: doc.id || doc._id,
      data: () => doc
    }))
  };
};

export const query = (colRef, ...constraints) => {
  return { path: colRef.path };
};

export const orderBy = () => {};

export const serverTimestamp = () => {
  return new Date().toISOString();
};

// --- Group Lifecycle Custom Helpers ---
export const leaveGroup = async (groupId) => {
  const response = await fetch(`${API_BASE}/api/requests/${groupId}/leave`, {
    method: "POST",
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to leave group.");
  }
  return data;
};

export const deleteGroup = async (groupId) => {
  const response = await fetch(`${API_BASE}/api/requests/${groupId}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete group.");
  }
  return data;
};
