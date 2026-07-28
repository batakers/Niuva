import React, { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/i18n";
import { api, formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function DevelopmentMediaUpload({ disabled = false, onUploaded }) {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/admin/media/capabilities")
      .then(({ data }) => {
        if (active) {
          setStatus(data.local_upload === "active" ? "active" : "inactive");
        }
      })
      .catch(() => {
        if (active) setStatus("inactive");
      });
    return () => {
      active = false;
    };
  }, []);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const { data } = await api.post("/admin/media", form);
      onUploaded(data);
      toast.success(t("media.localUploadSuccess"));
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <span className="text-xs text-text-secondary" role="status">
        {t("media.checkingCapability")}
      </span>
    );
  }
  if (status !== "active") {
    return (
      <span className="text-xs text-text-secondary">
        {t("media.productionInactive")}
      </span>
    );
  }
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={upload}
        aria-label={t("media.localUpload")}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? t("media.uploading") : t("media.localUpload")}
      </Button>
    </>
  );
}
