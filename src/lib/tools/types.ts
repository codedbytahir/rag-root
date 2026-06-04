export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (input: string) => Promise<string | Record<string, unknown>>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required?: boolean;
}

export interface ToolResult {
  success: boolean;
  data?: string | Record<string, unknown>;
  error?: string;
}
