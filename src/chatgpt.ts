import { CompletionResponse } from "./types";
import { getOptions, makeRequest } from "./util";

const model = "gpt-3.5-turbo-0301";
const temperature = 0.7;

export enum MessageRoleEnum {
  system = "system",
  user = "user",
  assistant = "assistant",
}

export type Message = {
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

export type MessageResponse = {
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
// TODO: Add support for other endpoints

function getOpenAIOptions(apiKey: string) {
  const options = getOptions();
  options.headers = {
    ...options.headers,
    ...{
      Authorization: `Bearer ${apiKey}`,
    },
  };
  return options;
}

function chatCompletion(apiKey: string, messages: Message[] = []) {
  const request: MessageRequest = {
    model,
    messages,
    temperature,
    top_p: 1,
  };

  const options = getOpenAIOptions(apiKey);

  return makeRequest<MessageRequest>(
    "https://api.openai.com/v1/chat/completions",
    options,
    request
  ).then((data) => JSON.parse(data) as MessageResponse);
}

export const createChatSession = (apiKey: string) => () => {
  const history: Message[] = [];

  function ask(prompt: string): Promise<CompletionResponse> {
    const message = { role: MessageRoleEnum.user, content: prompt };

    return chatCompletion(apiKey, [...history, message])
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

  function clearHistory() {
    history.length = 0;
  }

  return {
    ask,
    getHistory: () => history,
    clearHistory,
  };
};
