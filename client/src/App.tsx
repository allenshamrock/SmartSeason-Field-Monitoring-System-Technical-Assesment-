import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/auth-context";
import LoginPage from "./pages/login";
import ProtectedRoute from "./components/protected-route";
import Layout from "./components/layout";
import DashboardPage from "./pages/dashboard";
import FieldsPage from "./pages/field";
import FieldDetailPage from "./pages/field-details";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "DM Sans, sans-serif",
              fontSize: 14,
              borderRadius: 10,
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fields"
            element={
              <ProtectedRoute>
                <Layout>
                  <FieldsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/fields/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FieldDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
