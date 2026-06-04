export interface AgentStep {
  thought: string;
  action: string;
  actionInput: string;
  observation: string;
}

export interface AgentResult {
  answer: string;
  steps: AgentStep[];
  sources?: Array<{
    file_id: string;
    file_name: string;
    text_snippet: string;
    score: number;
  }>;
}

export type AgentMode = 'react' | 'function_calling' | 'simple';

export interface AgentConfig {
  mode: AgentMode;
  maxIterations: number;
  temperature: number;
}
