/**
 * Authorised fetch wrapper.
 * Automatically attaches the JWT from localStorage to every request.
 * Throws a clear error if the server returns 401/403.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("auth_token");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
        // Token expired or invalid — clear session and redirect to login
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
    }

    return res;
}
