import { ArrowLeft, ShieldX } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export default function ForbiddenPage() {
  const { t } = useI18n();
  const location = useLocation();

  return (
    <main
      id="main-content"
      className="grid min-h-screen place-items-center bg-surface-page px-5 py-12"
    >
      <section className="w-full max-w-xl border border-border-default bg-surface-default p-7 sm:p-10">
        <div className="flex h-11 w-11 items-center justify-center border border-status-warning/40 bg-status-warning/10 text-status-warning">
          <ShieldX className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-widest text-status-warning">
          403 · {t("forbidden.code")}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-text-primary">
          {t("forbidden.title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {t("forbidden.description")}
        </p>
        <p className="mt-5 border-l-2 border-border-strong pl-3 font-mono text-xs text-text-secondary">
          {location.pathname}
        </p>
        <Button asChild className="mt-7 min-h-11">
          <Link to="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("forbidden.back")}
          </Link>
        </Button>
      </section>
    </main>
  );
}
