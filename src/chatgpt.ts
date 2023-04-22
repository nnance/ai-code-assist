import * as https from "https";

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

export type MessageRequest = {
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

function getOptions(apiKey: string) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };
}

export function makeRequest(
  url: string,
  options: ReturnType<typeof getOptions>,
  request: MessageRequest
) {
  return new Promise<string>((resolve) => {
    const req = https.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });

    req.on("error", (err) => {
      console.error(err);
      throw err;
    });

    const postData = JSON.stringify(request);

    req.write(postData);
    req.end();
  });
}

// TODO: Add support for streaming responses
// TODO: Add support for other endpoints

function chatCompletion(apiKey: string, messages: Message[] = []) {
  const request: MessageRequest = {
    model,
    messages,
    temperature,
    top_p: 1,
  };

  const options = getOptions(apiKey);

  return makeRequest(
    "https://api.openai.com/v1/chat/completions",
    options,
    request
  ).then((data) => JSON.parse(data) as MessageResponse);
}

export function createChatSession(apiKey: string) {
  const history: Message[] = [];

  function ask(prompt: string) {
    const message = { role: MessageRoleEnum.user, content: prompt };

    return chatCompletion(apiKey, [...history, message]).then((response) => {
      const messages = response.choices.map((choice) => choice.message);
      history.push(message, ...messages);
      return response;
    });
  }

  function clearHistory() {
    history.length = 0;
  }

  return {
    ask,
    getHistory: () => history,
    clearHistory,
  };
}
