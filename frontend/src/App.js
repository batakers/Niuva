import "@/App.css";
import { Component, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ADMIN_ROUTE_PERMISSIONS } from "@/lib/permissions";
import Home from "@/pages/marketing/HomePage";

const About = lazy(() => import("@/pages/marketing/AboutPage"));
const Capabilities = lazy(() => import("@/pages/marketing/CapabilitiesPage"));
const Projects = lazy(() => import("@/pages/marketing/ProjectsPage"));
const Contact = lazy(() => import("@/pages/marketing/ContactPage"));
const NotFound = lazy(() => import("@/pages/marketing/NotFoundPage"));
const PrivacyPolicy = lazy(() => import("@/pages/marketing/PrivacyPolicyPage"));
const Faq = lazy(() => import("@/pages/marketing/FaqPage"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const ClientDashboard = lazy(() => import("@/pages/operational/ClientDashboard"));
const NewOrder = lazy(() => import("@/pages/operational/NewOrder"));
const OrderDetail = lazy(() => import("@/pages/operational/OrderDetail"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminCatalog = lazy(() => import("@/pages/admin/Catalog"));
const AdminProductEditor = lazy(() => import("@/pages/admin/ProductEditor"));
const AdminMaterials = lazy(() => import("@/pages/admin/Materials"));
const AdminInventory = lazy(() => import("@/pages/admin/Inventory"));
const AdminStockMovements = lazy(() => import("@/pages/admin/StockMovements"));
const AdminRestockAlerts = lazy(() => import("@/pages/admin/RestockAlerts"));
const AdminPortfolio = lazy(() => import("@/pages/admin/PortfolioAdmin"));
const AdminContent = lazy(() => import("@/pages/admin/ContentEditor"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminContacts = lazy(() => import("@/pages/admin/Contacts"));
const AdminInquiryList = lazy(() =>
  import("@/pages/admin/B2BList").then((m) => ({ default: m.InquiryList }))
);
const AdminQuoteList = lazy(() =>
  import("@/pages/admin/B2BList").then((m) => ({ default: m.QuoteList }))
);
const AdminProjectList = lazy(() =>
  import("@/pages/admin/B2BList").then((m) => ({ default: m.ProjectList }))
);
const AdminInquiryDetail = lazy(() =>
  import("@/pages/admin/B2BDetail").then((m) => ({ default: m.InquiryDetail }))
);
const AdminQuoteDetail = lazy(() =>
  import("@/pages/admin/B2BDetail").then((m) => ({ default: m.QuoteDetail }))
);
const AdminProjectDetail = lazy(() =>
  import("@/pages/admin/B2BDetail").then((m) => ({ default: m.ProjectDetail }))
);
const AdminQuoteRevisionEditor = lazy(() =>
  import("@/pages/admin/QuoteRevisionEditor")
);
const AdminWorkOrderList = lazy(() =>
  import("@/pages/admin/B2BList").then((m) => ({ default: m.WorkOrderList }))
);
const AdminWorkOrderDetail = lazy(() =>
  import("@/pages/admin/WorkOrderDetail")
);
const AdminRetailOrderList = lazy(() =>
  import("@/pages/admin/B2BList").then((m) => ({ default: m.RetailOrderList }))
);
const AdminRetailOrderDetail = lazy(() =>
  import("@/pages/admin/RetailOrderDetail")
);
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminNotifications = lazy(() => import("@/pages/admin/Notifications"));
const AdminNotificationFeed = lazy(() => import("@/pages/admin/NotificationFeed"));
const brandLabEnabled = process.env.REACT_APP_ENABLE_BRAND_LAB === "true";
const EditorialHomepagePrototype = brandLabEnabled
  ? lazy(() => import("@/pages/brand-lab/EditorialHomepagePrototype"))
  : null;
const ExperimentalHomepagePrototype = brandLabEnabled
  ? lazy(() => import("@/pages/brand-lab/ExperimentalHomepagePrototype"))
  : null;

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
    if (process.env.NODE_ENV !== "production") console.error("Application render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-surface-page px-6 text-center">
          <div className="max-w-lg">
            <p className="font-mono-tech text-sm font-semibold text-action-primary">KONEKSI TERPUTUS</p>
            <h1 className="mt-4 text-3xl font-extrabold text-text-primary">Halaman belum berhasil dimuat.</h1>
            <p className="mt-4 leading-7 text-text-secondary">Periksa koneksi Anda, lalu muat ulang halaman. Jika masalah berlanjut, hubungi tim Niuva melalui kanal resmi.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-control bg-action-primary px-5 py-3 text-sm font-semibold text-text-inverse hover:bg-action-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2">Muat ulang halaman</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

const protectedPage = (path, element) => (
  <ProtectedRoute permission={ADMIN_ROUTE_PERMISSIONS[path]}>{element}</ProtectedRoute>
);

function App() {
  return (
    <div className="App">
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/capabilities" element={<Capabilities />} />
                  <Route path="/services" element={<Capabilities />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/portfolio" element={<Projects />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
                  <Route path="/order" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin" element={protectedPage("/admin", <AdminDashboard />)} />
                  <Route path="/admin/orders" element={protectedPage("/admin/orders", <AdminOrders />)} />
                  <Route path="/admin/catalog" element={protectedPage("/admin/catalog", <AdminCatalog />)} />
                  <Route path="/admin/catalog/:productId" element={protectedPage("/admin/catalog", <AdminProductEditor />)} />
                  <Route path="/admin/materials" element={protectedPage("/admin/materials", <AdminMaterials />)} />
                  <Route path="/admin/inventory" element={protectedPage("/admin/inventory", <AdminInventory />)} />
                  <Route path="/admin/stock-movements" element={protectedPage("/admin/stock-movements", <AdminStockMovements />)} />
                  <Route path="/admin/restock-alerts" element={protectedPage("/admin/restock-alerts", <AdminRestockAlerts />)} />
                  <Route path="/admin/portfolio" element={protectedPage("/admin/portfolio", <AdminPortfolio />)} />
                  <Route path="/admin/content" element={protectedPage("/admin/content", <AdminContent />)} />
                  <Route path="/admin/contacts" element={protectedPage("/admin/contacts", <AdminContacts />)} />
                  <Route path="/admin/inquiries" element={protectedPage("/admin/inquiries", <AdminInquiryList />)} />
                  <Route path="/admin/inquiries/:id" element={protectedPage("/admin/inquiries", <AdminInquiryDetail />)} />
                  <Route path="/admin/b2b/quotes" element={protectedPage("/admin/b2b/quotes", <AdminQuoteList />)} />
                  <Route path="/admin/b2b/quotes/:id" element={protectedPage("/admin/b2b/quotes", <AdminQuoteDetail />)} />
                  <Route path="/admin/b2b/quotes/:id/revision" element={protectedPage("/admin/b2b/quotes/revision", <AdminQuoteRevisionEditor />)} />
                  <Route path="/admin/b2b/projects" element={protectedPage("/admin/b2b/projects", <AdminProjectList />)} />
                  <Route path="/admin/b2b/projects/:id" element={protectedPage("/admin/b2b/projects", <AdminProjectDetail />)} />
                  <Route path="/admin/b2b/work-orders" element={protectedPage("/admin/b2b/work-orders", <AdminWorkOrderList />)} />
                  <Route path="/admin/b2b/work-orders/:id" element={protectedPage("/admin/b2b/work-orders", <AdminWorkOrderDetail />)} />
                  <Route path="/admin/retail-orders" element={protectedPage("/admin/retail-orders", <AdminRetailOrderList />)} />
                  <Route path="/admin/retail-orders/:id" element={protectedPage("/admin/retail-orders", <AdminRetailOrderDetail />)} />
                  <Route path="/admin/users" element={protectedPage("/admin/users", <AdminUsers />)} />
                  <Route path="/admin/notifications" element={protectedPage("/admin/notifications", <AdminNotificationFeed />)} />
                  <Route path="/admin/communication" element={protectedPage("/admin/communication", <AdminNotifications />)} />
                  <Route path="/admin/settings" element={protectedPage("/admin/settings", <AdminSettings />)} />
                  {brandLabEnabled && <><Route path="/__brand-lab/editorial" element={<EditorialHomepagePrototype />} /><Route path="/__brand-lab/experimental" element={<ExperimentalHomepagePrototype />} /></>}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AppErrorBoundary>
            <Toaster position="top-right" theme="light" richColors />
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </div>
  );
}

export default App;
