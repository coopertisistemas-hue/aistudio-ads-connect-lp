/**
 * Placeholder for tracking events (GA4, Pixel, etc.)
 */
export function trackEvent(name: string, data?: Record<string, any>) {
    console.log(`[TRACK] ${name}`, data ?? {});
}
