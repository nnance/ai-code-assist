import { makeRequest } from "./util";

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

function getOptions() {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export function createChatSession(
  model = "mistral",
  temperature = 0.5,
  stream = false
) {
  const history: string[] = [];

  function ask(prompt: string) {
    const message = { model, prompt, stream };

    const options = getOptions();

    return makeRequest<MessageRequest>(
      "http://localhost:11434/api/generate",
      options,
      message
    ).then((data) => JSON.parse(data) as MessageResponse);
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
