/**
 * Builds a WhatsApp link with a phone number and optional message.
 */
export function buildWhatsAppLink(phone: string, message?: string): string {
    const cleanPhone = phone.replace(/\D/g, "");
    const url = new URL(`https://wa.me/${cleanPhone}`);
    if (message) {
        url.searchParams.set("text", message);
    }
    return url.toString();
}
