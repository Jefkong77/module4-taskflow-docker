import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerProvider } from "./contexts/CustomerContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CustomerProvider>
        <App />
      </CustomerProvider>
    </AuthProvider>
  </StrictMode>,
);
