import { useEffect, useMemo, useState } from "react";

import { profileContent } from "@/components/brand/CompanyProfileBlocks";
import { HAS_CONFIGURED_BACKEND, api, safeExternalUrl } from "@/lib/api";

function safeEmail(value) {
  const candidate = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : "";
}

export function projectPublicContact(settings = {}) {
  const whatsapp = String(settings.whatsapp || "").trim();
  const whatsappDigits = whatsapp.replace(/\D/g, "");
  return {
    location: String(settings.address || "").trim(),
    email: safeEmail(settings.email),
    phone: String(settings.phone || "").trim(),
    whatsapp,
    whatsappHref: whatsappDigits ? `https://wa.me/${whatsappDigits}` : "",
    mapsHref: safeExternalUrl(settings.maps_url),
  };
}

export function sanitizePublicContact(contact = {}) {
  return {
    location: String(contact.location || "").trim(),
    email: safeEmail(contact.email),
    phone: String(contact.phone || "").trim(),
    whatsapp: String(contact.whatsapp || "").trim(),
    whatsappHref: safeExternalUrl(contact.whatsappHref),
    mapsHref: safeExternalUrl(contact.mapsHref),
  };
}

export function usePublicSettings() {
  const [state, setState] = useState(() => ({
    status: HAS_CONFIGURED_BACKEND ? "loading" : "disabled",
    settings: null,
  }));

  useEffect(() => {
    if (!HAS_CONFIGURED_BACKEND) {
      setState({ status: "disabled", settings: null });
      return undefined;
    }

    let active = true;
    setState({ status: "loading", settings: null });
    api.get("/settings")
      .then(({ data }) => {
        if (active) setState({ status: "ready", settings: data });
      })
      .catch(() => {
        if (active) setState({ status: "error", settings: null });
      });
    return () => {
      active = false;
    };
  }, []);

  const contact = useMemo(() => {
    if (state.status === "ready") {
      return projectPublicContact(state.settings);
    }
    return profileContent.contact;
  }, [state.settings, state.status]);

  return { ...state, contact };
}
