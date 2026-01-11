const KEY = "adsconnect_auth";

export function isAuthenticated(): boolean {
    return localStorage.getItem(KEY) === "true";
}

export function login(): void {
    localStorage.setItem(KEY, "true");
}

export function logout(): void {
    localStorage.removeItem(KEY);
}
