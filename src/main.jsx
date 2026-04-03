import "./i18n/config.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./app/router.jsx";
import { RouterProvider } from "react-router-dom";
import { hydrateCasesFromServer } from "./data/casesStorage.js";

const rootEl = document.getElementById("root");

hydrateCasesFromServer().finally(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
});
