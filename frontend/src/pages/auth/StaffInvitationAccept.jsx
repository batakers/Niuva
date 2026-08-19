import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import {
  fetchPasswordPolicy,
  passwordSatisfiesPolicy,
} from "@/lib/passwordPolicy";

const SAFE_DEPENDENCY_CODES = new Set([
  "password_policy_unavailable",
  "password_writes_disabled",
  "transaction_unavailable",
]);

function readApiCode(requestError) {
  const body = requestError?.response?.data;
  const candidates = [
    body?.error?.code,
    body?.detail?.code,
    body?.code,
  ];
  return candidates.find((candidate) => typeof candidate === "string") || "";
}

function passwordPolicyHint(policy, t) {
  if (!policy) return t("auth.staffInvitation.loadingPolicy");
  return `${policy.min_code_points}–${policy.max_code_points} ${t("auth.staffInvitation.policyCharacters")}; `
    + `${t("auth.staffInvitation.policyByteLimit")} ${policy.max_utf8_bytes} ${t("auth.staffInvitation.policyBytes")}; `
    + t("auth.staffInvitation.policyCommonRejected");
}

function invitationErrorMessage(requestError, t) {
  const code = readApiCode(requestError);
  const status = requestError?.response?.status;

  if (code === "invitation_expired") return t("auth.staffInvitation.invitationExpired");
  if (code === "invitation_unavailable") return t("auth.staffInvitation.invitationUnavailable");
  if (code === "email_in_use") return t("auth.staffInvitation.invitationUnavailable");
  if (code.startsWith("password_")) return t("auth.staffInvitation.passwordPolicyRejected");
  if (code === "request_validation_failed" || status === 422) {
    return t("auth.staffInvitation.invalidRequest");
  }
  if (SAFE_DEPENDENCY_CODES.has(code) || status === 503) {
    return t("auth.staffInvitation.dependencyUnavailable");
  }
  return t("auth.staffInvitation.genericError");
}

function isKnownPreMutationDependencyFailure(requestError) {
  return (
    requestError?.response?.status === 503
    && SAFE_DEPENDENCY_CODES.has(readApiCode(requestError))
  );
}

function isUncertainAcceptance(requestError) {
  if (requestError?.invitationOutcomeUncertain) return true;
  if (!requestError?.response) return true;

  const status = requestError.response.status;
  return status >= 500 && !isKnownPreMutationDependencyFailure(requestError);
}

export default function StaffInvitationAccept() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState(null);
  const [policyError, setPolicyError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [retryAvailable, setRetryAvailable] = useState(false);
  const [retryExhausted, setRetryExhausted] = useState(false);
  const retryUsedRef = useRef(false);
  const formRef = useRef(null);

  const loadPasswordPolicy = useCallback(async () => {
    setPasswordPolicy(null);
    setPolicyError("");
    try {
      setPasswordPolicy(await fetchPasswordPolicy(api));
    } catch {
      setPolicyError(t("auth.staffInvitation.policyUnavailable"));
    }
  }, [t]);

  useEffect(() => {
    loadPasswordPolicy();
  }, [loadPasswordPolicy]);

  const submit = async (event) => {
    event.preventDefault();
    if (!token) {
      setError(t("auth.staffInvitation.missingToken"));
      return;
    }
    if (password !== confirmation) {
      setError(t("auth.staffInvitation.passwordMismatch"));
      return;
    }
    if (!passwordSatisfiesPolicy(password, passwordPolicy)) {
      setError(t("auth.staffInvitation.passwordInvalid"));
      return;
    }
    setBusy(true);
    setError("");
    setUncertain(false);
    try {
      const response = await api.post("/auth/staff-invitations/accept", { token, password });
      if (response?.status !== 201) {
        const outcomeError = new Error("invitation_accept_outcome_unknown");
        outcomeError.response = response;
        outcomeError.invitationOutcomeUncertain = true;
        throw outcomeError;
      }
      navigate("/admin/login", {
        replace: true,
        state: { invitationAccepted: true },
      });
    } catch (requestError) {
      if (isUncertainAcceptance(requestError)) {
        setUncertain(true);
        setError("");
      } else if (isKnownPreMutationDependencyFailure(requestError) && !retryUsedRef.current) {
        setRetryAvailable(true);
        setError(invitationErrorMessage(requestError, t));
      } else if (isKnownPreMutationDependencyFailure(requestError)) {
        setRetryExhausted(true);
        setError(invitationErrorMessage(requestError, t));
      } else {
        setError(invitationErrorMessage(requestError, t));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell audience="staff">
      <AuthCard
        eyebrow={t("auth.staffInvitation.eyebrow")}
        title={t("auth.staffInvitation.title")}
        description={t("auth.staffInvitation.description")}
      >
      <form
        ref={formRef}
        onSubmit={submit}
        className="space-y-5"
        data-testid="staff-invitation-form"
      >
        {!token && (
          <Alert data-testid="staff-invitation-missing-token">
            {t("auth.staffInvitation.missingToken")}
          </Alert>
        )}
        {policyError && (
          <div className="space-y-3">
            <Alert>{policyError}</Alert>
            <Button type="button" variant="outline" onClick={loadPasswordPolicy}>
              {t("auth.staffInvitation.retryPolicy")}
            </Button>
          </div>
        )}
        {retryAvailable && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              retryUsedRef.current = true;
              setRetryAvailable(false);
              formRef.current?.requestSubmit();
            }}
          >
            {t("auth.staffInvitation.retryAcceptance")}
          </Button>
        )}
        {uncertain && (
          <Alert tone="warning" data-testid="staff-invitation-uncertain">
            <p>{t("auth.staffInvitation.uncertain")}</p>
            <p className="mt-2">{t("auth.staffInvitation.uncertainDescription")}</p>
            <Button asChild variant="outline" className="mt-3">
              <Link to="/admin/login">{t("auth.staffInvitation.goToAdminLogin")}</Link>
            </Button>
          </Alert>
        )}
        {error && <Alert data-testid="staff-invitation-error">{error}</Alert>}
        <FormField
          label={t("common.password")}
          required
          hint={passwordPolicyHint(passwordPolicy, t)}
        >
          <Input
            type="password"
            data-testid="staff-invitation-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label={t("auth.staffInvitation.confirmPassword")} required>
          <Input
            type="password"
            data-testid="staff-invitation-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <Button
          type="submit"
          data-testid="staff-invitation-submit"
          className="w-full"
          loading={busy}
          disabled={
            !token
            || !passwordSatisfiesPolicy(password, passwordPolicy)
            || password !== confirmation
            || uncertain
            || retryAvailable
            || retryExhausted
          }
        >
          {t("auth.staffInvitation.activate")}
        </Button>
        <Button asChild variant="link" className="w-full">
          <Link to="/admin/login">{t("auth.staffInvitation.backToAdminLogin")}</Link>
        </Button>
      </form>
      </AuthCard>
    </AuthShell>
  );
}
