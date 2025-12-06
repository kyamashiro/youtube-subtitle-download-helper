import type { Component } from "solid-js";
import { render } from "solid-js/web";
import { SubtitleDownloadButton } from "./components/SubtitleDownloadButton";
import { useDOMInjection } from "./hooks/useDOMInjection";
import "./App.css";

const App: Component = () => {
  let buttonContainer: HTMLDivElement | undefined;

  useDOMInjection(() => buttonContainer);

  return (
    <div ref={buttonContainer} class="subtitle-download-container">
      <SubtitleDownloadButton />
    </div>
  );
};

// Initialization
let isInitialized = false;

function initializeApp(): void {
  if (isInitialized) return;

  const init = () => {
    if (document.getElementById("subtitle-download-app")) return;

    const container = document.createElement("div");
    container.id = "subtitle-download-app";
    container.style.cssText = "position: absolute; pointer-events: none;";
    document.body.appendChild(container);

    render(() => <App />, container);
    isInitialized = true;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}

export default initializeApp;
