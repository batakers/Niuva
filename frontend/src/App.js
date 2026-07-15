import "@/App.css";
import { Component, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider, useI18n } from "@/i18n";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "@/pages/marketing/HomePage";

const About = lazy(() => import("@/pages/marketing/AboutPage"));
const Capabilities = lazy(() => import("@/pages/marketing/CapabilitiesPage"));
const Projects = lazy(() => import("@/pages/marketing/ProjectsPage"));
const Contact = lazy(() => import("@/pages/marketing/ContactPage"));
const Shop = lazy(() => import("@/pages/marketing/ShopPage"));
const Merchandise = lazy(() => import("@/pages/marketing/MerchandisePage"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const ClientDashboard = lazy(() => import("@/pages/operational/ClientDashboard"));
const NewOrder = lazy(() => import("@/pages/operational/NewOrder"));
const OrderDetail = lazy(() => import("@/pages/operational/OrderDetail"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminMaterials = lazy(() => import("@/pages/admin/Materials"));
const AdminPortfolio = lazy(() => import("@/pages/admin/PortfolioAdmin"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminInternships = lazy(() => import("@/pages/admin/Internships"));
const AdminContacts = lazy(() => import("@/pages/admin/Contacts"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminMerchandise = lazy(() => import("@/pages/admin/MerchandiseAdmin"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-surface-page" role="status" aria-live="polite">
      <span className="sr-only">Memuat halaman</span>
    </div>
  );
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Application render error", error);
    }
  }

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-surface-page px-6 text-center">
          <div className="max-w-lg">
            <p className="font-mono-tech text-sm font-semibold text-action-primary">KONEKSI TERPUTUS</p>
            <h1 className="mt-4 text-3xl font-extrabold text-text-primary">Halaman belum berhasil dimuat.</h1>
            <p className="mt-4 leading-7 text-text-secondary">
              Periksa koneksi Anda, lalu muat ulang halaman. Jika masalah berlanjut, hubungi tim Niuva melalui kanal resmi.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-control bg-action-primary px-5 py-3 text-sm font-semibold text-text-inverse hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
            >
              Muat ulang halaman
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

function ResettableAppBoundary({ children }) {
  const { locale } = useI18n();
  return <AppErrorBoundary resetKey={locale}>{children}</AppErrorBoundary>;
}

function App() {
  return (
    <div className="App">
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <ResettableAppBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/capabilities" element={<Capabilities />} />
                <Route path="/services" element={<Capabilities />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/portfolio" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/merchandise" element={<Merchandise />} />
                <Route path="/apparel" element={<Merchandise />} />
                <Route path="/store" element={<Shop />} />
                <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
                <Route path="/order" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/materials" element={<ProtectedRoute adminOnly><AdminMaterials /></ProtectedRoute>} />
                <Route path="/admin/merchandise" element={<ProtectedRoute adminOnly><AdminMerchandise /></ProtectedRoute>} />
                <Route path="/admin/portfolio" element={<ProtectedRoute adminOnly><AdminPortfolio /></ProtectedRoute>} />
                <Route path="/admin/internships" element={<ProtectedRoute adminOnly><AdminInternships /></ProtectedRoute>} />
                <Route path="/admin/contacts" element={<ProtectedRoute adminOnly><AdminContacts /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ResettableAppBoundary>
            <Toaster position="top-right" theme="light" richColors />
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </div>
  );
}

export default App;


