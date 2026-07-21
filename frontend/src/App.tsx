import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { ProductsPage } from "./pages/admin/ProductsPage";
import { StorePage } from "./pages/admin/StorePage";
import { HomePage } from "./pages/public/HomePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/admin/login"
        element={<LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route index element={<DashboardPage />} />

          <Route
            path="productos"
            element={<ProductsPage />}
          />

          <Route
            path="tienda"
            element={<StorePage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}