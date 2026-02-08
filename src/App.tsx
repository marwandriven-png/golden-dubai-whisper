import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RegistrationPage from "./pages/RegistrationPage";
import AuthPage from "./pages/AuthPage";
import TeaserPage from "./pages/TeaserPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedTeaserRoute from "./components/ProtectedTeaserRoute";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
           <Route path="/" element={<LandingPage />} />
           <Route path="/register" element={<RegistrationPage />} />
           <Route path="/auth" element={<AuthPage />} />
           <Route
             path="/teaser"
             element={
               <ProtectedTeaserRoute>
                 <TeaserPage />
               </ProtectedTeaserRoute>
             }
           />
           <Route path="/admin" element={<AdminDashboard />} />
           <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
