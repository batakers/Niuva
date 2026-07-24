import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LogoWordmark } from "@/components/brand/Logo";

export function AuthShell({ children, heading = "Internal\nAdministration\nSystem", tagline = "Restricted operational access for authorized Niuva administrators." }) {
  return (
    <div className="grid min-h-screen bg-background selection:bg-primary/20 selection:text-foreground lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface-1 lg:flex">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
        <div className="absolute left-0 top-1/4 h-px w-full border-dashed bg-border" />
        <div className="absolute left-0 top-3/4 h-px w-full border-dashed bg-border" />
        <div className="absolute bottom-0 left-1/4 top-0 w-px border-dashed bg-border" />

        <div className="relative z-10 flex h-full flex-col p-12">
          <div>
            <Link
              to="/"
              className="-ml-3 mb-12 inline-flex items-center gap-2 border border-transparent bg-surface-2/0 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-border hover:bg-surface-2 hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> RETURN_TO_SITE
            </Link>
            <LogoWordmark className="mb-16 h-8 text-foreground" />

            <div className="border-l-2 border-primary pl-6">
              <h2 className="max-w-md font-heading text-4xl font-extrabold uppercase leading-tight tracking-tight text-foreground">
                {heading.split("\n").map((line, index) => (
                  <React.Fragment key={line}>
                    {index > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h2>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">{tagline}</p>
            </div>
          </div>

          <div className="mt-auto border-t border-border/50 pt-8">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              ACCESS_SCOPE
            </span>
            <span className="block font-mono text-sm text-primary">AUTHORIZED_PERSONNEL_ONLY</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-4 sm:p-12">
        <div className="absolute left-6 top-6 lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> SITE
          </Link>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
