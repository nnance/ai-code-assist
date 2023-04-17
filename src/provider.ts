import * as vscode from "vscode";

export class ChatGPTViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "ai-code-assist.chatView";

  // In the constructor, we store the URI of the extension
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly askHandler: (prompt: string) => void
  ) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    // set options for the webview
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // set the HTML for the webview
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // add an event listener for messages received by the webview
    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "prompt": {
          this.askHandler(data.value);
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "web", "main.js")
    );
    const microlightUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "scripts",
        "microlight.min.js"
      )
    );
    const tailwindUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "scripts",
        "showdown.min.js"
      )
    );
    const showdownUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "scripts",
        "tailwind.min.js"
      )
    );

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script src="${tailwindUri}"></script>
				<script src="${showdownUri}"></script>
				<script src="${microlightUri}"></script>
				<style>
				.code {
					white-space : pre;
				</style>
			</head>
			<body>
				<input class="h-10 w-full text-white bg-stone-700 p-4 text-sm" type="text" id="prompt-input" />
				<div id="response" class="pt-6 text-sm">
				</div>
				<script src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}