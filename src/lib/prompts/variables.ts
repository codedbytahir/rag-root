/**
 * Template variable resolution for prompts.
 * Supports {{variable}} syntax for dynamic prompt construction.
 */

export interface TemplateVariables {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Resolve template variables in a prompt string.
 * Replaces {{variable}} with the corresponding value.
 */
export function resolveTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value === undefined) {
      return match; // Leave unresolved variables as-is
    }
    return String(value);
  });
}

/**
 * Extract variable names from a template string.
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))];
}

/**
 * Validate that all required variables are provided.
 */
export function validateVariables(template: string, variables: TemplateVariables): string[] {
  const required = extractVariables(template);
  const missing = required.filter(key => variables[key] === undefined);
  return missing;
}
