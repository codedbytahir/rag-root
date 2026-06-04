import type { ToolDefinition } from '../types';

/**
 * Web search tool using ZAI SDK or other search APIs.
 */
export const webSearchTool: ToolDefinition = {
  name: 'web_search',
  description: 'Search the web for current information. Use when the knowledge base does not contain relevant or up-to-date information.',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'The search query',
      required: true,
    },
  ],
  execute: async (input: string) => {
    try {
      // Check if web search API is available
      const searchApiKey = process.env.WEB_SEARCH_API_KEY;
      if (!searchApiKey) {
        return 'Web search is not configured. Set WEB_SEARCH_API_KEY environment variable.';
      }

      // Use a simple search API (configurable)
      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(input)}&count=5`,
        {
          headers: {
            'X-Subscription-Token': searchApiKey,
          },
        }
      );

      if (!response.ok) {
        return `Search failed: ${response.status} ${response.statusText}`;
      }

      const data = await response.json();
      const results = data.web?.results?.slice(0, 5) || [];

      if (results.length === 0) {
        return 'No results found.';
      }

      return results
        .map((r: { title: string; description: string; url: string }, i: number) =>
          `[${i + 1}] ${r.title}\n${r.description}\nURL: ${r.url}`
        )
        .join('\n\n');
    } catch (error) {
      return `Search error: ${(error as Error).message}`;
    }
  },
};

// Auto-register
import { registerTool } from '../registry';
registerTool(webSearchTool);
