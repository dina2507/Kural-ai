export interface AuthorityLike { name: string; whatsapp: string | null; helpline?: string | null; }
export interface IssueLike {
  id: string; title: string; description: string; category: string;
  severity: number; latitude: number; longitude: number; address?: string;
}

export function buildAuthorityMessage(issue: IssueLike, authority: AuthorityLike, locationLabel?: string): string {
  const cat = issue.category.replaceAll('_', ' ');
  const maps = `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`;
  return [
    `Hello ${authority.name},`,
    ``,
    `I'd like to report a civic issue through the KURAL app.`,
    ``,
    `- Issue: ${issue.title}`,
    `- Type: ${cat}`,
    `- Severity: ${issue.severity}/10`,
    `- Location: ${locationLabel || issue.address || `${issue.latitude}, ${issue.longitude}`}`,
    `- Map: ${maps}`,
    ``,
    `Details: ${issue.description || 'See the linked report for details.'}`,
    ``,
    `Kindly look into resolving this. If you have any questions, you can reply here.`,
    ``,
    `Reference: ${issue.id}`,
  ].join('\n');
}

export function buildWhatsAppUrl(phone: string | null, message: string): string {
  const text = encodeURIComponent(message);
  // With a number: opens chat to that number. Without: opens WhatsApp with text, user picks contact.
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}
