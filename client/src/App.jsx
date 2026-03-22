// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import MenuPage from "./pages/student/MenuPage";
import OrderSummary from "./pages/student/OrderSummary";
import MyOrders from "./pages/student/MyOrders";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrderManagement from "./pages/admin/OrderManagement";
import MenuManagement from "./pages/admin/MenuManagement";
import InventoryPage from "./pages/admin/InventoryPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";

// Server Pages
import ServerDashboard from "./pages/server/ServerDashboard";

// Not Found
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to correct dashboard based on role
    if (user?.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "server") return <Navigate to="/server/dashboard" replace />;
  }

  return children;
};

// Public route — redirect if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "server") return <Navigate to="/server/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/menu" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <MenuPage />
        </ProtectedRoute>
      } />
      <Route path="/student/order-summary" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <OrderSummary />
        </ProtectedRoute>
      } />
      <Route path="/student/my-orders" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <MyOrders />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <OrderManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/menu" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <MenuManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/inventory" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <InventoryPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AnalyticsPage />
        </ProtectedRoute>
      } />

      {/* Server Routes */}
      <Route path="/server/dashboard" element={
        <ProtectedRoute allowedRoles={["server"]}>
          <ServerDashboard />
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
