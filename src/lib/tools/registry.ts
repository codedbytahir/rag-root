import type { ToolDefinition } from './types';
import { logger } from '@/lib/logger';

const tools = new Map<string, ToolDefinition>();

/**
 * Register a tool for use by agents.
 */
export function registerTool(tool: ToolDefinition): void {
  tools.set(tool.name, tool);
  logger.debug({ toolName: tool.name }, 'Tool registered');
}

/**
 * Get a tool by name.
 */
export function getTool(name: string): ToolDefinition {
  const tool = tools.get(name);
  if (!tool) throw new Error(`Tool not found: ${name}`);
  return tool;
}

/**
 * List all registered tools.
 */
export function listTools(): ToolDefinition[] {
  return Array.from(tools.values());
}

/**
 * Execute a tool by name with the given input.
 */
export async function executeTool(name: string, input: string): Promise<string | Record<string, unknown>> {
  const tool = getTool(name);
  return tool.execute(input);
}

/**
 * Check if a tool is registered.
 */
export function hasTool(name: string): boolean {
  return tools.has(name);
}
