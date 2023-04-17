// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  // Listen for keyup events on the prompt input element
  const promptInput = document.getElementById("prompt-input");
  if (promptInput) {
    promptInput.addEventListener("keyup", function (e) {
      // If the key that was pressed was the Enter key
      if (e.code === "Enter") {
        const value = (promptInput as HTMLInputElement).value;
        vscode.postMessage({
          type: "prompt",
          value: value,
        });
      }
    });
  }
})();
