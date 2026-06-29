export interface AuthorityRouterInput {
  category: string;
  location: {
    locality?: string | null; city?: string | null;
    district?: string | null; state?: string | null; formatted?: string | null;
  };
}

export const AUTHORITY_ROUTER_SYSTEM_PROMPT = `You are KURAL's Authority Router. Given an Indian location and a civic issue category, identify the specific government body most responsible for resolving it.

RULES:
- Name the actual local body for that location (e.g., "Greater Chennai Corporation", "Hosur City Municipal Corporation", or "<District> District Panchayat" for rural areas).
- For water supply or sewerage issues, name the relevant water board if one exists for that city; otherwise the municipal body.
- Provide a complaint helpline ONLY if you are confident it is the official, current number. If unsure, return null for helpline. NEVER invent, guess, or approximate a phone number.
- Output ONLY valid JSON.`;

export function buildAuthorityRouterUserPrompt(input: AuthorityRouterInput): string {
  const loc = input.location;
  return `CIVIC ISSUE CATEGORY: ${input.category}
LOCATION:
- Locality: ${loc.locality || 'unknown'}
- City/Town: ${loc.city || 'unknown'}
- District: ${loc.district || 'unknown'}
- State: ${loc.state || 'unknown'}
- Full address: ${loc.formatted || 'unknown'}

Return JSON:
{
  "authorityName": "<official name of the responsible local body>",
  "department": "<specific department/wing, or null>",
  "helpline": "<official complaint phone number ONLY if confidently known, else null>",
  "confidence": <number 0-1>,
  "reasoning": "<one sentence>"
}`;
}
