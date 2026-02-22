import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HashRouter from "./app/router";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter />
  </StrictMode>,
);
