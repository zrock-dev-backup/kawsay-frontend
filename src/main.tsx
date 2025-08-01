import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProviderWrapper } from "./contexts/ThemeContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

async function enableMocking() {
  if (import.meta.env.MODE !== "development") {
    return;
  }
  const { worker } = await import("./mocks/browser");
  return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ThemeProviderWrapper>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProviderWrapper>
    </React.StrictMode>,
  );
});
