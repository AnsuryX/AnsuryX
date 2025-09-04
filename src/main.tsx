import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, setupOfflineHandling } from "./utils/pwa";

function AppWithPWA() {
  useEffect(() => {
    registerServiceWorker();
    setupOfflineHandling();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithPWA />
  </StrictMode>
);
