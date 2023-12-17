import * as http from "http";
import * as https from "https";

interface RequestOptions extends http.RequestOptions, https.RequestOptions {}

export function getOptions(): RequestOptions {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export function makeRequest<T>(
  url: string,
  options: RequestOptions,
  request: T
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

function sendRequest(
  url: string,
  data?: Buffer | URLSearchParams
): Promise<{
  statusCode: number;
  response: http.IncomingMessage | https.IncomingMessage;
}> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions: RequestOptions = {
      method: "GET", // or other HTTP methods you need
      ...(parsedUrl.protocol === "https:"
        ? { rejectUnauthorized: false, secure: true, port: 443 }
        : {}), // set options based on the protocol (HTTP or HTTPS)
      path: parsedUrl.pathname,
      headers: {
        "Content-Type": data ? "application/json" : "application/plaintext",
      },
      encoding: null, // disable auto-decoding of response body
    };

    const request =
      parsedUrl.protocol === "https:" ? https.request : http.request;
    const req = request(requestOptions, (res) => {
      if (res.statusCode >= 400) {
        return reject({ statusCode: res.statusCode, response: res });
      }

      resolve({ statusCode: res.statusCode, response: res });
    });

    if (data) {
      req.write(data);
      req.end();
    }

    req.on("error", (e) => {
      reject(e);
    });
  });
}
