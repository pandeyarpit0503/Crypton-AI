import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import Index from "./pages/Index";
import Market from "./pages/Market";
import Trending from "./pages/Trending";
import NotFound from "./pages/NotFound";
import Analysis from "./pages/Analysis";
import { EnhancedHero } from "@/components/dashboard/enhanced-hero";
import CryptoNews from "./pages/CryptoNews";
import AIChatPage from "./pages/AIChat";
import { AuthProvider } from "@/contexts/AuthContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import { AlertProvider } from "@/contexts/AlertContext";
import Watchlist from "./pages/Watchlist";
import { Login } from "@/components/auth/Login";
import { Signup } from "@/components/auth/Signup";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserProfile } from "@/components/auth/UserProfile";
import AuthDemo from "./pages/AuthDemo";
import AuthCallback from "./pages/AuthCallback";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import Simulator from "./pages/Simulator";




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PortfolioProvider>
            <WatchlistProvider>
              <AlertProvider>
                <Navbar />
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            } />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <EnhancedHero/>
              </ProtectedRoute>
            } />
            <Route path="/market" element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            } />
            <Route path="/trending" element={
              <ProtectedRoute>
                <Trending />
              </ProtectedRoute>
            } />
            <Route path="/analysis/:coinId" element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            } />
            <Route path="/cryptonews" element={
              <ProtectedRoute>
                <CryptoNews />
              </ProtectedRoute>
            } />
            <Route path="/ai-chat" element={
              <ProtectedRoute>
                <AIChatPage />
              </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
                  <div className="container mx-auto px-4 py-10">
                    <UserProfile />
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/auth-demo" element={<AuthDemo />} />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } />
            <Route path="/portfolio/:id" element={
              <ProtectedRoute>
                <PortfolioDetail />
              </ProtectedRoute>
            } />
            <Route path="/simulator" element={
              <ProtectedRoute>
                <Simulator />
              </ProtectedRoute>
            } />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
              </AlertProvider>
            </WatchlistProvider>
          </PortfolioProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
