import React from 'react';

export function Logo({ className = "h-6 w-auto text-foreground", ...props }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M25 80V20H40L60 55V20H75V80H60L40 45V80H25Z" fill="currentColor" />
      <rect x="60" y="55" width="15" height="25" fill="hsl(var(--primary))" />
      <path d="M15 20H10 M15 80H10 M12.5 20V80" stroke="currentColor" strokeWidth="1.5" opacity="0.28" strokeDasharray="2 2" />
      <path d="M25 90V95 M75 90V95 M25 92.5H75" stroke="currentColor" strokeWidth="1.5" opacity="0.28" strokeDasharray="2 2" />
      <circle cx="12.5" cy="50" r="1.5" fill="currentColor" opacity="0.28" />
      <circle cx="50" cy="92.5" r="1.5" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

export function LogoWordmark({ className = "h-6 w-auto text-foreground" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo className="h-full w-auto" />
      <span className="font-heading font-extrabold tracking-tight text-[1.35rem] leading-none mt-0.5">Niuva</span>
    </div>
  );
}
