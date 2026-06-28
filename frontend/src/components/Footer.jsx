import React from "react";
import { Link } from "react-router-dom";
import { Cuboid, MapPin, Mail } from "lucide-react";
import { useI18n } from "../i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-slate-800 bg-[#0A0B10] mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-8 w-8 rounded-md bg-blue-600 grid place-items-center">
              <Cuboid className="h-5 w-5 text-white" strokeWidth={1.5} />
            </span>
            <span className="font-heading font-extrabold text-xl text-white">NIUVA</span>
          </div>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            PT Niuva Inovasi Utama — indie R&D studio for product design, EV engineering, prototyping & precision 3D printing.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Navigasi</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/about" className="hover:text-blue-400">{t("nav.about")}</Link></li>
            <li><Link to="/services" className="hover:text-blue-400">{t("nav.services")}</Link></li>
            <li><Link to="/portfolio" className="hover:text-blue-400">{t("nav.portfolio")}</Link></li>
            <li><Link to="/internship" className="hover:text-blue-400">{t("nav.internship")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">{t("nav.contact")}</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" strokeWidth={1.5} /> Bandung, Indonesia</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-400" strokeWidth={1.5} /> hello@niuva.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500 font-mono-tech">
        © {new Date().getFullYear()} PT NIUVA INOVASI UTAMA · BANDUNG
      </div>
    </footer>
  );
}
