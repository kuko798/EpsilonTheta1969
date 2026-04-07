import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { LineagePage } from "./pages/LineagePage";

const AdminEventsPage = lazy(() =>
  import("./pages/AdminEventsPage").then((m) => ({ default: m.AdminEventsPage }))
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="lineage" element={<LineagePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route
          path="admin/events"
          element={
            <Suspense fallback={<p style={{ padding: "6rem 1rem", textAlign: "center" }}>Loading…</p>}>
              <AdminEventsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
