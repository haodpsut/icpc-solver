export enum InputMode {
  TEXT = 'TEXT',
  PDF = 'PDF',
}

export interface AnalysisResult {
  analysis: string;
  solution: string;
}

export enum AiProvider {
  GEMINI = 'GEMINI',
  OPENROUTER = 'OPENROUTER',
}

export type OpenRouterModel =
  | 'deepseek/deepseek-chat-v3-0324:free'
  | 'google/gemini-2.0-flash-exp:free'
  | 'mistralai/mistral-nemo:free'
  | 'qwen/qwen3-32b:free'
  | 'google/gemma-3-27b-it:free'
  | 'microsoft/mai-ds-r1:free';

export const OPENROUTER_MODELS: { id: OpenRouterModel; name: string }[] = [
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'Deepseek Chat' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash' },
  { id: 'mistralai/mistral-nemo:free', name: 'Mistral Nemo' },
  { id: 'qwen/qwen3-32b:free', name: 'Qwen3 32B' },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma3 27B' },
  { id: 'microsoft/mai-ds-r1:free', name: 'Microsoft MAI' },
];