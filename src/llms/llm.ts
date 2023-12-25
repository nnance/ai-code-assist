import * as http from "http";
import * as https from "https";

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

interface RequestOptions extends http.RequestOptions, https.RequestOptions {}

function getOptions<T>(
  url: string,
  body?: T,
  apiKey?: string
): Promise<RequestOptions> {
  const { protocol } = new URL(url);
  const headers: Record<string, string> = {
    ...{
      "Content-Type": body ? "application/json" : "application/plaintext",
    },
    ...(apiKey
      ? {
          Authorization: `Bearer ${apiKey}`,
        }
      : {}), // set options based apiKey
    ...(protocol === "https:"
      ? { rejectUnauthorized: "false", secure: "true", port: "443" }
      : {}), // set options based on the protocol (HTTP or HTTPS)
  };
  return Promise.resolve({
    method: body ? "POST" : "GET",
    headers,
  });
}

function sendRequest<T>(url: string, options: RequestOptions, body?: T) {
  return new Promise<string>((resolve) => {
    const { protocol } = new URL(url);
    const request = protocol === "https:" ? https.request : http.request;

    const req = request(url, options, (res) => {
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

    const postData = JSON.stringify(body);

    req.write(postData);
    req.end();
  });
}

export function makeRequest<T>(url: string, body: T, apiKey?: string) {
  return getOptions(url, body, apiKey).then((options) => {
    return sendRequest(url, options, body);
  });
}
