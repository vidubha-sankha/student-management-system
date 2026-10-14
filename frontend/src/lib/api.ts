import { getToken } from "./auth";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = getToken();

    const headers = new Headers(options.headers);

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        cache: "no-store",
    });

    if (response.status === 401) {
        throw new Error("401 Unauthorized - Please login");
    }

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    if (response.status === 204) return null;

    return response.json();
}