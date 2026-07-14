import React from "react";
import niuvaMark from "../../assets/brand/niuva-mark.svg";
import { cn } from "@/lib/utils";

export function BrandIdentity({ variant = "nav", className }) {
  const isFooter = variant === "footer";

  return (
    <span
      className={cn(
        isFooter
          ? "inline-flex items-start gap-4"
          : "inline-flex items-center gap-2.5",
        className
      )}
    >
      <img
        src={niuvaMark}
        alt=""
        width={isFooter ? 48 : 32}
        height={isFooter ? 48 : 32}
        loading={isFooter ? "lazy" : "eager"}
        className={cn(
          "shrink-0 object-contain",
          isFooter ? "h-12 w-12" : "h-7 w-7 sm:h-8 sm:w-8"
        )}
      />
      {isFooter ? (
        <span className="min-w-0 pt-0.5">
          <span className="block font-heading text-lg font-extrabold leading-tight tracking-tight text-text-primary">
            Niuva Inovasi Utama
          </span>
          <span className="mt-1 block text-sm leading-6 text-text-secondary">
            R&amp;D, Design Engineering, dan Prototyping
          </span>
        </span>
      ) : (
        <span className="font-heading text-[1.35rem] font-extrabold leading-none tracking-tight text-text-primary">
          Niuva
        </span>
      )}
    </span>
  );
}
