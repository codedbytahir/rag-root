import type { ToolDefinition } from '../types';

/**
 * Code interpreter tool — safely evaluates JavaScript/TypeScript expressions.
 * WARNING: This is a sandboxed evaluation for demo purposes.
 * In production, use a proper sandboxed environment (e.g., Docker container or WebAssembly).
 */
export const codeInterpreterTool: ToolDefinition = {
  name: 'code_interpreter',
  description: 'Execute JavaScript code and return the result. Use for calculations, data transformations, or code verification. Code runs in a sandboxed environment.',
  parameters: [
    {
      name: 'code',
      type: 'string',
      description: 'JavaScript code to execute',
      required: true,
    },
  ],
  execute: async (input: string) => {
    try {
      // Basic safety: disallow dangerous operations
      const dangerousPatterns = [
        /require\s*\(/,
        /import\s+/,
        /process\./,
        /child_process/,
        /fs\./,
        /eval\s*\(/,
        /Function\s*\(/,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
          return `Error: Code contains disallowed pattern: ${pattern.source}. For security, only safe operations are permitted.`;
        }
      }

      // Execute in a sandboxed context
      const sandbox = {
        Math,
        JSON,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Map,
        Set,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        encodeURIComponent,
        decodeURIComponent,
      };

      const sandboxKeys = Object.keys(sandbox);
      const sandboxValues = Object.values(sandbox);

      const fn = new Function(...sandboxKeys, `"use strict"; return (function() { ${input} })()`);
      const result = fn(...sandboxValues);

      if (result === undefined) {
        return 'Code executed successfully (no return value).';
      }

      return typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
    } catch (error) {
      return `Execution error: ${(error as Error).message}`;
    }
  },
};

// Auto-register
import { registerTool } from '../registry';
registerTool(codeInterpreterTool);
