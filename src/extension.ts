// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Configuration, OpenAIApi } from "openai";
import { ChatGPTViewProvider } from "./provider";

const createSession = (): OpenAIApi => {
  const config = vscode.workspace.getConfiguration("ai-code-assist");
  const apiKey = config.get("apiKey") as string;

  const configuration = new Configuration({ apiKey });
  return new OpenAIApi(configuration);
};

const ask = (openai: OpenAIApi) => (prompt: string) => {
  // The code you place here will be executed every time your command is executed
  // Display a message box to the user
  console.log("prompt", prompt);
  return openai
    .createCompletion({
      model: "text-davinci-003",
      prompt,
    })
    .then((completion) =>
      completion.data.choices.map((choice) => choice.text).join()
    );
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "ai-code-assist" is now active!'
  );

  const session = createSession();
  const askCommand = ask(session);

  // Create a new ChatGPTViewProvider instance and register it with the extension's context
  const provider = new ChatGPTViewProvider(context.extensionUri, askCommand);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatGPTViewProvider.viewType,
      provider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );

  const commandAsk = vscode.commands.registerCommand(
    "ai-code-assist.ask",
    () => {
      vscode.window
        .showInputBox({ prompt: "What do you want to do?" })
        .then((prompt) => askCommand(prompt || ""))
        .then((response) => provider.setResponse(response));
    }
  );

  const commandExplain = vscode.commands.registerCommand(
    "ai-code-assist.explain",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      // Get the selected text of the active editor
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);
      const prompt = "Explain what this code does: ";

      if (selection && selectedText) {
        // If there is a selection, add the prompt and the selected text to the search prompt
        const searchPrompt = `${prompt}\n\`\`\`\n${selectedText}\n\`\`\``;

        askCommand(searchPrompt).then((response) => {
          provider.setResponse(response);
        });
      }
    }
  );

  context.subscriptions.push(commandAsk, commandExplain);
}

// This method is called when your extension is deactivated
export function deactivate() {}
