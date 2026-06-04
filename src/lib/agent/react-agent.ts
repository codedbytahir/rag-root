import { generateText } from 'ai';
import { createModel } from '@/lib/llm/provider-registry';
import { performRAG } from '@/lib/rag/pipeline';
import { getTool, listTools } from '@/lib/tools/registry';
import type { AgentResult, AgentStep, AgentConfig } from './types';
import type { Brain } from '@/lib/db/schema';
import { logger, createLogger } from '@/lib/logger';

const DEFAULT_CONFIG: AgentConfig = {
  mode: 'react',
  maxIterations: 5,
  temperature: 0.7,
};

/**
 * ReAct (Reasoning + Acting) Agent implementation.
 * Follows the Thought → Action → Observation loop.
 */
export async function runReActAgent(params: {
  query: string;
  brain: Brain;
  apiKey: string;
  config?: Partial<AgentConfig>;
}): Promise<AgentResult> {
  const { query, brain, apiKey, config: userConfig } = params;
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const log = createLogger({ brainId: brain.id, mode: 'react' });

  const steps: AgentStep[] = [];
  let currentQuery = query;
  let finalAnswer = '';

  // First, try RAG retrieval
  const ragResult = await performRAG({
    query: currentQuery,
    brain_id: brain.id,
    brain,
    apiKey,
  });

  // If we have good context, generate answer directly
  if (ragResult.chunks.length > 0) {
    const model = createModel(brain.chat_provider || 'groq', {
      apiKey,
      modelId: brain.chat_model || 'llama-3.3-70b-versatile',
    });

    const { text } = await generateText({
      model,
      system: `You are an AI assistant. Answer based on the provided context. If the context is insufficient, say so.

Context:
${ragResult.context}`,
      prompt: currentQuery,
      temperature: config.temperature,
    });

    return {
      answer: text,
      steps: [{
        thought: 'Retrieved relevant context from knowledge base',
        action: 'rag_search',
        actionInput: currentQuery,
        observation: `Found ${ragResult.chunks.length} relevant chunks`,
      }],
      sources: ragResult.sources,
    };
  }

  // If no RAG results, try using tools
  const availableTools = listTools();
  
  if (availableTools.length === 0) {
    // No tools available, generate answer without context
    const model = createModel(brain.chat_provider || 'groq', {
      apiKey,
      modelId: brain.chat_model || 'llama-3.3-70b-versatile',
    });

    const { text } = await generateText({
      model,
      system: `You are an AI assistant. The knowledge base does not contain relevant information for this query. Answer based on your general knowledge, but note that your answer is not grounded in the user's documents.`,
      prompt: currentQuery,
      temperature: config.temperature,
    });

    return {
      answer: text,
      steps: [{
        thought: 'No relevant context found in knowledge base',
        action: 'direct_answer',
        actionInput: currentQuery,
        observation: 'Answered from general knowledge (no document context)',
      }],
    };
  }

  // ReAct loop with tools
  for (let i = 0; i < config.maxIterations; i++) {
    const model = createModel(brain.chat_provider || 'groq', {
      apiKey,
      modelId: brain.chat_model || 'llama-3.3-70b-versatile',
    });

    const toolDescriptions = availableTools.map(t => `- ${t.name}: ${t.description}`).join('\n');

    const { text: thought } = await generateText({
      model,
      system: `You are a reasoning agent. Given a query, decide what action to take.

Available actions:
- rag_search: Search the knowledge base (use when the query might be answered by documents)
${toolDescriptions}
- final_answer: Provide the final answer to the user

Previous steps:
${steps.map((s, idx) => `Step ${idx + 1}: Thought: ${s.thought}\nAction: ${s.action}\nInput: ${s.actionInput}\nObservation: ${s.observation}`).join('\n\n')}

Respond in EXACTLY this format:
THOUGHT: [your reasoning]
ACTION: [action name]
ACTION_INPUT: [input for the action]`,
      prompt: `Query: ${currentQuery}`,
      temperature: config.temperature,
      maxTokens: 500,
    });

    // Parse the response
    const thoughtMatch = thought.match(/THOUGHT:\s*(.+)/);
    const actionMatch = thought.match(/ACTION:\s*(.+)/);
    const inputMatch = thought.match(/ACTION_INPUT:\s*(.+)/);

    const step: AgentStep = {
      thought: thoughtMatch?.[1]?.trim() || thought,
      action: actionMatch?.[1]?.trim() || 'final_answer',
      actionInput: inputMatch?.[1]?.trim() || currentQuery,
      observation: '',
    };

    // Execute the action
    if (step.action === 'final_answer') {
      step.observation = step.actionInput;
      steps.push(step);
      finalAnswer = step.actionInput;
      break;
    } else if (step.action === 'rag_search') {
      const searchResult = await performRAG({
        query: step.actionInput,
        brain_id: brain.id,
        brain,
        apiKey,
      });
      step.observation = searchResult.context || 'No relevant documents found';
      steps.push(step);
    } else {
      // Try to execute a tool
      try {
        const tool = getTool(step.action);
        const result = await tool.execute(step.actionInput);
        step.observation = typeof result === 'string' ? result : JSON.stringify(result);
      } catch (error) {
        step.observation = `Tool execution failed: ${(error as Error).message}`;
      }
      steps.push(step);
    }

    // If this is the last iteration, force a final answer
    if (i === config.maxIterations - 1 && !finalAnswer) {
      const model2 = createModel(brain.chat_provider || 'groq', {
        apiKey,
        modelId: brain.chat_model || 'llama-3.3-70b-versatile',
      });

      const { text: answer } = await generateText({
        model: model2,
        system: 'Provide a final answer based on the observations made.',
        prompt: `Query: ${query}\n\nObservations:\n${steps.map(s => s.observation).join('\n')}`,
        temperature: config.temperature,
      });
      finalAnswer = answer;
    }
  }

  return { answer: finalAnswer, steps };
}
