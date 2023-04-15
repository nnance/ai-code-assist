// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Configuration, OpenAIApi } from "openai";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "ai-code-assist" is now active!'
  );

  const config = vscode.workspace.getConfiguration("ai-code-assist");
  const apiKey = config.get("apiKey") as string;

  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "ai-code-assist.explain",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      openai
        .createCompletion({
          model: "text-davinci-003",
          prompt: "What is OpenAI?",
        })
        .then((completion) => {
          vscode.window.showInformationMessage(
            completion.data.choices.map((choice) => choice.text).join("\n")
          );
        });
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
