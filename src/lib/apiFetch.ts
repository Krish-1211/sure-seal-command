/**
 * Authorised fetch wrapper.
 * Automatically attaches the JWT from localStorage to every request.
 * Throws a clear error if the server returns 401/403.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem("auth_token");

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    // Let the browser set Content-Type for FormData (includes boundary)
    if (options.body && options.body instanceof FormData) {
        delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

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
