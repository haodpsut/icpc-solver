export enum AIProvider {
  Gemini = 'gemini',
  OpenRouter = 'openrouter',
}

export interface ApiKeys {
  gemini: string;
  openrouter: string;
  drive: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
