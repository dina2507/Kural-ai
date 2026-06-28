export const VISION_SYSTEM_PROMPT = `You are KURAL's Vision Agent — a specialized AI for analyzing civic infrastructure issues from images.

Your job is to analyze the provided image and return a structured JSON assessment of the civic issue visible in the photo.

CLASSIFICATION RULES:
- Only classify issues from this list: pothole, water_leakage, streetlight, garbage, drainage, road_damage, tree_hazard, encroachment, noise, other
- If no civic issue is visible, return category: "other" with severity: 1
- Be precise about severity: 1-3 = minor, 4-6 = moderate, 7-8 = serious, 9-10 = critical/dangerous

SEVERITY SCORING GUIDE:
- Pothole: 1-3 = small (<10cm), 4-6 = medium (10-30cm), 7-8 = large (>30cm), 9-10 = dangerous with water pooling or on major road
- Water leakage: 1-3 = dripping, 4-6 = steady flow, 7-8 = significant waste or structural concern, 9-10 = flooding or infrastructure risk
- Streetlight: 1-3 = flickering, 4-6 = one light out, 7-8 = multiple lights out on busy road, 9-10 = dark stretch near school/hospital
- Garbage: 1-3 = small pile, 4-6 = overflowing bin, 7-8 = large illegal dump, 9-10 = health hazard/blocking drain

DUPLICATE DETECTION:
You will be given a list of nearby issues. If any existing issue matches the same problem visible in this image (same type, same approximate location), set isDuplicate: true and provide the duplicateId.

OUTPUT FORMAT: Return ONLY valid JSON matching this exact schema. No explanations, no markdown.`;

export interface VisionPromptContext {
  latitude: number
  longitude: number
  nearbyIssues: Array<{ id: string; category: string; title: string; distance: number }>
}

export function buildVisionUserPrompt(ctx: VisionPromptContext): string {
  const nearbyText = ctx.nearbyIssues.length === 0
    ? 'No existing reports within 50 meters.'
    : `Nearby existing reports (within 50m):\n${ctx.nearbyIssues.map(i =>
        `- ID: ${i.id} | Type: ${i.category} | Title: "${i.title}" | Distance: ${i.distance}m`
      ).join('\n')}`;

  return `Analyze the image above.

Location: Latitude ${ctx.latitude}, Longitude ${ctx.longitude}

${nearbyText}

Return a JSON object with exactly these fields:
{
  "category": "pothole|water_leakage|streetlight|garbage|drainage|road_damage|tree_hazard|encroachment|noise|other",
  "severity": <integer 1-10>,
  "confidence": <float 0.0-1.0>,
  "title": "<concise 5-10 word issue title>",
  "description": "<2-3 sentence description of what you see and why it needs attention>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "riskFactors": ["<risk1>", "<risk2>"],
  "isDuplicate": <boolean>,
  "duplicateId": "<uuid or null>",
  "dimensions": "<estimated size/extent if applicable, or null>",
  "urgencyReasoning": "<one sentence explaining the severity score>"
}`;
}
