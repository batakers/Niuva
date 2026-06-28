import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B10]">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({ tag, title, subtitle }) {
  return (
    <section className="relative border-b border-slate-800 grid-bg">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        {tag && <p className="font-mono-tech text-xs uppercase tracking-widest text-blue-400 mb-3">{tag}</p>}
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white max-w-3xl">{title}</h1>
        {subtitle && <p className="mt-4 text-slate-400 text-lg max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
