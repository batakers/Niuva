import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { api } from "../../lib/api";
import { AdminLayout } from "./AdminLayout";
import { fmtDay } from "../../lib/format";
import { EmptyState } from "../../components/ui/empty-state";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";

export default function AdminUsers() {
  const { t } = useI18n();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/users").then((r) => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title={t("admin.users")} subtitle="Client Identity Matrix">
      <SurfacePanel>
        <SurfacePanelHeader>
          <TechnicalLabel>REGISTERED_ENTITIES // TOTAL: {items.length}</TechnicalLabel>
        </SurfacePanelHeader>

        {loading ? (
          <EmptyState>[ FETCHING_DATA... ]</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="admin-users-table">
              <thead>
                <tr className="border-b border-border/50 bg-background/50 text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
                  <th className="font-normal px-6 py-4">Entity_Name</th>
                  <th className="font-normal px-6 py-4">Credential_ID</th>
                  <th className="font-normal px-6 py-4">Comms_Link</th>
                  <th className="font-normal px-6 py-4">Organization</th>
                  <th className="font-normal px-6 py-4 text-right">Init_Date</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs text-foreground divide-y divide-border/50">
                {items.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground uppercase">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-primary">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{u.phone || "UNSPECIFIED"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{u.company || "UNSPECIFIED"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-muted-foreground">{fmtDay(u.created_at)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5}><EmptyState className="py-12">NO_CLIENTS_FOUND</EmptyState></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SurfacePanel>
    </AdminLayout>
  );
}
