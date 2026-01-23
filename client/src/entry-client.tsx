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

// Remove the anti-FOUC style once the app is hydrated and styles are loaded
// Use requestAnimationFrame to ensure the paint cycle has occurred
requestAnimationFrame(() => {
  const style = document.getElementById('anti-fouc');
  if (style) {
    style.remove();
    document.body.style.opacity = '1';
  }
});
