const regex = /(\$+)([A-Z][A-Z_]*)/g;

export function analyze(template: string): string[] {
  const variables = new Set<string>();
  for (const [, dollars, key] of template.matchAll(regex)) {
    if (dollars.length % 2) variables.add(key);
  }
  return [...variables];
}

export function sub$(template: string, values: Record<string, string>): string {
  return template.replace(regex, (match, dollars, key) => {
    if (!(key in values)) return match;
    if (dollars.length % 2)
      return "$".repeat((dollars.length - 1) / 2) + values[key];
    return "$".repeat(dollars.length / 2) + key;
  });
}
