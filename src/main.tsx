// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import MiniKitProvider from "./components/MiniKitProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MiniKitProvider>
      <App />
    </MiniKitProvider>
  </React.StrictMode>
);
