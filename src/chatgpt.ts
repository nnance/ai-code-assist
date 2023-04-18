import * as https from "https";

export function sendMessage(apiKey: string, prompt: string) {
  return new Promise<string>((resolve) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const req = https.request(
      "https://api.openai.com/v1/chat/completions",
      options,
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log(JSON.parse(data));
          resolve(
            JSON.parse(data)
              .choices.map((c: any) => c.message.content)
              .join(" ")
          );
        });
      }
    );

    req.on("error", (err) => {
      console.error(err);
    });

    const postData = JSON.stringify({
      model: "gpt-3.5-turbo-0301",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    req.write(postData);
    req.end();
  });
}
