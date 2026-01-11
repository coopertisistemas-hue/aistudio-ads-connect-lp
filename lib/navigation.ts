export function getNextParam(search: string, fallback: string): string {
    const params = new URLSearchParams(search);
    return params.get("next") || fallback;
}
