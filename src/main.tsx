/// <reference types="vinxi/types/client" />

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { TRPCReactProvider } from "./trpc/react";

import "./styles.css";

import { createRouter } from "./router";

// Set up a Router instance
const router = createRouter();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <TRPCReactProvider>
        <RouterProvider router={router} />
      </TRPCReactProvider>
    </React.StrictMode>,
  );
}
