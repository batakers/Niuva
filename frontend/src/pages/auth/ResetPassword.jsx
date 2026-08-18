import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard, AuthShell, getAuthCopy } from "@/components/auth/AuthShell";
import { api } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";

function captureToken() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token") || "";
  url.searchParams.delete("token");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return token;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const copy = getAuthCopy(lang).reset;
  const capturedToken = useRef(null);
  const [token, setToken] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [validating, setValidating] = useState(true);
  const [preparationError, setPreparationError] = useState(false);
  const [preparationAttempt, setPreparationAttempt] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef(null);

  useEffect(() => {
    document.title = `${copy.title} - Niuva`;
  }, [copy.title]);

  useLayoutEffect(() => {
    if (capturedToken.current === null) capturedToken.current = captureToken();
    setToken(capturedToken.current);
  }, []);

  useEffect(() => {
    let active = true;
    async function prepare() {
      if (token === null) return;
      setValidating(true);
      setPreparationError(false);
      if (!token) {
        navigate("/reset-password/error", { replace: true });
        return;
      }
      try {
        const validation = await api.post("/auth/reset-password/validate", { token });
        if (!active) return;
        if (!validation.data?.valid) {
          navigate("/reset-password/error", { replace: true });
          return;
        }
        const policyResponse = await api.get("/auth/password-policy");
        if (!active) return;
        setPolicy(policyResponse.data);
        setValidating(false);
      } catch {
        if (!active) return;
        setPreparationError(true);
        setValidating(false);
      }
    }
    prepare();
    return () => { active = false; };
  }, [navigate, preparationAttempt, token]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const codePoints = Array.from(newPassword).length;
  const utf8Bytes = new TextEncoder().encode(newPassword).length;
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const lengthValid = policy
    && codePoints >= policy.min_code_points
    && codePoints <= policy.max_code_points
    && utf8Bytes <= policy.max_utf8_bytes;
  const canSubmit = lengthValid && newPassword === confirmPassword;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: newPassword });
      navigate("/reset-password/success", { replace: true });
    } catch {
      setError(copy.errors.unavailable);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell audience="recovery">
      <AuthCard
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      >
        {preparationError ? (
          <div className="space-y-5">
            <Alert>{copy.unavailable}</Alert>
            <Button
              type="button"
              onClick={() => setPreparationAttempt((attempt) => attempt + 1)}
              className="w-full"
              size="lg"
            >
              {copy.retry}
            </Button>
          </div>
        ) : validating ? (
          <p className="text-sm text-text-secondary" role="status" aria-live="polite">
            {copy.checking}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-5" data-testid="reset-password-form">
            <FormField
              label={copy.newPassword}
              required
              hint={copy.passwordHint(
                policy.min_code_points,
                policy.max_code_points,
                policy.max_utf8_bytes,
              )}
              error={
                newPassword.length > 0 && !lengthValid
                  ? copy.passwordInvalid
                  : undefined
              }
            >
              <Input
                data-testid="reset-password-new"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={policy.min_code_points}
                autoComplete="new-password"
              />
            </FormField>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? copy.hidePassword : copy.showPassword}
            >
              {showPassword ? copy.hidePassword : copy.showPassword}
            </Button>

            <FormField
              label={copy.confirmPassword}
              required
              error={mismatch ? copy.passwordMismatch : undefined}
            >
              <Input
                data-testid="reset-password-confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
              />
            </FormField>

            {error && (
              <Alert ref={errorRef} tabIndex={-1} data-testid="reset-password-error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              disabled={submitting || !canSubmit}
              data-testid="reset-password-submit"
              className="w-full"
              size="lg"
            >
              {submitting ? copy.processing : copy.submit}
            </Button>
            <Button asChild variant="link" className="w-full">
              <Link to="/forgot-password">{copy.requestNew}</Link>
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
