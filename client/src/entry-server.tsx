import { renderToString } from "react-dom/server";
import { dehydrate, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import * as ReactHelmetAsync from "react-helmet-async";
import { createQueryClient } from "./lib/queryClient";
import { Router } from "wouter";
import App from "./App";
import "./index.css";

export async function render(url: string) {
  try {
    const queryClient = createQueryClient();

    // Set default auth state to null (not logged in) for SSR to avoid loading state
    queryClient.setQueryData(["/api/auth/me"], null);

    // Prefetch data based on URL
    if (url === '/') {
      await Promise.all([
        queryClient.prefetchQuery({ queryKey: ['/api/stories'] }),
        queryClient.prefetchQuery({ queryKey: ['/api/stories/featured'] }),
        queryClient.prefetchQuery({ queryKey: ['/api/banners/active'] })
      ]);
    } else if (url === '/games') {
      await queryClient.prefetchQuery({ queryKey: ['/api/games'] });
    } else if (url === '/videos') {
      await queryClient.prefetchQuery({ queryKey: ['/api/videos'] });
    } else {
      const storyMatch = url.match(/^\/story\/(\d+)$/);
      if (storyMatch) {
        const storyId = storyMatch[1];
        await queryClient.prefetchQuery({ queryKey: [`/api/stories/${storyId}`] });
      }
    }
    
    // Simple static location hook for SSR
    const hook = () => [url, () => {}] as [string, (to: string) => void];
    const helmetContext: any = {};
    const helmetModule: any = ReactHelmetAsync;
    const HelmetProvider =
      helmetModule.HelmetProvider || helmetModule.default?.HelmetProvider;
    
    console.log(`[SSR] Rendering url: ${url}`);

    const html = renderToString(
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Router hook={hook}>
              <App />
            </Router>
          </HydrationBoundary>
        </QueryClientProvider>
      </HelmetProvider>
    );
    
    const dehydratedState = dehydrate(queryClient);
    const { helmet } = helmetContext;
    
    console.log(`[SSR] Render success`);
    return { html, dehydratedState, helmet };
  } catch (error) {
    console.error("[SSR] Render error:", error);
    throw error;
  }
}
