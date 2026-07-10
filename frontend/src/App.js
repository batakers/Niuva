import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n";

import Home from "@/pages/marketing/HomePage";
import About from "@/pages/marketing/AboutPage";
import Services from "@/pages/marketing/ServicesPage";
import Portfolio from "@/pages/marketing/ProjectsPage";
import Contact from "@/pages/marketing/ContactPage";

function App() {
  return (
    <div className="App">
      <I18nProvider>
        <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/capabilities" element={<Services />} />
              <Route path="/projects" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Home />} />
            </Routes>
            <Toaster position="top-right" theme="light" richColors />
        </BrowserRouter>
      </I18nProvider>
    </div>
  );
}

export default App;


