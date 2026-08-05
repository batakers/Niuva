import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { OperationalLayout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { useI18n } from "@/i18n";

/**
 * Compatibility destination for old bookmarks.
 *
 * The former form wrote to the quarantined legacy aggregate and implied an
 * upload/checkout flow that is not approved. Historical orders remain
 * readable; current Retail work starts from the approved catalog surface.
 */
export default function NewOrder() {
  const { t } = useI18n();

  return (
    <OperationalLayout>
      <SurfacePanel className="mx-auto w-full max-w-2xl overflow-hidden">
        <div className="p-6 sm:p-10">
          <ShoppingBag
            className="h-9 w-9 text-action-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="mt-6 type-label text-action-primary">
            {t("order.compatibilityLabel")}
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            {t("order.inactiveTitle")}
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-text-secondary">
            {t("order.inactiveDescription")}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/retail">
                {t("dash.openRetail")}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard">{t("detail.backToOrders")}</Link>
            </Button>
          </div>
        </div>
      </SurfacePanel>
    </OperationalLayout>
  );
}
