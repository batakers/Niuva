import { profileContent } from "@/components/brand/CompanyProfileBlocks";

export const prototypeContent = {
  companyName: "PT Niuva Inovasi Utama",
  headline: "Mitra R&D untuk produk inovatif dan prototyping.",
  introduction:
    "Niuva membantu perusahaan, institusi, dan tim industri mengubah ide menjadi produk tervalidasi melalui riset, desain, engineering, prototyping, testing, dan implementasi.",
  primaryCta: {
    label: "Diskusikan Project",
    to: "/contact",
  },
  secondaryCta: {
    label: "Lihat Projects",
    to: "/projects",
  },
  primaryCapabilities: profileContent.services.filter((service) => service.priority === "primary"),
  supportingCapabilities: profileContent.services.filter((service) => service.priority !== "primary"),
  flagshipProject: profileContent.projects.find((project) => project.title === "Pengembangan Motor EV PT Pindad"),
  selectedProjects: [
    profileContent.projects.find((project) => project.title === "Redesain Motor Xeon"),
    profileContent.projects.find((project) => project.title === "Bicycle Arcade Agate"),
  ],
  projectNames: profileContent.projects.map((project) => project.title),
  contact: profileContent.contact,
};

export const transformationStages = [
  {
    name: "Need",
    title: "Kebutuhan",
    body: "Memahami konteks, target pengguna, peluang, dan batasan yang perlu dijawab.",
  },
  {
    name: "Research",
    title: "Riset",
    body: "Mengumpulkan bukti untuk memperjelas masalah dan arah pengembangan.",
  },
  {
    name: "Experiment",
    title: "Eksperimen",
    body: "Menguji alternatif bentuk, fungsi, material, dan pendekatan teknis.",
  },
  {
    name: "Prototype",
    title: "Prototipe",
    body: "Membawa konsep ke bentuk yang dapat dilihat, digunakan, dan dievaluasi.",
  },
  {
    name: "Output",
    title: "Output",
    body: "Menyiapkan hasil dan keputusan berikutnya sesuai ruang lingkup kolaborasi.",
  },
];

export const whyNiuvaItems = [
  {
    title: "Riset sebagai dasar keputusan",
    body: "Pengembangan dimulai dari kebutuhan, konteks, peluang, dan batasan yang dipahami sejak awal.",
  },
  {
    title: "Cara pikir engineering",
    body: "Rancangan dinilai dari kemungkinan implementasi, integrasi komponen, fungsi, dan kesiapan untuk diuji.",
  },
  {
    title: "Prototyping untuk validasi",
    body: "Ide dibawa ke bentuk yang dapat dievaluasi agar keputusan tidak berhenti di presentasi konsep.",
  },
  {
    title: "Eksekusi produk custom",
    body: "Niuva mendukung mobilitas, simulator, perangkat interaktif, apparel, dan merchandise sesuai konteks proyek.",
  },
];

