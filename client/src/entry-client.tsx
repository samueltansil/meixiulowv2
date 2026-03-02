import { hydrateRoot } from "react-dom/client";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "./lib/helmet";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

// @ts-ignore
const dehydratedState = window.__REACT_QUERY_STATE__;

hydrateRoot(
  document.getElementById("root")!,
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <App />
      </HydrationBoundary>
    </QueryClientProvider>
  </HelmetProvider>
);
