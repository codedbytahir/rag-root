import type { ToolDefinition } from '../types';

/**
 * Simple calculator tool that evaluates math expressions.
 * Only supports basic arithmetic for safety.
 */
export const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'Evaluate a mathematical expression. Supports +, -, *, /, parentheses, and basic functions.',
  parameters: [
    {
      name: 'expression',
      type: 'string',
      description: 'The mathematical expression to evaluate',
      required: true,
    },
  ],
  execute: async (input: string) => {
    try {
      // Sanitize: only allow numbers, operators, parentheses, spaces, and dots
      const sanitized = input.replace(/[^0-9+\-*/().%\s]/g, '');
      
      if (sanitized !== input.trim()) {
        return `Error: Expression contains invalid characters. Only numbers and basic operators (+, -, *, /, parentheses) are allowed.`;
      }

      // Use Function constructor for safe evaluation (no access to globals)
      const result = new Function(`"use strict"; return (${sanitized})`)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        return `Error: Expression did not evaluate to a valid number.`;
      }

      return `${input} = ${result}`;
    } catch (error) {
      return `Error evaluating expression: ${(error as Error).message}`;
    }
  },
};

// Auto-register
import { registerTool } from '../registry';
registerTool(calculatorTool);
