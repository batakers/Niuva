import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/marketing/HomePage";
import About from "@/pages/marketing/AboutPage";
import Services from "@/pages/marketing/ServicesPage";
import Portfolio from "@/pages/marketing/ProjectsPage";
import Ecosystem from "@/pages/Ecosystem";
import Internship from "@/pages/Internship";
import Contact from "@/pages/marketing/ContactPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ClientDashboard from "@/pages/dashboard/ClientDashboard";
import NewOrder from "@/pages/dashboard/NewOrder";
import OrderDetail from "@/pages/dashboard/OrderDetail";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/Orders";
import AdminMaterials from "@/pages/admin/Materials";
import AdminPortfolio from "@/pages/admin/PortfolioAdmin";
import AdminSettings from "@/pages/admin/Settings";
import AdminInternships from "@/pages/admin/Internships";
import AdminContacts from "@/pages/admin/Contacts";
import AdminUsers from "@/pages/admin/Users";

function App() {
  return (
    <div className="App">
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/capabilities" element={<Services />} />
              <Route path="/services" element={<Services />} />
              <Route path="/projects" element={<Portfolio />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/internship" element={<Internship />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
              <Route path="/order" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/materials" element={<ProtectedRoute adminOnly><AdminMaterials /></ProtectedRoute>} />
              <Route path="/admin/portfolio" element={<ProtectedRoute adminOnly><AdminPortfolio /></ProtectedRoute>} />
              <Route path="/admin/internships" element={<ProtectedRoute adminOnly><AdminInternships /></ProtectedRoute>} />
              <Route path="/admin/contacts" element={<ProtectedRoute adminOnly><AdminContacts /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
            </Routes>
            <Toaster position="top-right" theme="light" richColors />
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </div>
  );
}

export default App;


