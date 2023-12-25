import {
  ChatResponse,
  ChatRoleEnum,
  CompletionResponse,
  CreateChatSession,
  makeRequest,
} from "./llm";

const model = "gpt-3.5-turbo-0301";
const temperature = 0.7;

enum MessageRoleEnum {
  system = "system",
  user = "user",
  assistant = "assistant",
}

type Message = {
  role: MessageRoleEnum;
  content: string;
};

type MessageRequest = {
  model: string;
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  logprobs?: number;
  stop?: string;
};

type MessageResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
    logprobs: any;
  }[];
};

// TODO: Add support for streaming responses
// TODO: Add complete chat conversation by including history in the request for context
// TODO: Add support for other endpoints

function chatCompletion(apiKey: string, messages: Message[] = []) {
  const request: MessageRequest = {
    model,
    messages,
    temperature,
    top_p: 1,
  };

  return makeRequest<MessageRequest>(
    "https://api.openai.com/v1/chat/completions",
    request,
    apiKey
  ).then((data) => JSON.parse(data) as MessageResponse);
}

export const createChatSession: CreateChatSession = ({ apiKey }) => {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const history: Message[] = [];

  function ask(prompt: string): Promise<CompletionResponse> {
    const message = { role: MessageRoleEnum.user, content: prompt };

    return chatCompletion(apiKey!, [...history, message])
      .then((response) => {
        const messages = response.choices.map((choice) => choice.message);
        history.push(message, ...messages);
        return response;
      })
      .then((response) => ({
        model: response.model,
        response: response.choices
          .map((choice) => choice.message.content)
          .join("\n"),
      }));
  }

  function historyToChatResponse(history: Message[]): ChatResponse[] {
    return history.map((message) => ({
      role:
        message.role === MessageRoleEnum.user
          ? ChatRoleEnum.user
          : ChatRoleEnum.assistant,
      content: message.content,
    }));
  }

  return {
    ask,
    getHistory: () => historyToChatResponse(history),
    clearHistory: () => (history.length = 0),
  };
};
