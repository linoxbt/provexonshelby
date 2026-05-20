import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/providers/WalletProvider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Explorer from "./pages/Explorer.tsx";
import ApiKeys from "./pages/ApiKeys.tsx";
import DatasetDetail from "./pages/DatasetDetail.tsx";
import Models from "./pages/Models.tsx";
import Docs from "./pages/Docs.tsx";
import Simulation from "./pages/Simulation.tsx";
import Settings from "./pages/Settings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/explorer/:blobId" element={<Explorer />} />
            <Route path="/dataset/:blobId" element={<DatasetDetail />} />
            <Route path="/models" element={<Models />} />
            <Route path="/api" element={<ApiKeys />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
