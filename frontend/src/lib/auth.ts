const TOKEN_KEY = "campusflow_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem("token") ||
    sessionStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem("token")
  );
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("token", token);
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function saveToken(token: string): void {
  setToken(token);
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("token");
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}