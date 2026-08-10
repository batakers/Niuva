(function (global) {
  "use strict";

  global.NIUVAVISUALFIXTURES = {
    home: { route: "/", label: "Home artifact lead", type: "public" },
    projects: { route: "/projects/pindad-ev-motor", label: "Project detail", type: "public" },
    "contact-empty": { route: "/contact", label: "Form kosong", type: "b2b" },
    "contact-invalid": {
      route: "/contact?state=invalid",
      label: "Validasi gagal",
      type: "b2b",
      seed: {
        form: {
          company: "Studio Arunika",
          pic: "Dina Pratama",
          email: "dina@",
          phone: "",
          need: "Prototipe visual",
          timeline: "Q4 2026",
          brief: "Kami perlu menguji bentuk awal sebelum keputusan produksi.",
          consent: false
        },
        errors: {
          email: "Gunakan alamat email yang valid.",
          phone: "Bagian ini wajib diisi.",
          consent: "Persetujuan diperlukan agar inquiry dapat ditinjau."
        }
      }
    },
    "contact-persistence-fail": { route: "/contact", label: "Penyimpanan gagal setelah submit", type: "b2b" },
    "contact-success": { route: "/contact", label: "Acknowledgement", type: "b2b" },
    "contact-unavailable": { route: "/contact", label: "Map unavailable · gunakan form", type: "b2b" },
    "contact-whatsapp": { route: "/contact", label: "WhatsApp handoff · Inquiry belum tercatat", type: "b2b" }
  };
}(window));
