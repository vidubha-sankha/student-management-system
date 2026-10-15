const TOKEN_KEY = "campusflow_token";
const USER_KEY = "campusflow_user";

export interface AuthUser {
  id?: number;
  userId?: number;
  name?: string;
  email?: string;
  role?: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function saveToken(token: string): void {
  setToken(token);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    const val = JSON.stringify(user);
    localStorage.setItem(USER_KEY, val);
    sessionStorage.setItem(USER_KEY, val);
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("user");
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(USER_KEY);
  }
}

export function logout(): void {
  removeToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}