import React from "react";
import { Link } from "react-router-dom";

import { AuthCard, AuthShell, getAuthCopy } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export default function ResetPasswordState({ success = false }) {
  const { lang } = useI18n();
  const authCopy = getAuthCopy(lang);
  const copy = authCopy.resetState;

  return (
    <AuthShell audience="recovery">
      <AuthCard
        eyebrow={authCopy.recovery.eyebrow}
        title={success ? copy.successTitle : copy.errorTitle}
        description={
          success
            ? copy.successDescription
            : copy.errorDescription
        }
      >
        {success ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link to="/login">{copy.customerLogin}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/login">{copy.staffLogin}</Link>
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full" size="lg">
            <Link to="/forgot-password">{copy.requestNew}</Link>
          </Button>
        )}
      </AuthCard>
    </AuthShell>
  );
}
