export const DIGEST_SYSTEM_PROMPT = `You are KURAL's Digest Agent — an AI that writes weekly civic health reports for city wards.

Your reports are read by ward officers, local councillors, and engaged citizens.

WRITING STYLE:
- Professional but accessible (not bureaucratic jargon)
- Data-driven — cite specific numbers
- Acknowledge both problems and successes
- Constructive and action-oriented
- 200-300 words total for the narrative

STRUCTURE:
1. Opening: Week summary sentence (total reports, resolution rate)
2. Highlights: What was fixed, what improved
3. Concerns: What remains unresolved, what needs attention
4. Community: Citizen engagement, verifications, notable contributors
5. Outlook: What to watch next week

TONE: Think of a thoughtful local journalist writing a civic update — factual, fair, focused on community impact.

OUTPUT: Return ONLY valid JSON.`;

export interface DigestAgentInput {
  ward: string;
  weekStart: string;
  weekEnd: string;
  stats: {
    total: number;
    resolved: number;
    open: number;
    critical: number;
    resolutionRate: number;
    topCategory: string;
    avgResolutionDays: number;
  };
  citizenHero: { name: string; reportsCount: number; karma: number } | null;
  notableIssues: Array<{ title: string; category: string; status: string; daysOpen: number }>;
}

export function buildDigestUserPrompt(input: DigestAgentInput): string {
  return `Generate a weekly ward digest report.

WARD: ${input.ward}
PERIOD: ${input.weekStart} to ${input.weekEnd}

STATISTICS:
- Total issues reported: ${input.stats.total}
- Resolved this week: ${input.stats.resolved} (${Math.round(input.stats.resolutionRate * 100)}% resolution rate)
- Currently open: ${input.stats.open}
- Critical unresolved: ${input.stats.critical}
- Most common issue: ${input.stats.topCategory}
- Average resolution time: ${input.stats.avgResolutionDays} days

CITIZEN HERO: ${input.citizenHero
    ? `${input.citizenHero.name} — ${input.citizenHero.reportsCount} reports, ${input.citizenHero.karma} karma points`
    : 'No standout contributor this week'}

NOTABLE ISSUES:
${input.notableIssues.map(i => `- "${i.title}" (${i.category}) — ${i.status}, ${i.daysOpen} days open`).join('\n')}

Return JSON:
{
  "headline": "<10-15 word digest headline>",
  "summary": "<full narrative digest — 200-300 words>",
  "keyHighlight": "<single most positive thing that happened this week>",
  "topConcern": "<single most pressing unresolved issue>",
  "citizenHeroReason": "<one sentence why this person was the hero, or null>",
  "nextWeekWatch": "<what to monitor next week>"
}`;
}
