(function () {
  "use strict";

  var root = document.documentElement;
  var language = root.dataset.language === "en" ? "en" : "id";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  var copy = {
    id: {
      title: "Niuva — Dari ide menuju produk yang dapat diuji",
      description: "Prototype Homepage Niuva R4: mitra inovasi dan pengembangan produk dengan empat layanan utama dan jalur Retail yang terpisah.",
      boundary: "Prototype visual R4 · bukan website production",
      brandLink: "Niuva, kembali ke awal",
      mainNav: "Navigasi utama",
      mobileNav: "Navigasi mobile",
      languageToggle: "Pilih bahasa. Bahasa aktif Indonesia",
      languageChoice: "Pilihan bahasa",
      footerNav: "Navigasi footer",
      initialChoices: "Pilihan awal",
      processAria: "Tahap kerja Niuva",
      dismissNotice: "Tutup pemberitahuan",
      understandVisualTitle: "Dari banyak batas menuju satu pertanyaan yang dapat diuji",
      understandVisualDesc: "Empat jalur kebutuhan dan batas keputusan berkumpul menjadi satu fokus pengujian.",
      understandIllustrationCaption: "Ilustrasi konseptual · kebutuhan dan batas keputusan dipusatkan menjadi satu pertanyaan uji.",
      shapeVisualTitle: "Lapisan keputusan membentuk objek yang dapat diuji",
      shapeVisualDesc: "Serangkaian lapisan FDM bergerak dari garis datar menuju bentuk fisik dengan titik sambungan.",
      shapeIllustrationCaption: "Ilustrasi konseptual · lapisan, bentuk, material, dan sambungan mulai menjadi keputusan fisik.",
      proveVisualTitle: "Objek melewati pengujian dan kembali membawa bukti",
      proveVisualDesc: "Sebuah objek uji bergerak melalui tiga checkpoint, lalu hasilnya membentuk jalur umpan balik.",
      proveIllustrationCaption: "Ilustrasi konseptual · prototype diuji, dibaca, lalu mengembalikan bukti untuk keputusan berikutnya.",
      apparelNote: "Layanan utama untuk kebutuhan apparel, merchandise, branding, dan produk siap pesan.",
      viewService: "Lihat layanan",
      serviceApparel: "Mengembangkan apparel dan merchandise untuk kebutuhan custom, branding, partnership, maupun kategori Ready Products.",
      openContact: "Buka halaman Kontak",
      contactDetailsTitle: "Saat Anda membuka halaman Kontak",
      contactOwnerLabel: "Ditinjau oleh",
      contactResponseLabel: "Waktu respons",
      contactFlowLabel: "Alur lanjutan",
      contactFlowValue: "Inquiry dicatat lebih dahulu. WhatsApp tersedia sebagai pilihan setelah form dikirim.",
      privacy: "Privasi",
      toastInquiry: "Form lengkap berada di halaman Kontak dan di luar prototype Homepage R4 ini. Tidak ada data yang dikirim atau disimpan.",
      toastService: "Halaman detail {service} sudah menjadi arah yang disetujui, tetapi route detailnya belum diaktifkan di prototype Homepage R4.",
      toastPrivacy: "Halaman Privasi tidak diaktifkan di prototype Homepage R4.",
      toastRetail: "Jalur Retail ditampilkan sebagai arah navigasi saja. Katalog, konfigurator, checkout, dan pembayaran tidak diaktifkan di prototype ini.",
      toastSignin: "Login dan portal pengguna berada di luar cakupan prototype Homepage R4.",
      toastProjects: "Halaman daftar dan detail Projects tidak diaktifkan di prototype Homepage R4.",
      toastProject: "Detail {project} tidak diaktifkan di prototype Homepage R4.",
      toastDefault: "Interaksi ini hanya menunjukkan batas prototype Homepage R4."
    },
    en: {
      title: "Niuva — From an idea to a product you can test",
      description: "Niuva Homepage R4 prototype: an innovation and product-development partner with four primary services and a distinct Retail path.",
      skip: "Skip to main content",
      boundary: "R4 visual prototype · not the production website",
      brandLink: "Niuva, back to the top",
      mainNav: "Main navigation",
      mobileNav: "Mobile navigation",
      languageToggle: "Choose language. Active language English",
      languageChoice: "Language choice",
      footerNav: "Footer navigation",
      services: "Services",
      developIdeas: "Develop an idea",
      printChoose: "Print & choose products",
      rndNote: "Clarify the problem and define the evidence worth building.",
      consultNote: "Create space for focused learning and team decisions.",
      designNote: "Turn a direction into a form that can be tested.",
      apparelNote: "A primary service for apparel, merchandise, branding, and order-ready products.",
      customNote: "Configure a print request when its inputs can be priced automatically.",
      readyNote: "Order-ready products and Niuva merchandise categories.",
      selfService: "Rental & Self Service",
      megaBoundary: "Custom, high-volume, or capacity-sensitive needs move to an inquiry when they cannot be validated automatically.",
      discussNeeds: "Discuss your needs",
      projects: "Projects",
      about: "About",
      contact: "Contact",
      signIn: "Sign in",
      discussProject: "Discuss a project",
      menu: "Menu",
      explore: "Explore Niuva",
      heroContext: "Innovation & product development partner",
      heroLead: "From an idea to",
      heroEmphasis: "a product you can test.",
      heroLede: "Niuva supports teams through research, engineering, design, prototyping, and product realization.",
      initialChoices: "Initial choices",
      exploreRetail: "Explore Retail",
      orientationLabel: "One partner, two ways to begin",
      orientationTitle: "Start with an unfinished question—or a need that is ready to be made.",
      partnershipTitle: "Partnership & development",
      partnershipCopy: "For R&D, consulting, workshops, design, and prototyping that need a conversation before the direction is locked.",
      startConversation: "Start a conversation",
      retailRouteCopy: "For Custom 3D Print, Ready Products, and Rental & Self Service through a distinct transactional journey.",
      seeRetailPaths: "See the Retail paths",
      processLabel: "How we work",
      processTitle: "Five stages to reduce assumptions before decisions become more expensive.",
      processAria: "Niuva working stages",
      need: "Need",
      needCopy: "Understand the objective, constraints, and unanswered questions.",
      research: "Research",
      researchCopy: "Gather enough context to choose a direction.",
      experiment: "Experiment",
      experimentCopy: "Test possibilities before treating a form as final.",
      prototype: "Prototype",
      prototypeCopy: "Turn a decision into something people can experience.",
      output: "Output",
      outputCopy: "Read the evidence and decide what should happen next.",
      chaptersLabel: "Three chapters, one journey",
      chaptersTitle: "Understand. Shape. Prove.",
      chaptersCopy: "Every project moves at a different depth. This structure keeps the work legible without turning five stages into five repetitive sections.",
      understand: "Understand",
      understandCopy: "We begin with the need, user context, risks, and the evidence that is genuinely worth building.",
      understandPoint1: "Brief and problem space",
      understandPoint2: "Research questions and decision boundaries",
      understandPoint3: "A proportionate experiment plan",
      understandVisualTitle: "From many constraints to one question that can be tested",
      understandVisualDesc: "Four paths of needs and decision boundaries converge into one testing focus.",
      understandIllustrationCaption: "Conceptual illustration · needs and decision boundaries converge into one testable question.",
      shape: "Shape",
      shapeCopy: "Decisions begin to gain dimensions, materials, connections, and consequences the team can test.",
      shapePoint1: "Design and engineering",
      shapePoint2: "Form and material iterations",
      shapePoint3: "Prototyping through Niuva's facilities",
      shapeVisualTitle: "Decision layers form an object that can be tested",
      shapeVisualDesc: "A series of FDM layers moves from flat lines into a physical form with connection points.",
      shapeIllustrationCaption: "Conceptual illustration · layers, form, material, and connections become physical decisions.",
      prove: "Prove",
      proveCopy: "A prototype helps reveal what works, what should change, and whether an idea is ready to move further.",
      provePoint1: "Testing and demonstration",
      provePoint2: "Decision evaluation",
      provePoint3: "Realization from one-off objects to larger-volume needs",
      proveVisualTitle: "An object moves through testing and returns with evidence",
      proveVisualDesc: "A test object travels through three checkpoints before the result forms a feedback path.",
      proveIllustrationCaption: "Conceptual illustration · a prototype is tested, read, and returns evidence for the next decision.",
      projectsLabel: "Project evidence",
      projectsTitle: "A final form only matters when the decisions behind it remain legible.",
      viewAllProjects: "View all Projects",
      pindadAlt: "Green Pindad EV Motor electric motorcycle",
      pindadCaption: "Pindad EV Motor final object as shown in the Niuva Company Profile.",
      pindadCopy: "Electric-vehicle development bringing together product needs, engineering, form, and testing.",
      xeonAlt: "Blue Xeon motorcycle redesign visualization",
      xeonCaption: "Xeon Redesign visualization as shown in the Niuva Company Profile.",
      xeonCopy: "A vehicle-form exploration that makes the design direction legible before the next realization step.",
      agateAlt: "Agate Motorcycle Simulator prototype documentation",
      agateCaption: "Motorcycle Simulator process documentation as shown in the Niuva Company Profile.",
      agateCopy: "A physical prototype combining mechanics, electrical systems, and an interactive simulation experience.",
      readProject: "Read project",
      servicesLabel: "Niuva services",
      servicesTitle: "Capabilities that follow the question—not packages imposed from the start.",
      servicesCopy: "Niuva can enter at research, team learning, design, prototype, or product-realization stages according to the project need.",
      serviceRnd: "Read the problem, structure experiments, and reduce assumptions before major decisions are made.",
      serviceConsult: "Support teams through consulting, workshops, and learning grounded in a real need.",
      serviceDesign: "Translate decisions into designs and physical prototypes that can be tested, improved, and realized.",
      serviceApparel: "Develop apparel and merchandise for custom, branding, partnership, and Ready Products needs.",
      viewService: "View service",
      retailTitle: "When the need is clear enough, begin with the right path.",
      retailCopy: "Retail remains part of one Niuva, but it has configuration, transaction, and tracking flows distinct from partnership work.",
      customTitle: "Configure a print need.",
      customCopy: "Choose specifications, upload a file, see a price when the combination can be calculated, then continue to checkout.",
      exploreCustom: "Explore Custom 3D Print",
      readyTitle: "Find products ready to order.",
      readyCopy: "Keychains, miniatures, display objects, merchandise, and Niuva product categories that continue to grow.",
      exploreReady: "View Ready Products",
      selfServiceCopy: "Access a workstation, printer, or membership through a reservation path kept separate from the product catalogue.",
      learnSelfService: "Learn about the path",
      retailBoundary: "High volumes, special materials, uncertain capacity, or a price that cannot be validated automatically move to an inquiry—without creating an Order, reservation, or payment.",
      partnershipHeading: "Bring the need, constraints, or question your team is facing.",
      partnershipBody: "The inquiry form records the brief for Niuva Operations to review. WhatsApp is available as an optional continuation after the inquiry is submitted.",
      responseOwner: "Niuva Operations",
      responseTime: "Within 1 business day · Monday–Friday, 09:00–17:00 WIB, excluding public holidays",
      openContact: "Open the Contact page",
      contactDetailsTitle: "When you open the Contact page",
      contactOwnerLabel: "Reviewed by",
      contactResponseLabel: "Response time",
      contactFlowLabel: "Continuation",
      contactFlowValue: "The Inquiry is recorded first. WhatsApp becomes available after the form is submitted.",
      inquiryBoundary: "This prototype does not send or store data.",
      faqTitle: "Questions before you begin.",
      faq1Q: "Do I need to have a final design?",
      faq1A: "No. For partnership work, Niuva can begin with your need, problem, references, or constraints. Retail Custom 3D Print requires a file when the request enters configuration.",
      faq2Q: "When does a Retail order become an inquiry?",
      faq2A: "When volume, material, capacity, price, ETA, or fulfilment cannot be validated automatically. The context moves to an inquiry without creating a transaction.",
      faq3Q: "Does Niuva only provide 3D printing?",
      faq3A: "No. 3D printing is one realization method. Niuva also works across research, consulting, workshops, design, engineering, prototyping, and product realization.",
      closingLead: "Good ideas deserve",
      closingEmphasis: "evidence you can touch.",
      closingCopy: "Start a conversation with Niuva, or enter Retail when the need is ready to configure.",
      privacy: "Privacy",
      dismissNotice: "Dismiss notification",
      toastInquiry: "The complete form lives on the Contact page and outside the Homepage R4 prototype. No data is sent or stored.",
      toastService: "The {service} detail page is an approved direction, but its detailed route is not activated in the Homepage R4 prototype.",
      toastPrivacy: "The Privacy page is not activated in the Homepage R4 prototype.",
      toastRetail: "Retail is shown as a navigation direction only. Catalogue, configurator, checkout, and payment are not activated in this prototype.",
      toastSignin: "Sign-in and the customer portal are outside the Homepage R4 prototype scope.",
      toastProjects: "The Projects index and detail pages are not activated in the Homepage R4 prototype.",
      toastProject: "The {project} detail page is not activated in the Homepage R4 prototype.",
      toastDefault: "This interaction only demonstrates the boundary of the Homepage R4 prototype."
    }
  };

  function getCopy(key) {
    return (copy[language] && copy[language][key]) || (copy.id && copy.id[key]) || null;
  }

  function applyCopy() {
    var selected = copy[language];
    document.title = selected.title;
    document.querySelector('meta[name="description"]').setAttribute("content", selected.description);

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var value = selected[element.dataset.i18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
      var value = selected[element.dataset.i18nAria];
      if (value) element.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (element) {
      var value = selected[element.dataset.i18nAlt];
      if (value) element.setAttribute("alt", value);
    });

    document.querySelectorAll("[data-language-link]").forEach(function (link) {
      var isCurrent = link.dataset.languageLink === language;
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.querySelector("[data-active-language]").textContent = language.toUpperCase();
    document.getElementById("canonical-link").setAttribute("href", language === "en" ? "/en" : "/");
  }

  var servicesToggle = document.getElementById("services-toggle");
  var servicesPanel = document.getElementById("services-panel");
  var languageToggle = document.getElementById("language-toggle");
  var languageMenu = document.getElementById("language-menu");
  var mobileToggle = document.getElementById("mobile-menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var mobileServicesToggle = document.getElementById("mobile-services-toggle");
  var mobileServices = document.getElementById("mobile-services");

  function setDisclosure(toggle, panel, open, returnFocus) {
    toggle.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (!open && returnFocus) toggle.focus();
  }

  function closeDesktopDisclosures(except) {
    if (except !== "services") setDisclosure(servicesToggle, servicesPanel, false, false);
    if (except !== "language") setDisclosure(languageToggle, languageMenu, false, false);
  }

  function setMobileServices(open) {
    setDisclosure(mobileServicesToggle, mobileServices, open, false);
    mobileServicesToggle.querySelector("span:last-child").textContent = open ? "−" : "+";
  }

  servicesToggle.addEventListener("click", function () {
    var next = servicesToggle.getAttribute("aria-expanded") !== "true";
    closeDesktopDisclosures("services");
    setDisclosure(servicesToggle, servicesPanel, next, false);
  });

  languageToggle.addEventListener("click", function () {
    var next = languageToggle.getAttribute("aria-expanded") !== "true";
    closeDesktopDisclosures("language");
    setDisclosure(languageToggle, languageMenu, next, false);
  });

  mobileToggle.addEventListener("click", function () {
    var next = mobileToggle.getAttribute("aria-expanded") !== "true";
    setDisclosure(mobileToggle, mobileMenu, next, false);
    document.body.classList.toggle("mobile-menu-open", next);
    if (next) mobileMenu.querySelector("a,button").focus();
    else setMobileServices(false);
  });

  mobileServicesToggle.addEventListener("click", function () {
    var next = mobileServicesToggle.getAttribute("aria-expanded") !== "true";
    setMobileServices(next);
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".services-disclosure") && servicesToggle.getAttribute("aria-expanded") === "true") {
      setDisclosure(servicesToggle, servicesPanel, false, false);
    }
    if (!event.target.closest(".language-disclosure") && languageToggle.getAttribute("aria-expanded") === "true") {
      setDisclosure(languageToggle, languageMenu, false, false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (languageToggle.getAttribute("aria-expanded") === "true") {
      setDisclosure(languageToggle, languageMenu, false, true);
      return;
    }
    if (servicesToggle.getAttribute("aria-expanded") === "true") {
      setDisclosure(servicesToggle, servicesPanel, false, true);
      return;
    }
    if (mobileToggle.getAttribute("aria-expanded") === "true") {
      setDisclosure(mobileToggle, mobileMenu, false, true);
      setMobileServices(false);
      document.body.classList.remove("mobile-menu-open");
    }
  });

  mobileMenu.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      setDisclosure(mobileToggle, mobileMenu, false, false);
      setMobileServices(false);
      document.body.classList.remove("mobile-menu-open");
    });
  });

  document.querySelectorAll(".faq-list details").forEach(function (details) {
    details.addEventListener("toggle", function () {
      if (!details.open) return;
      document.querySelectorAll(".faq-list details[open]").forEach(function (other) {
        if (other !== details) other.open = false;
      });
    });
  });

  var toast = document.getElementById("prototype-toast");
  var toastMessage = document.getElementById("prototype-toast-message");
  var status = document.getElementById("prototype-status");
  var toastTimer = null;

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toastMessage.textContent = message;
    status.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 7000);
  }

  document.querySelectorAll("[data-prototype-action]").forEach(function (control) {
    control.addEventListener("click", function (event) {
      event.preventDefault();
      var action = control.dataset.prototypeAction;
      var messageKey = {
        inquiry: "toastInquiry",
        service: "toastService",
        privacy: "toastPrivacy",
        retail: "toastRetail",
        signin: "toastSignin",
        projects: "toastProjects",
        project: "toastProject"
      }[action] || "toastDefault";
      var message = getCopy(messageKey);
      if (action === "project") message = message.replace("{project}", control.dataset.project || "project");
      if (action === "service") message = message.replace("{service}", control.dataset.service || "service");
      showToast(message);
    });
  });

  document.querySelector("[data-dismiss-toast]").addEventListener("click", function () {
    toast.hidden = true;
    window.clearTimeout(toastTimer);
  });

  var contourStage = document.querySelector("[data-contour-stage]");
  function resetContour() {
    contourStage.style.setProperty("--pointer-x", "0px");
    contourStage.style.setProperty("--pointer-y", "0px");
  }
  contourStage.addEventListener("pointermove", function (event) {
    if (!precisePointer.matches || reducedMotion.matches || root.dataset.capture === "true") return;
    var rect = contourStage.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    var y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    contourStage.style.setProperty("--pointer-x", x.toFixed(2) + "px");
    contourStage.style.setProperty("--pointer-y", y.toFixed(2) + "px");
  });
  contourStage.addEventListener("pointerleave", resetContour);

  var revealTargets = document.querySelectorAll(".chapter, .project-entry, .service-grid article, .retail-doors article");
  if ("IntersectionObserver" in window && !reducedMotion.matches && root.dataset.capture !== "true") {
    revealTargets.forEach(function (element) { element.classList.add("will-reveal"); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });
    revealTargets.forEach(function (element) { observer.observe(element); });
  }

  var header = document.querySelector("[data-header]");
  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }, { passive: true });

  applyCopy();
})();
