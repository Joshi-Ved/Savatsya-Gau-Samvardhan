
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import InstallPrompt from "@/components/InstallPrompt";
import "./index.css"



import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";


import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import ProductList from "./pages/admin/ProductList";
import ProductForm from "./pages/admin/ProductForm";
import Dashboard from "./pages/admin/Dashboard";
import OrderList from "./pages/admin/OrderList";
import UserList from "./pages/admin/UserList";
import LiveActivity from "./pages/admin/LiveActivity";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  return isAuthenticated ? children : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const LoginRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
};

const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user?.isAdmin ? children : <Navigate to="/" replace />;
};

const ServerStatus = () => {
  const { serverError, checkAuth } = useAuth();

  if (!serverError) return null;

  return (
    <div className="bg-red-500 text-white text-center py-2 px-4 fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2">
      <span className="text-sm font-medium">Cannot connect to server. Some features may be unavailable.</span>
      <button
        onClick={() => checkAuth()}
        className="bg-white text-red-500 px-3 py-1 rounded text-xs font-bold hover:bg-gray-100 transition-colors"
      >
        Retry
      </button>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AnalyticsProvider>
            <CartProvider>
              <WishlistProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <InstallPrompt />
                  <ServerStatus />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <div className="flex flex-col min-h-screen">
                      <Navbar />
                      <main className="flex-grow">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:category" element={<Products />} />
                          <Route path="/product/:productId" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/login" element={<LoginRoute />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route
                            path="/profile"
                            element={
                              <RequireAuth>
                                <Profile />
                              </RequireAuth>
                            }
                          />
                          <Route
                            path="/checkout"
                            element={
                              <RequireAuth>
                                <Checkout />
                              </RequireAuth>
                            }
                          />
                          <Route path="/checkout-success" element={<CheckoutSuccess />} />

                          {/* Admin Routes */}
                          <Route path="/admin" element={
                            <RequireAdmin>
                              <AdminLayout />
                            </RequireAdmin>
                          }>
                            <Route index element={<Dashboard />} />
                            <Route path="live-activity" element={<LiveActivity />} />
                            <Route path="products" element={<ProductList />} />
                            <Route path="products/new" element={<ProductForm />} />
                            <Route path="products/:id/edit" element={<ProductForm />} />
                            <Route path="orders" element={<OrderList />} />
                            <Route path="users" element={<UserList />} />
                          </Route>

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  </BrowserRouter>
                </TooltipProvider>
              </WishlistProvider>
            </CartProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
