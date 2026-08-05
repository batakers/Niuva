import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { api, formatApiError } from "@/lib/api";
import {
  fetchPasswordPolicy,
  passwordPolicySummary,
  passwordSatisfiesPolicy,
} from "@/lib/passwordPolicy";

export default function StaffInvitationAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState(null);
  const [policyError, setPolicyError] = useState("");

  const loadPasswordPolicy = useCallback(async () => {
    setPasswordPolicy(null);
    setPolicyError("");
    try {
      setPasswordPolicy(await fetchPasswordPolicy(api));
    } catch {
      setPolicyError("Aturan password belum dapat dimuat.");
    }
  }, []);

  useEffect(() => {
    loadPasswordPolicy();
  }, [loadPasswordPolicy]);

  const submit = async (event) => {
    event.preventDefault();
    if (!token) {
      setError("Token undangan tidak tersedia.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    if (!passwordSatisfiesPolicy(password, passwordPolicy)) {
      setError("Password belum memenuhi aturan yang berlaku.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/staff-invitations/accept", { token, password });
      navigate("/admin/login", {
        replace: true,
        state: { invitationAccepted: true },
      });
    } catch (requestError) {
      setError(formatApiError(requestError.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell audience="staff">
      <AuthCard
        eyebrow="Admin Studio"
        title="Selesaikan undangan staf"
        description="Buat password sesuai kebijakan yang berlaku, lalu masuk melalui halaman admin."
      >
      <form
        onSubmit={submit}
        className="space-y-5"
        data-testid="staff-invitation-form"
      >
        {!token && (
          <Alert>Token undangan tidak tersedia.</Alert>
        )}
        {policyError && (
          <div className="space-y-3">
            <Alert>{policyError}</Alert>
            <Button type="button" variant="outline" onClick={loadPasswordPolicy}>
              Coba Lagi
            </Button>
          </div>
        )}
        {error && <Alert>{error}</Alert>}
        <FormField
          label="Password"
          required
          hint={
            passwordPolicy
              ? passwordPolicySummary(passwordPolicy)
              : "Memuat aturan password…"
          }
        >
          <Input
            type="password"
            data-testid="staff-invitation-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Konfirmasi password" required>
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
          }
        >
          Aktifkan akun staf
        </Button>
        <Button asChild variant="link" className="w-full">
          <Link to="/admin/login">Kembali ke login admin</Link>
        </Button>
      </form>
      </AuthCard>
    </AuthShell>
  );
}
