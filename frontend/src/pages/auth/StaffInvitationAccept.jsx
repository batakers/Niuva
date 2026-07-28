import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { api, formatApiError } from "@/lib/api";

export default function StaffInvitationAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    <main className="grid min-h-screen place-items-center bg-surface-page px-4 py-10">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-5 rounded-card border border-border-default bg-surface-default p-6"
      >
        <div>
          <p className="type-label text-action-primary">NIUVA STAFF</p>
          <h1 className="mt-2 font-heading text-2xl font-bold text-text-primary">
            Selesaikan undangan staf
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Siapkan password, lalu masuk melalui halaman admin.
          </p>
        </div>
        {!token && (
          <p className="text-sm text-status-error">Token undangan tidak tersedia.</p>
        )}
        {error && <p className="text-sm text-status-error">{error}</p>}
        <FormField label="Password">
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Konfirmasi password">
          <Input
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
          />
        </FormField>
        <Button
          type="submit"
          className="w-full"
          loading={busy}
          disabled={!token || password.length < 12 || password !== confirmation}
        >
          Aktifkan akun staf
        </Button>
        <Link className="block text-center text-sm text-action-primary" to="/admin/login">
          Kembali ke login admin
        </Link>
      </form>
    </main>
  );
}
