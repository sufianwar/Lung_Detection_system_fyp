const KEY = "pulmovision_auth_v1";

// Demo credentials (frontend-only)
export const DEMO_EMAIL = "sufi@pulmovision.ai";
export const DEMO_PASS = "Pulmo@123";

export function login(email, password) {
  const e = String(email || "").trim().toLowerCase();
  const p = String(password || "");

  if (e === DEMO_EMAIL && p === DEMO_PASS) {
    localStorage.setItem(KEY, JSON.stringify({ email: e, ts: Date.now() }));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function isAuthed() {
  return Boolean(localStorage.getItem(KEY));
}

export function getUserEmail() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw)?.email || "" : "";
  } catch {
    return "";
  }
}
