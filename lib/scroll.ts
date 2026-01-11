/**
 * Smoothly scrolls to an element by its ID.
 */
export function scrollToId(id: string) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        console.warn(`[SCROLL] Element with ID "${id}" not found.`);
    }
}
