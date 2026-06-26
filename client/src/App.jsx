// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Qless from "./components/Qless";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import MenuPage from "./pages/student/MenuPage";
import OrderSummary from "./pages/student/OrderSummary";
import MyOrders from "./pages/student/MyOrders";
import StudentInsights from "./pages/student/StudentInsights";
import StudentCartPage from "./pages/student/StudentCartPage";
import StudentNav from "./components/student/StudentNav";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrderManagement from "./pages/admin/OrderManagement";
import MenuManagement from "./pages/admin/MenuManagement";
import InventoryPage from "./pages/admin/InventoryPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminPredictions from "./pages/admin/AdminPredictions";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminSidebar from "./components/admin/AdminSidebar";

// Server Pages
import ServerDashboard from "./pages/server/ServerDashboard";
import ServerNav from "./components/server/ServerNav";

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
      <Route path="/dash/dashboard" element={<Qless />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentNav />
          <Outlet />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="order-summary" element={<OrderSummary />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="insights" element={<StudentInsights />} />
        <Route path="cart" element={<StudentCartPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <div className="flex bg-gray-50 min-h-screen">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto h-screen">
              <Outlet />
            </main>
          </div>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="predictions" element={<AdminPredictions />} />
        <Route path="students" element={<AdminStudents />} />
      </Route>

      {/* Server Routes */}
      <Route path="/server" element={
        <ProtectedRoute allowedRoles={["server"]}>
          <ServerNav />
          <Outlet />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<ServerDashboard />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-right" richColors />
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
