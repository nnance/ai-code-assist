import {
  ChatResponse,
  ChatRoleEnum,
  CompletionResponse,
  CreateChatSession,
  makeRequest,
} from "./llm";

interface MessageRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

interface MessageResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export const createChatSession: CreateChatSession = ({
  model = "codellama",
  temperature = 0.5,
  stream = false,
}) => {
  const history: string[] = [];

  function ask(prompt: string): Promise<CompletionResponse> {
    const message = { model, prompt, stream };

    return makeRequest<MessageRequest>(
      "http://localhost:11434/api/generate",
      message
    ).then((data) => JSON.parse(data) as MessageResponse);
  }

  function historyToChatResponse(history: string[]): ChatResponse[] {
    return history.map((message) => ({
      role: ChatRoleEnum.assistant,
      content: message,
    }));
  }

  return {
    ask,
    getHistory: () => historyToChatResponse(history),
    clearHistory: () => (history.length = 0),
  };
};
