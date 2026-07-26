import React from "react";
import { AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * ConfirmSendDialog - Confirmation dialog before sending notifications
 * Shows summary of recipients and message before final send
 */
export function ConfirmSendDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  target,
  targetLabel,
  recipientCount,
  recipientName,
  subject,
  message,
}) {
  const isBroadcast = target === "broadcast";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBroadcast && (
              <AlertTriangle className="h-5 w-5 text-status-warning" />
            )}
            Konfirmasi Pengiriman
          </DialogTitle>
          <DialogDescription>
            Notifikasi akan langsung dikirim dan tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target summary */}
          <div className="rounded-card border border-border-default bg-surface-page p-4 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <span className="type-label text-text-secondary">Target</span>
              <span className="type-body-small text-text-primary text-right">
                {targetLabel}
              </span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <span className="type-label text-text-secondary">Penerima</span>
              <span className="type-body-small text-text-primary text-right">
                {recipientName || `${recipientCount || "?"} pengguna`}
              </span>
            </div>

            <div className="border-t border-border-default pt-3">
              <p className="type-label text-text-secondary mb-1">Subjek</p>
              <p className="type-body-small text-text-primary font-medium">
                {subject}
              </p>
            </div>

            <div>
              <p className="type-label text-text-secondary mb-1">Pesan</p>
              <p className="type-body-small text-text-primary line-clamp-3">
                {message}
              </p>
            </div>
          </div>

          {/* Broadcast warning */}
          {isBroadcast && (
            <div className="rounded-control border border-status-warning/40 bg-status-warning/10 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning shrink-0 mt-0.5" />
              <p className="type-body-small text-status-warning">
                Broadcast akan mengirim notifikasi ke <strong>semua pengguna</strong> yang terdaftar.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={isBroadcast ? "bg-status-warning hover:bg-status-warning/90" : ""}
          >
            {loading ? (
              "Mengirim..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Kirim Sekarang
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmSendDialog;
