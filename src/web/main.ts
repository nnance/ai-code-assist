// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  const vscode = acquireVsCodeApi();

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
      case "addResponse": {
        setResponse(message.value);
        break;
      }
      case "setPrompt": {
        (document.getElementById("prompt-input") as HTMLInputElement).value =
          message.value;
        break;
      }
    }
  });

  function fixCodeBlocks(response: string) {
    // Use a regular expression to find all occurrences of the substring in the string
    const REGEX_CODEBLOCK = new RegExp("```", "g");
    const matches = response.match(REGEX_CODEBLOCK);

    // Return the number of occurrences of the substring in the response, check if even
    const count = matches ? matches.length : 0;
    if (count % 2 === 0) {
      return response;
    } else {
      // else append ``` to the end to make the last code block complete
      return response.concat("\n```");
    }
  }

  function setResponse(response: string) {
    var converter = new showdown.Converter({
      omitExtraWLInCodeBlocks: true,
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      literalMidWordUnderscores: true,
      simpleLineBreaks: true,
    });

    const respElem = document.getElementById("response");
    if (!respElem) {
      return;
    }

    const html = converter.makeHtml(fixCodeBlocks(response));
    respElem.innerHTML = html;

    var preCodeBlocks = document.querySelectorAll("pre code");
    for (var i = 0; i < preCodeBlocks.length; i++) {
      preCodeBlocks[i].classList.add(
        "p-2",
        "my-2",
        "block",
        "overflow-x-scroll"
      );
    }

    var codeBlocks = document.querySelectorAll("code");
    for (var i = 0; i < codeBlocks.length; i++) {
      // Check if innertext starts with "Copy code"
      if (codeBlocks[i].innerText.startsWith("Copy code")) {
        codeBlocks[i].innerText = codeBlocks[i].innerText.replace(
          "Copy code",
          ""
        );
      }

      codeBlocks[i].classList.add(
        "inline-flex",
        "max-w-full",
        "overflow-hidden",
        "rounded-sm",
        "cursor-pointer"
      );

      codeBlocks[i].addEventListener("click", (e) => {
        e.preventDefault();
        vscode.postMessage({
          type: "codeSelected",
          value: codeBlocks[i].innerText,
        });
      });

      const d = document.createElement("div");
      d.innerHTML = codeBlocks[i].innerHTML;
      codeBlocks[i].innerHTML = "";
      codeBlocks[i].appendChild(d);
      d.classList.add("code");
    }

    microlight.reset("code");
  }

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
