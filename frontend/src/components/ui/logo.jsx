import React from "react";
import logo from "../../assets/output.svg";

export function Logo({ className = "h-5 w-auto", ...props }) {
  return (
    <img
      src={logo}
      alt="Niuva"
      className={className}
      {...props}
    />
  );
}

export function LogoWordmark({
  className = "",
  ...props
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo className="h-7 w-auto" {...props} />

      <span className="font-heading font-bold text-xl text-foreground">
        Niuva
      </span>
    </div>
  );
}