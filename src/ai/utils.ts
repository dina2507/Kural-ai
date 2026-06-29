export function parseJsonFromMarkdown(raw: string): any {
  let cleanRaw = raw.trim();
  if (cleanRaw.startsWith('\`\`\`')) {
    cleanRaw = cleanRaw.replace(/^\`\`\`(?:json)?\\n/, '').replace(/\\n\`\`\`$/, '');
  }
  return JSON.parse(cleanRaw);
}
