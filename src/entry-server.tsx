import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { App } from "../App";
import "../styles/globals.css";
import { ConnectivityProvider } from "../components/ConnectivityIndicators";

const convex = new ConvexProvider(client={new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string)};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ConvexProvider client={convex}>
          <ConnectivityProvider>
            <App />
          </ConnectivityProvider>
        </ConvexProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);