
import { getToken } from "./auth";

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080";

type ApiOptions = RequestInit & {
    skipAuth?: boolean;
};

export async function apiFetch(
    endpoint: string,
    options: ApiOptions = {}
) {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers);

    if (
        fetchOptions.body &&
        !headers.has("Content-Type") &&
        !(fetchOptions.body instanceof FormData)
    ) {
        headers.set("Content-Type", "application/json");
    }

    if (!skipAuth) {
        const token = getToken();

        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...fetchOptions,
            headers,
            cache: "no-store",
        }
    );

    if (response.status === 401) {
        throw new Error("Unauthorized. Please login.");
    }

    if (response.status === 403) {
        throw new Error("Access denied.");
    }

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
