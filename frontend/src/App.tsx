
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppProviders from "@/components/AppProviders";
import "./index.css"

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Lazy-loaded page components for code splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const ProductList = lazy(() => import("./pages/admin/ProductList"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const OrderList = lazy(() => import("./pages/admin/OrderList"));
const UserList = lazy(() => import("./pages/admin/UserList"));
const LiveActivity = lazy(() => import("./pages/admin/LiveActivity"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return null;
  return isAuthenticated ? children : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const LoginRoute = ({ initialIsLogin = true }: { initialIsLogin?: boolean }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Login initialIsLogin={initialIsLogin} />;
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
  <AppProviders>
    <ServerStatus />
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
          <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:category" element={<Products />} />
                          <Route path="/product/:productId" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/login" element={<LoginRoute initialIsLogin={true} />} />
                          <Route path="/signup" element={<LoginRoute initialIsLogin={false} />} />
                          <Route path="/register" element={<LoginRoute initialIsLogin={false} />} />
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
                      </Suspense>
                      </main>
                      <Footer />
                    </div>
                  </BrowserRouter>
  </AppProviders>
);

export default App;
