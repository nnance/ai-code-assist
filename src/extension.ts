// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ChatGPTViewProvider } from "./provider";
import { createChatSession } from "./ollama";

const config = vscode.workspace.getConfiguration("ai-code-assist");
const apiKey = config.get("apiKey") as string;
const session = createChatSession();

const ask = (prompt: string, continueChat = false) => {
  // The code you place here will be executed every time your command is executed
  // Display a message box to the user

  if (!continueChat) {
    session.clearHistory();
  }

  return session.ask(prompt).then((completion) => completion.response);
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "ai-code-assist" is now active!'
  );

  // Create a new ChatGPTViewProvider instance and register it with the extension's context
  const provider = new ChatGPTViewProvider(context.extensionUri, ask);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatGPTViewProvider.viewType,
      provider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );

  const commandHandler = (command: string) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    // Get the selected text of the active editor
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (selection && selectedText) {
      // If there is a selection, add the prompt and the selected text to the search prompt
      const searchPrompt = `${command}\n\`\`\`\n${selectedText}\n\`\`\``;

      provider.setPrompt(command);
      ask(searchPrompt).then((response) => {
        provider.setResponse(response);
      });
    }
  };

  const commandAsk = vscode.commands.registerCommand(
    "ai-code-assist.ask",
    () => {
      vscode.window
        .showInputBox({ prompt: "What do you want to do?" })
        .then((prompt) => ask(prompt || ""))
        .then((response) => provider.setResponse(response));
    }
  );

  const commandExplain = vscode.commands.registerCommand(
    "ai-code-assist.explain",
    () => {
      commandHandler("Explain what this code does:");
    }
  );

  const commandRefactor = vscode.commands.registerCommand(
    "ai-code-assist.refactor",
    () => {
      commandHandler("Refactor this code:");
    }
  );

  const commandOptimize = vscode.commands.registerCommand(
    "ai-code-assist.optimize",
    () => {
      commandHandler("Optimize this code:");
    }
  );

  const commandProblems = vscode.commands.registerCommand(
    "ai-code-assist.findProblems",
    () => {
      commandHandler("Find problems in this code:");
    }
  );

  const commandTest = vscode.commands.registerCommand(
    "ai-code-assist.writeTest",
    () => {
      commandHandler("Generate mocha tests for this code:");
    }
  );

  const commandResetConversation = vscode.commands.registerCommand(
    "ai-code-assist.resetConversation",
    () => {
      session.clearHistory();
    }
  );

  context.subscriptions.push(
    commandAsk,
    commandExplain,
    commandRefactor,
    commandOptimize,
    commandProblems,
    commandTest,
    commandResetConversation
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
