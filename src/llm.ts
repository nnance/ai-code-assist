export interface CompletionRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

export interface CompletionResponse {
  model: string;
  response: string;
}

export enum ChatRoleEnum {
  system = "system",
  user = "user",
  assistant = "assistant",
}

export interface ChatResponse {
  role: ChatRoleEnum;
  content: string;
}

export interface ChatSession {
  ask: (prompt: string) => Promise<CompletionResponse>;
  getHistory: () => ChatResponse[];
  clearHistory: () => void;
}

export interface ChatSessionOptions {
  model: string;
  temperature?: number;
  stream?: boolean;
  apiKey?: string;
}

export type CreateChatSession = (options: ChatSessionOptions) => ChatSession;
