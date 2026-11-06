// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router";
import WelcomePage from "./pages/WelcomePage";
import RootLayout from "./layouts/RootLayout";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import NewCustomerPage from "./pages/NewCustomerPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import EditCustomerPage from "./pages/EditCustomerPage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";

// Module 4, Option 3: the API URL is set at build time.
// Netlify: VITE_API_BASE_URL=https://<your-crm-api>.onrender.com
// Local: falls back to the Spring Boot API on port 8080.
export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route index element={<WelcomePage />} />
        <Route path="login" element={<LoginPage />} />

        {/* User must be logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<RootLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/new" element={<NewCustomerPage />} />
            <Route
              path="customers/:id"
              element={<CustomerDetailPage />}
            />
            <Route
              path="customers/:id/edit"
              element={<EditCustomerPage />}
            />
          </Route>
        </Route>

        {/* Any URL that does not match */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;