import { describe, it, expect } from 'vitest';
import { resolveTemplate, extractVariables, validateVariables } from '@/lib/prompts/variables';

describe('resolveTemplate', () => {
  it('should replace template variables', () => {
    const template = 'Hello {{name}}, welcome to {{place}}!';
    const result = resolveTemplate(template, { name: 'World', place: 'RAG ROOT' });
    expect(result).toBe('Hello World, welcome to RAG ROOT!');
  });

  it('should leave unresolved variables as-is', () => {
    const template = 'Hello {{name}}, {{unknown}}';
    const result = resolveTemplate(template, { name: 'World' });
    expect(result).toBe('Hello World, {{unknown}}');
  });

  it('should handle number values', () => {
    const template = 'You have {{count}} items';
    const result = resolveTemplate(template, { count: 42 });
    expect(result).toBe('You have 42 items');
  });

  it('should handle no variables', () => {
    const template = 'No variables here';
    const result = resolveTemplate(template, {});
    expect(result).toBe('No variables here');
  });
});

describe('extractVariables', () => {
  it('should extract all variable names', () => {
    const template = '{{name}} is {{age}} years old from {{city}}';
    const vars = extractVariables(template);
    expect(vars).toEqual(['name', 'age', 'city']);
  });

  it('should deduplicate variables', () => {
    const template = '{{name}} and {{name}} again';
    const vars = extractVariables(template);
    expect(vars).toEqual(['name']);
  });

  it('should return empty array for no variables', () => {
    const vars = extractVariables('No variables');
    expect(vars).toEqual([]);
  });
});

describe('validateVariables', () => {
  it('should return empty array when all variables are provided', () => {
    const template = '{{name}} {{age}}';
    const missing = validateVariables(template, { name: 'Test', age: 25 });
    expect(missing).toEqual([]);
  });

  it('should return missing variable names', () => {
    const template = '{{name}} {{age}} {{city}}';
    const missing = validateVariables(template, { name: 'Test' });
    expect(missing).toEqual(['age', 'city']);
  });
});
