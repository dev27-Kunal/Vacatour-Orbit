import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/accessibility.css";
import { i18nInitPromise } from "./lib/i18n";

// Wait for i18n to initialize before rendering to prevent showing translation keys
i18nInitPromise.then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  console.error('Failed to initialize i18n:', error);
  // Render anyway to not block the app completely
  createRoot(document.getElementById("root")!).render(<App />);
});
