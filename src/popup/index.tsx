/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root");

if (root) {
  render(() => <App />, root);
} else {
  console.error("Root element not found");
}
