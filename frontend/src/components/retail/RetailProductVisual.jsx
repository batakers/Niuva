import React from "react";
import { PackageOpen } from "lucide-react";

import { resolveMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

export function RetailProductVisual({
  product,
  eager = false,
  className,
}) {
  const media = product?.media?.[0];
  const image = resolveMediaUrl(media?.storage_path);
  const productName = product?.name || "Produk Niuva";
  const alt = media?.alt || `Visual ${productName}`;

  return (
    <div
      className={cn(
        "grid aspect-[4/3] overflow-hidden rounded-panel bg-decoration-brand-soft ring-1 ring-border-default",
        className,
      )}
      role={image ? undefined : "img"}
      aria-label={image ? undefined : alt}
    >
      {image ? (
        <img
          src={image}
          alt={alt}
          className="h-full w-full object-cover"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <PackageOpen
            className="h-9 w-9 text-action-primary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-semibold text-text-primary">
            {productName}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Visual produk belum tersedia
          </p>
        </div>
      )}
    </div>
  );
}
