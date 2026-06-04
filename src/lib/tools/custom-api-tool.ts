import type { ToolDefinition } from './types';

/**
 * Create a custom tool that calls a REST API endpoint.
 */
export function createCustomApiTool(config: {
  name: string;
  description: string;
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  bodyTemplate?: string; // JSON template with {{input}} placeholder
}): ToolDefinition {
  return {
    name: config.name,
    description: config.description,
    parameters: [
      {
        name: 'input',
        type: 'string',
        description: 'Input for the API call',
        required: true,
      },
    ],
    execute: async (input: string) => {
      try {
        const url = config.url.replace('{{input}}', encodeURIComponent(input));
        
        const options: RequestInit = {
          method: config.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
        };

        if (config.method === 'POST' && config.bodyTemplate) {
          options.body = config.bodyTemplate.replace('{{input}}', input);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
          return `API error: ${response.status} ${response.statusText}`;
        }

        const data = await response.json();
        return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      } catch (error) {
        return `API call failed: ${(error as Error).message}`;
      }
    },
  };
}
