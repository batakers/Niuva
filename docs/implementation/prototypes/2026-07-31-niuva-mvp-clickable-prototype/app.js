(() => {
  "use strict";

  const app = document.querySelector("#app");
  const liveRegion = document.querySelector("#live-region");
  const STORAGE_KEY = "niuva-mvp-prototype-state-v4";
  const query = new URLSearchParams(window.location.search);
  const DELIVERY_SHIPPING = 18000;
  const REVISION_DUE_LABEL = "1 Agustus 2026 pukul 17.00 WIB";

  const defaultState = {
    scenario: "ready-happy",
    menuOpen: false,
    adminMenuOpen: false,
    moderatorPanelOpen: true,
    reviewMode: query.get("mode") === "moderator" ? "moderator" : "participant",
    toast: "",
    loggedIn: false,
    returnTo: "/retail/checkout",
    configMode: "simple",
    material: "PLA",
    finish: "Standard",
    grams: 86.4,
    printSeconds: 20700,
    fileState: "empty",
    slicingState: "idle",
    quoteRequired: false,
    offerStatus: "offered",
    checkoutState: "preview",
    reservationMinutes: 30,
    orderReference: null,
    paymentAttemptReference: null,
    reservationStatus: "none",
    reservationPolicyId: null,
    fulfillmentMode: "delivery",
    orderSnapshot: null,
    orderState: "printing",
    revisionVersion: 1,
    revisionSubmitted: false,
    notificationFailure: false,
    conflict: false,
    cancellationSubmitted: false,
    cancellationSubmittedAt: "",
    complaintEvidenceCount: 0,
    complaintCase: null,
    resolutionApprovalStatus: "not_requested",
    resolutionSubmittedAt: "",
    managerApprovedAt: "",
    cartItems: [],
    operatorContext: "NV-DEMO-014",
  };

  let storedState = {};
  try {
    storedState = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    storedState = {};
  }

  // Migrate v3 → v4: normalize legacy state that stored checkoutState
  // as "fresh" without a paymentAttemptReference, which would incorrectly
  // display an active reservation.
  try {
    const legacyKey = "niuva-mvp-prototype-state-v3";
    const legacy = window.sessionStorage.getItem(legacyKey);
    if (legacy && !window.sessionStorage.getItem(STORAGE_KEY)) {
      const parsed = JSON.parse(legacy);
      // Convert hours → printSeconds if present
      if (typeof parsed.hours === "number" && parsed.printSeconds == null) {
        parsed.printSeconds = Math.round(parsed.hours * 3600);
        delete parsed.hours;
      }
      // Normalize checkout state: without paymentAttemptReference, force preview
      if (parsed.checkoutState === "fresh" && !parsed.paymentAttemptReference) {
        parsed.checkoutState = "preview";
      }
      parsed.reservationStatus = parsed.reservationStatus || "none";
      parsed.orderReference = parsed.orderReference || null;
      parsed.paymentAttemptReference = parsed.paymentAttemptReference || null;
      parsed.reservationPolicyId = parsed.reservationPolicyId || null;
      storedState = parsed;
    }
    // Also normalize current v4 state for same invariant
    if (storedState.checkoutState === "fresh" && !storedState.paymentAttemptReference) {
      storedState.checkoutState = "preview";
      storedState.reservationStatus = "none";
    }
    // Convert leftover hours field
    if (typeof storedState.hours === "number" && storedState.printSeconds == null) {
      storedState.printSeconds = Math.round(storedState.hours * 3600);
      delete storedState.hours;
    }
  } catch {
    // migration is best-effort; defaults will apply
  }

  const state = {
    ...defaultState,
    ...storedState,
    menuOpen: false,
    adminMenuOpen: false,
    toast: "",
    reviewMode: defaultState.reviewMode,
    cartItems: Array.isArray(storedState.cartItems) ? storedState.cartItems : [],
    orderSnapshot:
      storedState.orderSnapshot && Array.isArray(storedState.orderSnapshot.items)
        ? storedState.orderSnapshot
        : null,
  };

  const scenarios = [
    ["ready-happy", "Ready Product"],
    ["custom-simple", "Custom sederhana"],
    ["custom-detail", "Custom detail"],
    ["custom-3mf", "3MF aman"],
    ["upload-invalid", "File tidak valid"],
    ["quote-required", "quote_required"],
    ["mixed-cart", "Mixed cart"],
    ["offer-accepted", "Offer diterima"],
    ["offer-declined", "Offer ditolak"],
    ["offer-expired", "Offer kedaluwarsa"],
    ["offer-superseded", "Offer diganti"],
    ["checkout-stale", "Harga / ETA berubah"],
    ["reservation-warning", "Reservasi sisa 5 menit"],
    ["reservation-expired", "Reservasi habis"],
    ["revision-required", "Revisi file"],
    ["eta-overdue", "ETA terlambat"],
    ["order-pickup", "Order siap pickup"],
    ["order-delivery", "Order dikirim"],
    ["order-received", "Produk diterima"],
    ["cancellation", "Pembatalan order"],
    ["complaint", "Komplain"],
    ["case-status", "Status after-sales"],
    ["session-expired", "Sesi berakhir"],
    ["access-denied", "Akses ditolak"],
    ["backend-down", "Layanan bermasalah"],
    ["operator-next-actions", "Operator next actions"],
    ["operator-conflict", "Operator konflik data"],
    ["notification-failed", "Operator email gagal"],
    ["refund-separation", "Approval vs Finance"],
  ];

  const canonicalExact = new Set([
    "/",
    "/about",
    "/capabilities",
    "/projects",
    "/contact",
    "/retail",
    "/retail/checkout",
    "/login",
    "/register",
    "/dashboard",
    "/dashboard/notifications",
    "/admin",
    "/admin/content",
    "/admin/catalog",
    "/admin/retail-requests",
    "/admin/retail-orders",
    "/admin/retail-cases",
  ]);

  const candidatePatterns = [
    /^\/retail\/cart$/,
    /^\/orders\/[^/]+\/file-revision$/,
    /^\/orders\/[^/]+\/cancellation$/,
    /^\/orders\/[^/]+\/complaints\/new$/,
    /^\/orders\/[^/]+\/complaints\/[^/]+$/,
  ];

  const canonicalPatterns = [
    /^\/retail\/products\/[^/]+$/,
    /^\/retail\/products\/[^/]+\/configure$/,
    /^\/retail\/requests\/[^/]+$/,
    /^\/retail\/offers\/[^/]+$/,
    /^\/orders\/[^/]+$/,
    /^\/admin\/retail-requests\/[^/]+$/,
    /^\/admin\/retail-orders\/[^/]+$/,
    /^\/admin\/retail-cases\/[^/]+$/,
  ];

  function roundHalfUp(value) {
    if (value < 0) throw new Error("roundHalfUp: negative value");
    return Math.floor(value + 0.5);
  }

  function progressiveMaterialPrice(grams, material) {
    if (material === "ABS") {
      return Math.min(grams, 200) * 1200
        + Math.min(Math.max(grams - 200, 0), 300) * 1100
        + Math.max(grams - 500, 0) * 1000;
    }
    return Math.min(grams, 200) * 1000
      + Math.min(Math.max(grams - 200, 0), 300) * 900
      + Math.max(grams - 500, 0) * 800;
  }

  const printHours = (seconds) => seconds / 3600;

  const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(roundHalfUp(value));

  const readyCartItem = (quantity = 1) => ({
    id: "ready-keychain",
    type: "ready",
    name: "Keychain Layer",
    variant: "Blue steel",
    quantity,
    unitPrice: 45000,
  });

  const customCartItem = () => {
    const totals = customTotals();
    return {
      id: "custom-model-v7",
      type: "custom",
      name: state.fileState === "valid3mf" ? "enclosure-v2.3mf" : "model-v7.stl",
      material: state.material,
      grams: state.grams,
      printSeconds: state.printSeconds,
      subtotal: totals.total,
    };
  };

  const cartItemSubtotal = (item) =>
    item.type === "ready" ? item.unitPrice * item.quantity : item.subtotal;

  const cartSubtotal = () =>
    state.cartItems.reduce((total, item) => total + cartItemSubtotal(item), 0);

  const snapshotCartItems = () => state.cartItems.map((item) => ({ ...item }));

  const fallbackOrderSnapshot = () => ({
    items: [
      {
        id: "custom-model-v7",
        type: "custom",
        name: "model-v7.stl",
        material: "PLA",
        grams: 86.4,
        printSeconds: 20700,
        subtotal: 115150,
      },
    ],
    subtotal: 115150,
    shipping: DELIVERY_SHIPPING,
    total: 133150,
    fulfillment: "Pengiriman",
  });

  const activeOrderSnapshot = () => state.orderSnapshot || fallbackOrderSnapshot();

  const hasActiveCheckoutAttempt = () =>
    state.reservationStatus === "active"
    && Boolean(state.orderReference)
    && Boolean(state.paymentAttemptReference)
    && Boolean(state.orderSnapshot);

  const createOrderSnapshot = () => {
    const subtotal = cartSubtotal();
    const shipping = state.fulfillmentMode === "pickup" ? 0 : DELIVERY_SHIPPING;
    return {
      items: snapshotCartItems(),
      subtotal,
      shipping,
      total: subtotal + shipping,
      fulfillment: state.fulfillmentMode === "pickup" ? "Pickup di Niuva" : "Pengiriman",
    };
  };

  const orderLineTitle = (item) =>
    item.type === "ready" ? `Ready Product · ${item.name}` : `Custom Print · ${item.name}`;

  const orderLineDetail = (item) =>
    item.type === "ready"
      ? `${item.variant} · ${item.quantity} item`
      : `${item.material} · ${item.grams} g · ${printHours(item.printSeconds).toFixed(2)} jam mesin`;

  const demoComplaintCase = (evidenceCount = 1) => ({
    id: "CASE-DEMO-01",
    issue: "Hasil cetak tidak sesuai",
    description: "Contoh deskripsi simulasi untuk validasi alur.",
    evidenceCount,
    submittedAt: "31 Juli 2026",
  });

  function persistState() {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...state,
          toast: "",
          menuOpen: false,
          adminMenuOpen: false,
          moderatorPanelOpen: true,
          reviewMode: undefined,
        }),
      );
    } catch {
      // The prototype still works in-memory when browser storage is unavailable.
    }
  }

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const routeKind = (path) => {
    if (path === "/order" || path === "/admin/orders") return "legacy";
    if (candidatePatterns.some((pattern) => pattern.test(path))) return "candidate";
    if (canonicalExact.has(path) || canonicalPatterns.some((pattern) => pattern.test(path))) {
      return "canonical";
    }
    return "prototype";
  };

  const surfaceFor = (path) => (path.startsWith("/admin") ? "operator" : "customer");

  const link = (href, label, className = "") =>
    `<a href="${href}" data-route="${href}" class="${className}">${label}</a>`;

  const button = (label, action, className = "button", extra = "") =>
    `<button type="button" class="${className}" data-action="${action}" ${extra}>${label}</button>`;

  const status = (label, tone = "info") =>
    `<span class="status ${tone}">${label}</span>`;

  const notice = (title, message, tone = "info") => `
    <div class="notice ${tone}" role="${tone === "danger" ? "alert" : "status"}">
      <span class="notice-icon" aria-hidden="true">${tone === "success" ? "✓" : tone === "danger" ? "!" : "i"}</span>
      <div><strong>${title}</strong><p>${message}</p></div>
    </div>
  `;

  const moderatorOnly = (content) =>
    state.reviewMode === "moderator" ? content : "";

  const mobileActionBar = (label, value, action, disabled = false, buttonLabel = "") => `
    <aside class="mobile-action-bar" aria-label="Aksi utama">
      <div><span>${label}</span><strong>${value}</strong></div>
      <button type="button" class="button" data-action="${action}" ${disabled ? "disabled" : ""}>
        ${disabled ? "Belum tersedia" : (buttonLabel || "Lanjut")}
      </button>
    </aside>
  `;

  const scenarioOptions = () =>
    scenarios
      .map(
        ([value, label]) =>
          `<option value="${value}" ${state.scenario === value ? "selected" : ""}>${label}</option>`,
      )
      .join("");

  function announce(message) {
    liveRegion.textContent = "";
    window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 20);
  }

  function setToast(message) {
    state.toast = message;
    announce(message);
    render({ preserveFocus: true });
    window.setTimeout(() => {
      if (state.toast === message) {
        state.toast = "";
        render({ preserveFocus: true });
      }
    }, 2800);
  }

  function navigate(path, options = {}) {
    const requestedPath = path.startsWith("/") ? path : "/";
    const aliases = {
      "/services": "/capabilities",
      "/portfolio": "/projects",
    };
    const safePath = aliases[requestedPath] || requestedPath;
    const destination =
      state.reviewMode === "moderator" ? `${safePath}?mode=moderator` : safePath;
    if (
      window.location.pathname !== safePath ||
      window.location.search !== (state.reviewMode === "moderator" ? "?mode=moderator" : "")
    ) {
      window.history.pushState({}, "", destination);
    }
    state.menuOpen = false;
    state.adminMenuOpen = false;
    persistState();
    render();
    if (!options.silent) announce(`Berpindah ke ${document.title}`);
  }

  function routeTag(path) {
    const kind = routeKind(path);
    if (kind === "canonical") return `<span class="route-tag canonical">Route canonical</span>`;
    if (kind === "candidate") return `<span class="route-tag candidate">Route candidate</span>`;
    if (kind === "legacy") return `<span class="route-tag candidate">Legacy · read-only</span>`;
    return `<span class="route-tag">Prototype helper</span>`;
  }

  function header(path) {
    const surface = surfaceFor(path);
    const isAdmin = surface === "operator";
    const customerCurrent = !isAdmin;
    const moderator = state.reviewMode === "moderator";
    return `
      <aside class="prototype-banner" aria-label="Status prototipe">
        Prototype simulasi — tidak memproses data, pembayaran, atau pesanan nyata.
      </aside>
      <header class="site-header">
        <div class="header-inner">
          ${link("/", '<img class="brand-mark" src="/niuva-mark.svg" alt="" /><span>Niuva</span>', "brand")}
          <nav class="primary-nav ${state.menuOpen ? "open" : ""}" aria-label="Navigasi utama">
            ${
              isAdmin
                ? `
                  ${link("/admin", "Ringkasan", `nav-link ${path === "/admin" ? "active" : ""}`)}
                  ${link("/admin/retail-requests", "Request", "nav-link")}
                  ${link("/admin/retail-orders", "Order", "nav-link")}
                  ${link("/admin/retail-cases", "After-sales", "nav-link")}
                `
                : `
                  ${link("/", "Home", "nav-link")}
                  ${link("/capabilities", "Capabilities", "nav-link")}
                  ${link("/projects", "Projects", "nav-link")}
                  ${link("/retail", "Retail", "nav-link")}
                  ${link("/contact", "Contact", "nav-link")}
                `
            }
          </nav>
          <div class="header-actions">
            <button
              type="button"
              class="menu-button"
              data-action="toggle-menu"
              aria-label="Buka atau tutup navigasi"
              aria-expanded="${state.menuOpen}"
            >☰</button>
          </div>
        </div>
      </header>
      ${
        moderator
          ? `
            <section class="moderator-console ${state.moderatorPanelOpen ? "open" : ""}" aria-label="Panel moderator">
              <div class="moderator-console-inner">
                <div class="moderator-console-heading">
                  <div>
                    <strong>Panel moderator</strong>
                    <span class="route-path">${escapeHtml(path)}</span>
                  </div>
                  <button type="button" class="button secondary small" data-action="toggle-moderator-panel" aria-expanded="${state.moderatorPanelOpen}">
                    ${state.moderatorPanelOpen ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                ${
                  state.moderatorPanelOpen
                    ? `
                      <div class="moderator-controls">
                        <div class="field moderator-scenario">
                          <label for="scenario-select">Fixture skenario</label>
                          <select class="scenario-select" id="scenario-select">
                            ${scenarioOptions()}
                          </select>
                        </div>
                        <div class="moderator-route">
                          ${routeTag(path)}
                          <span class="route-tag">${customerCurrent ? "Customer surface" : "Operator surface"}</span>
                        </div>
                        <div class="button-row">
                          ${link(
                            isAdmin ? "/retail" : "/admin",
                            isAdmin ? "Buka customer surface" : "Buka operator surface",
                            "button secondary small",
                          )}
                          ${button("Buka Participant Mode", "participant-mode", "button secondary small")}
                          ${button("Reset state sesi", "reset-session", "button secondary small")}
                        </div>
                      </div>
                    `
                    : ""
                }
              </div>
            </section>
          `
          : ""
      }
    `;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <span>Niuva MVP · Prototype simulasi</span>
          <span>Tidak memproses pembayaran atau data nyata.</span>
        </div>
      </footer>
    `;
  }

  function publicHome() {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page">
          <section class="hero-grid" aria-labelledby="home-title">
            <div>
              <span class="eyebrow">Create what is not on the shelf</span>
              <h1 id="home-title">Dari ide teknis menjadi benda yang bisa diuji.</h1>
              <p class="lede">
                Niuva membantu tim dan individu merancang, memvalidasi, lalu memproduksi
                objek FDM—dari partnership R&amp;D sampai produk siap beli.
              </p>
              <div class="hero-actions">
                ${link("/contact", "Diskusikan kebutuhan B2B", "button")}
                ${link("/retail", "Jelajahi Retail", "button secondary")}
              </div>
            </div>
            <div class="layer-visual" aria-label="Ilustrasi lapisan proses FDM">
              <div class="layer-stack" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>
              <p>Satu platform, dua perjalanan: partnership B2B dan transaksi Retail.</p>
            </div>
          </section>

          <section class="section" aria-labelledby="service-title">
            <div class="section-heading">
              <div>
                <span class="eyebrow">Services</span>
                <h2 id="service-title">Empat cara bekerja bersama Niuva</h2>
              </div>
              <p>Scope dan hasil disesuaikan dengan tahap ide, kebutuhan tim, dan pola transaksi.</p>
            </div>
            <div class="card-grid four">
              <article class="card">
                <span class="card-kicker">01 · Partnership</span>
                <h3>Research &amp; Development</h3>
                <p>Eksplorasi material, bentuk, dan validasi teknis melalui inquiry.</p>
              </article>
              <article class="card">
                <span class="card-kicker">02 · B2B</span>
                <h3>Consultant &amp; Workshop</h3>
                <p>Pendampingan tim dan workshop yang diproses manual sebagai project.</p>
              </article>
              <article class="card">
                <span class="card-kicker">03 · Retail / B2B</span>
                <h3>Design &amp; Prototyping</h3>
                <p>Jasa desain dan cetak untuk kebutuhan satuan maupun kemitraan.</p>
              </article>
              <article class="card">
                <span class="card-kicker">04 · Retail</span>
                <h3>Apparel &amp; Merchandise</h3>
                <p>Produk ready serta custom merchandise dengan status pengerjaan.</p>
              </article>
            </div>
          </section>
        </div>
      </main>
    `;
  }

  function simplePublicPage(path) {
    const pages = {
      "/about": ["About", "Mengenal cara Niuva bekerja", "Profil, kemampuan FDM, dan prinsip kerja Niuva akan dikelola melalui CMS."],
      "/capabilities": ["Capabilities", "Pilih bentuk kolaborasi yang tepat", "Setiap capability mengarahkan pelanggan ke inquiry B2B atau transaksi Retail yang sesuai."],
      "/projects": ["Projects", "Jejak pekerjaan, bukan sekadar galeri", "Portfolio dapat dipublikasikan operator non-IT melalui alur konten sederhana."],
      "/contact": ["Contact", "Mulai percakapan partnership", "Kebutuhan R&D, konsultasi, workshop, dan pekerjaan nonstandar diproses sebagai inquiry manual."],
    };
    const [eyebrow, title, description] = pages[path] || pages["/about"];
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page">
          <span class="eyebrow">${eyebrow}</span>
          <h1>${title}</h1>
          <p class="lede">${description}</p>
          <section class="section card-grid two" aria-label="Aksi halaman">
            <article class="card">
              <span class="card-kicker">B2B primary</span>
              <h2>Jelaskan kebutuhan Anda</h2>
              <p>Operator akan meninjau konteks, target, jumlah, dan tenggat secara manual.</p>
              <div class="button-row">${button("Simulasikan kirim inquiry", "submit-inquiry")}</div>
            </article>
            <article class="card">
              <span class="card-kicker">Retail secondary</span>
              <h2>Sudah siap bertransaksi?</h2>
              <p>Lihat produk ready atau unggah file untuk Custom 3D Print.</p>
              <div class="button-row">${link("/retail", "Masuk ke Retail", "button secondary")}</div>
            </article>
          </section>
        </div>
      </main>
    `;
  }

  function retailIndex() {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page">
          <span class="eyebrow">Katalog Retail</span>
          <h1>Pilih produk ready atau mulai Custom 3D Print.</h1>
          <p class="lede">
            Harga yang dapat dihitung otomatis ditampilkan sebelum pembayaran.
            Kombinasi nonstandar diarahkan ke Assisted Retail Offer.
          </p>
          <div class="section card-grid two">
            <article class="card">
              <div class="product-figure"><span class="product-shape" aria-hidden="true"></span></div>
              <div class="chip-row">${status("Ready Product", "success")}${status("Stok simulasi: 8", "info")}</div>
              <h2 style="margin-top: 14px">Keychain Layer</h2>
              <p>Contoh produk siap beli. Sebagian produk lain dapat dibuat setelah dipesan.</p>
              <div class="price">Rp45.000 <span class="fine-print">· harga simulasi</span></div>
              <div class="button-row">${link("/retail/products/ready-keychain", "Lihat produk", "button")}</div>
            </article>
            <article class="card">
              <div class="product-figure"><span class="product-shape custom" aria-hidden="true"></span></div>
              <div class="chip-row">${status("Jasa cetak FDM", "info")}${status("STL / 3MF", "info")}</div>
              <h2 style="margin-top: 14px">Custom 3D Print</h2>
              <p>Unggah artwork, pilih mode sederhana atau detail, lalu lihat harga atau jalur quote.</p>
              <div class="price">Dihitung dari slicer</div>
              <div class="button-row">${link("/retail/products/custom-fdm", "Mulai custom", "button")}</div>
            </article>
          </div>
          <section class="section" aria-labelledby="how-title">
            <div class="section-heading">
              <div><span class="eyebrow">Cara kerja</span><h2 id="how-title">Transparan sampai produksi</h2></div>
            </div>
            <ol class="stepper">
              <li class="current">Pilih atau konfigurasi</li>
              <li>Konfirmasi harga &amp; ETA</li>
              <li>Bayar online</li>
              <li>Lacak produksi</li>
            </ol>
          </section>
        </div>
      </main>
    `;
  }

  function readyProduct() {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <div class="detail-grid">
            <div>
              <div class="product-figure ready-product-figure"><span class="product-shape" aria-hidden="true"></span></div>
              <div class="section">
                <span class="eyebrow">Informasi produk</span>
                <h2>Ready stock dan made-to-order dalam satu katalog</h2>
                <p class="lede">Stok aktual, batas minimum, dan status produksi akan dikelola operator. Contoh ini memakai stok ready.</p>
              </div>
            </div>
            <aside class="detail-sticky layer-card" aria-labelledby="ready-title">
              <div class="chip-row">${status("Ready Product", "success")}${status("8 tersedia", "info")}</div>
              <h1 id="ready-title" style="font-size:clamp(2rem,4vw,3.4rem);margin-top:16px">Keychain Layer</h1>
              <p class="lede">Keychain FDM dengan bentuk berlapis dan pilihan warna.</p>
              <div class="price">Rp45.000</div>
              <p class="fine-print">Harga dan stok hanya data simulasi prototipe.</p>
              <div class="field" style="margin-top:22px">
                <label for="ready-color">Warna</label>
                <select id="ready-color"><option>Blue steel</option><option>Graphite</option><option>Natural</option></select>
              </div>
              <div class="button-row">
                ${button("Tambah ke keranjang", "add-ready")}
                ${link("/retail", "Kembali", "button secondary")}
              </div>
            </aside>
          </div>
        </div>
        ${mobileActionBar("Keychain Layer", "Rp45.000", "add-ready", false, "Tambah ke keranjang")}
      </main>
    `;
  }

  function customProduct() {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page">
          <div class="hero-grid">
            <div>
              <span class="eyebrow">Custom 3D Print · FDM</span>
              <h1>File Anda, dihitung dari hasil slicing.</h1>
              <p class="lede">
                Pilih konfigurasi sederhana untuk hasil cepat, atau buka parameter detail.
                Sistem memakai berat dan waktu slicer dengan presisi asli; pembulatan hanya pada total akhir.
              </p>
              <div class="hero-actions">
                ${link("/retail/products/custom-fdm/configure", "Konfigurasi cetak", "button")}
                ${link("/retail", "Kembali ke katalog", "button secondary")}
              </div>
            </div>
            <div class="layer-card">
              <span class="card-kicker">Accepted input</span>
              <h2>STL atau 3MF</h2>
              <ul class="check-list">
                <li>Profil printer dari file pelanggan tidak digunakan</li>
                <li>Operator melakukan pemeriksaan file aman</li>
                <li>File .gcode tidak diterima</li>
                <li class="pending">Kombinasi nonstandar ditinjau operator untuk penawaran</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  function customTotals() {
    const material = progressiveMaterialPrice(state.grams, state.material);
    const machine = state.printSeconds / 3600 * 5000;
    const total = roundHalfUp(material + machine);
    return { material, machine, total };
  }

  function customConfigurator() {
    const totals = customTotals();
    const invalid = state.fileState === "invalid";
    const valid = state.fileState === "valid" || state.fileState === "valid3mf";
    const fileName = state.fileState === "valid3mf" ? "enclosure-v2.3mf" : "model-v7.stl";
    const slicing = state.slicingState;
    const quote = state.quoteRequired || slicing === "failed";
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">Custom 3D Print</span>
          <h1 style="font-size:clamp(2rem,4vw,3.5rem)">Konfigurasi dan pemeriksaan file</h1>
          <ol class="stepper">
            <li class="done">Produk</li>
            <li class="${slicing === "done" || quote ? "done" : "current"}">File &amp; konfigurasi</li>
            <li class="${slicing === "done" || quote ? "current" : ""}">Harga / penawaran</li>
            <li>Checkout</li>
          </ol>
          <div class="detail-grid">
            <div class="layer-card">
              <div class="field">
                <span id="mode-label" style="font-weight:800">Mode konfigurasi</span>
                <div class="segment" role="group" aria-labelledby="mode-label">
                  ${button("Sederhana", "mode-simple", "", `aria-pressed="${state.configMode === "simple"}"`)}
                  ${button("Detail", "mode-detail", "", `aria-pressed="${state.configMode === "detail"}"`)}
                </div>
              </div>
              <div class="field-grid" style="margin-top:22px">
                <div class="field">
                  <label for="material">Material</label>
                  <select id="material" data-change="material">
                    <option value="PLA" ${state.material === "PLA" ? "selected" : ""}>PLA</option>
                    <option value="ABS" ${state.material === "ABS" ? "selected" : ""}>ABS</option>
                  </select>
                </div>
                <div class="field">
                  <label for="quality">Paket kualitas</label>
                  <select id="quality">
                    <option>Draft</option><option selected>Standard</option><option>High Detail</option>
                  </select>
                </div>
                ${
                  state.configMode === "detail"
                    ? `
                      <div class="field">
                        <label for="layer-height">Layer height</label>
                        <select id="layer-height"><option>0.28 mm</option><option selected>0.20 mm</option><option>0.12 mm</option></select>
                      </div>
                      <div class="field">
                        <label for="infill">Infill</label>
                        <select id="infill"><option>10%</option><option selected>20%</option><option>40%</option></select>
                      </div>
                    `
                    : ""
                }
                <div class="field full">
                  <span id="upload-label" style="font-weight:800">Artwork</span>
                  <div class="upload-zone" aria-labelledby="upload-label">
                    <div>
                      <strong>${valid ? `${fileName} siap diperiksa` : invalid ? "File tidak dapat diproses" : "Unggah STL atau 3MF"}</strong>
                      <p>${
                        invalid
                          ? "Format/ukuran/geometri tidak lolos pemeriksaan. Ganti file dan coba lagi."
                          : valid
                            ? `File simulasi 8,4 MB · ${state.fileState === "valid3mf" ? "profil printer dari 3MF" : "profil printer pelanggan"} diabaikan.`
                            : "Pilih file contoh STL atau 3MF untuk melanjutkan pemeriksaan. Tidak ada file yang dikirim ke server."
                      }</p>
                      <div class="button-row" style="justify-content:center">
                        ${button(valid ? "Ganti file" : "Pilih file STL/3MF", "upload-valid", "button secondary")}
                        ${moderatorOnly(
                          button("Simulasikan file bermasalah", "upload-invalid", "button secondary"),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ${
                invalid
                  ? `<div style="margin-top:16px">${notice("File belum diterima", "Pesanan belum dibuat dan pembayaran belum diminta. Perbaiki atau ganti file.", "danger")}</div>`
                  : ""
              }
              ${
                valid
                  ? `
                    <div class="button-row">
                      ${button(slicing === "done" ? "Harga sudah dihitung" : "Analisis file & hitung harga", "slice-ok", "button", slicing === "done" ? "disabled" : "")}
                      ${moderatorOnly(
                        button("Simulasikan gagal slicing", "slice-failed", "button secondary"),
                      )}
                    </div>
                  `
                  : ""
              }
            </div>
            <aside class="layer-card detail-sticky" aria-labelledby="estimate-title">
              <span class="card-kicker">Estimasi langsung · simulasi</span>
              <h2 id="estimate-title">${quote ? "Perlu penawaran operator" : slicing === "done" ? "Harga dapat dihitung" : "Menunggu hasil slicer"}</h2>
              ${
                quote
                  ? `
                    <div style="margin-top:18px">${notice(
                      state.reviewMode === "moderator" ? "quote_required" : "Perlu penawaran manual",
                      "Kombinasi ini tidak aman dihargai otomatis. Request akan ditinjau operator, lalu pelanggan menerima offer.",
                      "warning",
                    )}</div>
                    <div class="button-row">${button("Kirim request", "create-request")}</div>
                  `
                  : slicing === "done"
                    ? `
                      <div class="summary-list">
                        <div class="summary-row"><span>Berat slicer</span><strong>${state.grams} g</strong></div>
                        <div class="summary-row"><span>Material ${state.material} · progresif</span><strong>${rupiah(totals.material)}</strong></div>
                        <div class="summary-row"><span>Waktu mesin · ${printHours(state.printSeconds).toFixed(2)} jam</span><strong>${rupiah(totals.machine)}</strong></div>
                        <div class="summary-row total"><span>Total akhir</span><strong>${rupiah(totals.total)}</strong></div>
                      </div>
                      <p class="fine-print">Berat dan waktu dari slicer, tanpa pembulatan. Total dibulatkan sekali (half-up) ke rupiah terdekat. Tarif material progresif per policy NIUVA-CP-FDM-001.</p>
                      <div class="button-row">${button("Tambahkan ke keranjang", "add-custom")}</div>
                    `
                    : `<p class="lede">Estimasi baru ditampilkan setelah file valid dan hasil slicing tersedia.</p>`
              }
            </aside>
          </div>
        </div>
        ${
          slicing === "done" && !quote
            ? mobileActionBar("Total Custom Print", rupiah(totals.total), "add-custom", false, "Tambah ke keranjang")
            : ""
        }
      </main>
    `;
  }

  function cartPage() {
    const cartLocked = hasActiveCheckoutAttempt();
    const items = cartLocked ? state.orderSnapshot.items : state.cartItems;
    const mixed = new Set(items.map((item) => item.type)).size > 1;
    const subtotal = cartLocked ? state.orderSnapshot.subtotal : cartSubtotal();
    const cartTotal = cartLocked ? state.orderSnapshot.total : subtotal;
    const cartBarLabel = cartLocked ? "Reservasi aktif" : "Total sementara";
    const cartActionLabel = cartLocked ? "Kembali ke pembayaran" : "Lanjut checkout";
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">${state.reviewMode === "moderator" ? "Candidate route · untuk validasi" : "Retail"}</span>
          <h1 style="font-size:clamp(2rem,4vw,3.5rem)">Keranjang</h1>
          ${moderatorOnly(
            `<p class="lede">Exact cart route belum menjadi keputusan canonical. Gunakan Participant Mode saat peserta menjalankan task.</p>`,
          )}
          ${
            items.length
              ? `
                <div style="margin-top:24px">${notice(
                  cartLocked
                    ? `Keranjang terkunci pada Order ${escapeHtml(state.orderReference)}`
                    : mixed
                      ? "Waktu pemrosesan berbeda"
                      : "Nilai akan diperiksa kembali",
                  cartLocked
                    ? "Order dan payment attempt sudah dibuat. Item dan total mengikuti snapshot Order; kembali ke pembayaran untuk melanjutkan."
                    : mixed
                      ? "Ready Product dan Custom Print memiliki ETA/fulfillment berbeda. Keduanya tetap dapat dilanjutkan dalam checkout simulasi ini."
                      : "Harga, ETA, stok, dan ongkir akan diperiksa kembali sebelum pembayaran.",
                  cartLocked || mixed ? "warning" : "info",
                )}</div>
                <div class="detail-grid section" style="margin-top:28px">
                  <div class="cart-items">
                    ${items
                      .map(
                        (item) => `
                          <article class="card cart-item">
                            <div class="chip-row">
                              ${status(item.type === "ready" ? "Ready Product" : "Custom Print", item.type === "ready" ? "success" : "info")}
                              ${status(item.type === "ready" ? "Stok diperiksa saat checkout" : "ETA terpisah", item.type === "ready" ? "info" : "warning")}
                            </div>
                            <div class="cart-item-heading">
                              <div>
                                <h2>${escapeHtml(item.name)}</h2>
                                <p>${
                                  item.type === "ready"
                                    ? `${escapeHtml(item.variant)} · stok simulasi`
                                    : `${escapeHtml(item.material)} · ${item.grams} g · ${printHours(item.printSeconds).toFixed(2)} jam mesin`
                                }</p>
                              </div>
                              <strong>${rupiah(cartItemSubtotal(item))}</strong>
                            </div>
                            ${
                              item.type === "ready"
                                ? `
                                  <div class="field cart-quantity">
                                    <label for="quantity-${item.id}">Jumlah</label>
                                    <select id="quantity-${item.id}" data-change="cart-quantity" data-item-id="${item.id}"${cartLocked ? " disabled" : ""}>
                                      ${[1, 2, 3, 4]
                                        .map(
                                          (quantity) =>
                                            `<option value="${quantity}" ${item.quantity === quantity ? "selected" : ""}>${quantity}</option>`,
                                        )
                                        .join("")}
                                    </select>
                                  </div>
                                `
                                : ""
                            }
                            ${
                              cartLocked
                                ? ""
                                : `<div class="button-row">
                                    ${
                                      item.type === "custom"
                                        ? link("/retail/products/custom-fdm/configure", "Ubah konfigurasi", "button secondary small")
                                        : link("/retail/products/ready-keychain", "Ubah pilihan", "button secondary small")
                                    }
                                    ${button("Hapus", `remove-cart:${item.id}`, "button secondary small")}
                                  </div>`
                            }
                          </article>
                        `,
                      )
                      .join("")}
                    ${cartLocked ? "" : `<div class="button-row">${link("/retail", "Lanjut belanja", "button secondary")}</div>`}
                  </div>
                  <aside class="layer-card detail-sticky">
                    <span class="card-kicker">Ringkasan</span>
                    <div class="summary-list">
                      <div class="summary-row"><span>Produk</span><strong>${items.length} item</strong></div>
                      <div class="summary-row"><span>Ongkir</span><strong>${cartLocked ? rupiah(state.orderSnapshot.shipping) : "Dihitung di checkout"}</strong></div>
                      <div class="summary-row total"><span>${cartLocked ? "Total Order" : "Total sementara"}</span><strong>${rupiah(cartTotal)}</strong></div>
                    </div>
                    <div class="button-row">${button(cartActionLabel, "go-checkout")}</div>
                  </aside>
                </div>
              `
              : `
                <div class="empty-state section">
                  <div>
                    <h2>Keranjang masih kosong</h2>
                    <p>Pilih produk ready atau siapkan file Custom 3D Print untuk melanjutkan.</p>
                    <div class="button-row" style="justify-content:center">${link("/retail", "Jelajahi katalog", "button")}</div>
                  </div>
                </div>
              `
          }
        </div>
        ${items.length ? mobileActionBar(cartBarLabel, rupiah(cartTotal), "go-checkout", false, cartActionLabel) : ""}
      </main>
    `;
  }

  function authPage(kind) {
    const register = kind === "register";
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page">
          <div class="auth-wrap">
            <section class="auth-aside">
              <span class="eyebrow" style="color:var(--frost)">Akun pelanggan</span>
              <h1 style="font-size:clamp(2.2rem,5vw,4.2rem)">${register ? "Satu akun untuk order dan tracking." : "Lanjutkan dari tempat terakhir."}</h1>
              <p>Login wajib sebelum checkout. Status pembayaran, produksi, pickup/delivery, dan after-sales tersimpan di akun pelanggan.</p>
            </section>
            <section class="auth-form" aria-labelledby="auth-title">
              <span class="card-kicker">${register ? "Buat akun" : "Masuk"}</span>
              <h2 id="auth-title">${register ? "Daftar sebagai pelanggan" : "Selamat datang kembali"}</h2>
              ${
                register
                  ? `<div style="margin-top:18px">${notice("Pendaftaran prototipe", "Data pada form ini hanya digunakan di tab browser dan tidak dikirim ke server.", "info")}${moderatorOnly(
                      notice("Activation gate", "Verifikasi akun dan anti-abuse belum diaktifkan pada prototipe.", "warning"),
                    )}</div>`
                  : ""
              }
              <form data-form="auth">
                ${
                  register
                    ? `<div class="field"><label for="name">Nama</label><input id="name" autocomplete="name" value="Ayu Demo" required /></div>`
                    : ""
                }
                <div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email" value="demo@contoh.test" required /></div>
                <div class="field"><label for="password">Password</label><input id="password" type="password" autocomplete="${register ? "new-password" : "current-password"}" value="prototype-only" required /></div>
                <button class="button" type="submit">${register ? "Buat akun" : "Masuk"}</button>
              </form>
              <p class="fine-print">
                ${register ? `Sudah punya akun? ${link("/login", "Masuk")}` : `Belum punya akun? ${link("/register", "Daftar")}`}
              </p>
            </section>
          </div>
        </div>
      </main>
    `;
  }

  function checkoutAuthGate() {
    state.returnTo = "/retail/checkout";
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <div class="empty-state">
            <div>
              <span class="eyebrow">Akun diperlukan</span>
              <h1 style="font-size:clamp(2rem,4vw,3.5rem);margin:0 auto">Masuk sebelum checkout</h1>
              <p>Keranjang tetap tersedia di tab ini. Masuk untuk melanjutkan ke konfirmasi dan pembayaran simulasi.</p>
              <div class="button-row" style="justify-content:center">
                ${link("/login", "Masuk", "button")}
                ${link("/retail/cart", "Kembali ke keranjang", "button secondary")}
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  function checkoutPage() {
    const preview = state.checkoutState === "preview";
    const expired = state.checkoutState === "expired";
    const stale = state.checkoutState === "stale";
    const warning = state.checkoutState === "warning";
    const hasAttempt = !!state.paymentAttemptReference;

    // Preview: calculate from live cart. After confirm: read from immutable snapshot.
    const liveSubtotal = cartSubtotal();
    const liveShipping = state.fulfillmentMode === "pickup" ? 0 : DELIVERY_SHIPPING;
    const snapshot = state.orderSnapshot;
    const subtotal = preview ? liveSubtotal : (snapshot ? snapshot.subtotal : liveSubtotal);
    const shipping = preview ? liveShipping : (snapshot ? snapshot.shipping : liveShipping);
    const total = subtotal + shipping + (stale ? 2000 : 0);

    if (!state.cartItems.length) {
      return `
        <main id="main-content" class="main" tabindex="-1">
          <div class="page compact">
            <div class="empty-state">
              <div>
                <span class="eyebrow">Checkout</span>
                <h1 style="font-size:clamp(2rem,4vw,3.5rem);margin:0 auto">Belum ada item untuk dibayar</h1>
                <p>Keranjang tidak diisi secara otomatis. Kembali ke katalog untuk memilih produk.</p>
                <div class="button-row" style="justify-content:center">${link("/retail", "Buka katalog", "button")}</div>
              </div>
            </div>
          </div>
        </main>
      `;
    }

    const displayItems = preview ? state.cartItems : (snapshot ? snapshot.items : state.cartItems);

    // State-specific notice, button label, mobile CTA label, and action
    let noticeHtml, primaryLabel, primaryAction, mobileCTALabel;
    if (stale) {
      noticeHtml = notice("Harga, ETA, atau tarif berubah", "Tinjau nilai terbaru dan berikan konfirmasi ulang sebelum melanjutkan.", "warning");
      primaryLabel = "Setujui nilai terbaru";
      primaryAction = "accept-stale";
      mobileCTALabel = "Setujui perubahan";
    } else if (expired) {
      noticeHtml = notice("Reservasi 30 menit telah berakhir", "Stok dan slot produksi dilepas. Periksa ulang ketersediaan untuk membuat attempt baru.", "danger");
      primaryLabel = "Periksa ulang ketersediaan";
      primaryAction = "refresh-checkout";
      mobileCTALabel = "Periksa ulang";
    } else if (warning) {
      noticeHtml = notice("Sisa reservasi 5 menit", "Selesaikan pembayaran atau data akan diperiksa ulang.", "warning");
      primaryLabel = "Bayar sekarang";
      primaryAction = "pay";
      mobileCTALabel = "Bayar sekarang";
    } else if (preview) {
      noticeHtml = notice("Belum ada reservasi", "Stok dan slot produksi belum ditahan. Tinjau pesanan, lalu konfirmasi untuk membuat Order dan memulai reservasi 30 menit.", "info");
      primaryLabel = "Konfirmasi \u0026 buat pesanan";
      primaryAction = "confirm-order";
      mobileCTALabel = "Konfirmasi pesanan";
    } else {
      // fresh: reservation active, order created
      noticeHtml = notice("Reservasi aktif 30 menit", "Stok/slot simulasi ditahan setelah Order dan payment attempt dibuat. Selesaikan pembayaran dalam waktu tersisa.", "info");
      primaryLabel = "Bayar sekarang";
      primaryAction = "pay";
      mobileCTALabel = "Bayar sekarang";
    }

    // Fulfillment is immutable after confirm (not preview)
    const fulfillmentEditable = preview;
    const activeAttempt = hasActiveCheckoutAttempt();
    const checkoutBackLabel = activeAttempt ? "← Lihat keranjang terkunci" : "← Kembali ke keranjang";
    const fulfillmentLockCopy = activeAttempt
      ? "Metode pengiriman mengikuti snapshot Order. Lihat keranjang terkunci atau selesaikan payment attempt aktif."
      : "Metode pengiriman mengikuti snapshot Order. Periksa ulang ketersediaan sebelum membuat payment attempt baru.";

    // Stepper: preview has Checkout current, post-confirm has Pembayaran current
    const stepperCheckout = preview ? "current" : "done";
    const stepperPayment = preview ? "" : "current";

    // Kicker
    const kickerText = preview
      ? "Pratinjau \u00b7 belum ada reservasi"
      : expired
        ? "Reservasi \u00b7 habis"
        : `Reservasi \u00b7 ${state.reservationMinutes} menit`;

    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">${state.reviewMode === "moderator" ? "Checkout \u00b7 provider-neutral" : "Checkout"}</span>
          <h1 style="font-size:clamp(2rem,4vw,3.5rem)">${preview ? "Tinjau pesanan sebelum konfirmasi" : "Konfirmasi sebelum pembayaran"}</h1>
          <div class="back-link">${link("/retail/cart", checkoutBackLabel)}</div>
          <ol class="stepper">
            <li class="done">Keranjang</li><li class="done">Akun</li><li class="${stepperCheckout}"${stepperCheckout === "current" ? ' aria-current="step"' : ""}>Checkout</li><li class="${stepperPayment}"${stepperPayment === "current" ? ' aria-current="step"' : ""}>Pembayaran</li>
          </ol>
          ${noticeHtml}
          <div class="detail-grid" style="margin-top:22px">
            <section class="layer-card" aria-labelledby="checkout-items-title">
              <h2 id="checkout-items-title">Item yang akan dibayar</h2>
              <div class="data-list" style="margin-top:16px">
                ${displayItems
                  .map(
                    (item) =>
                      "<div class=\"data-row checkout-line\">" +
                      "<span><strong>" + escapeHtml(orderLineTitle(item)) + "</strong>" +
                      "<small>" + escapeHtml(orderLineDetail(item)) + "</small></span>" +
                      "<strong>" + rupiah(cartItemSubtotal(item)) + "</strong>" +
                      "</div>",
                  )
                  .join("")}
              </div>
              <h3 id="delivery-title" style="margin-top:28px">Fulfillment</h3>
              <div class="field-grid" style="margin-top:20px">
                <div class="field full">
                  <label for="fulfillment">Metode</label>
                  <select id="fulfillment" data-change="fulfillment"${fulfillmentEditable ? "" : " disabled"}>
                    <option value="delivery" ${state.fulfillmentMode === "delivery" ? "selected" : ""}>Pengiriman \u00b7 ongkir otomatis</option>
                    <option value="pickup" ${state.fulfillmentMode === "pickup" ? "selected" : ""}>Pickup di Niuva \u00b7 Rp0</option>
                  </select>
                </div>
                <div class="field">
                  <label for="city">Kota</label><input id="city" value="Bandung"${fulfillmentEditable ? "" : " disabled"} />
                </div>
                <div class="field">
                  <label for="postal">Kode pos</label><input id="postal" inputmode="numeric" value="40123"${fulfillmentEditable ? "" : " disabled"} />
                </div>
                <div class="field full">
                  <label for="address">Alamat</label><textarea id="address"${fulfillmentEditable ? "" : " disabled"}>Alamat simulasi \u2014 tidak disimpan</textarea>
                </div>
              </div>
              <div style="margin-top:18px">${
                state.fulfillmentMode === "pickup"
                  ? notice("Pickup dipilih", "Tidak ada ongkir. Lokasi dan waktu pickup tetap berupa data prototipe.", "info")
                  : notice("Logistik belum dipilih", "Ongkir otomatis disimulasikan tanpa menyebut atau mengaktifkan penyedia.", "info")
              }</div>
              ${!fulfillmentEditable ? "<div style=\"margin-top:12px\">" + notice("Fulfillment dikunci", fulfillmentLockCopy, "info") + "</div>" : ""}
            </section>
            <aside class="layer-card detail-sticky">
              <span class="card-kicker">${kickerText}</span>
              <div class="summary-list">
                <div class="summary-row"><span>Subtotal simulasi</span><strong>${rupiah(subtotal)}</strong></div>
                <div class="summary-row"><span>Ongkir simulasi</span><strong>${rupiah(shipping)}</strong></div>
                <div class="summary-row"><span>Komponen termasuk</span><strong>QC &amp; finishing dasar</strong></div>
                <div class="summary-row total"><span>Total</span><strong>${rupiah(total)}</strong></div>
              </div>
              <p class="fine-print">${preview ? "Nominal contoh. Order dan reservasi belum dibuat." : "Nominal dari snapshot pesanan. Bukan transaksi aktif."}</p>
              <div class="button-row">
                ${button(primaryLabel, primaryAction)}
              </div>
            </aside>
          </div>
        </div>
        ${mobileActionBar(
          preview ? "Total pratinjau" : "Total pembayaran",
          rupiah(total),
          primaryAction,
          false,
          mobileCTALabel,
        )}
      </main>
    `;
  }

  function orderRefFromPath(path = window.location.pathname) {
    const match = /^\/orders\/([^/]+)(?:\/|$)/.exec(path);
    if (!match) return "";
    try {
      const reference = decodeURIComponent(match[1]);
      return /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(reference) ? reference : "";
    } catch {
      return "";
    }
  }

  // A direct/deep Order URL owns the displayed reference. Persisting it keeps
  // dashboard and after-sales links on the same Order after client navigation.
  function activeOrderRef() {
    return orderRefFromPath() || state.orderReference || "NV-DEMO-014";
  }

  function customerDashboard() {
    const orderSnapshot = activeOrderSnapshot();
    const orderType =
      orderSnapshot.items.length > 1
        ? "Mixed Retail Order"
        : orderSnapshot.items[0]?.type === "ready"
          ? "Ready Product"
          : "Custom 3D Print";
    const orderNames = orderSnapshot.items.map((item) => item.name).join(" + ");
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <div class="section-heading">
            <div><span class="eyebrow">Akun pelanggan</span><h1 style="font-size:clamp(2rem,4vw,3.5rem)">Halo, Ayu</h1></div>
            ${link("/dashboard/notifications", "Notifikasi", "button secondary")}
          </div>
          <div class="progress-rail">
            <strong>Next action: pantau hasil printing</strong>
            <span>Order ${activeOrderRef()} sedang dicetak. ETA simulasi 2 Agustus 2026.</span>
          </div>
          <section class="section" style="margin-top:28px">
            <div class="section-heading"><h2>Order aktif</h2></div>
            <div class="card-grid two">
              <article class="card">
                <div class="chip-row">${status("Printing", "info")}${status("Sudah dibayar", "success")}</div>
                <h3 style="margin-top:14px">${activeOrderRef()} · ${orderType}</h3>
                <p>${escapeHtml(orderNames)} · ETA 2 Agustus 2026</p>
                <div class="button-row">${link("/orders/" + activeOrderRef(), "Lihat tracking", "button")}</div>
              </article>
              <article class="card">
                <div class="chip-row">${status("Offer tersedia", "warning")}</div>
                <h3 style="margin-top:14px">OFF-DEMO-01 · Request nonstandar</h3>
                <p>Offer perlu diputuskan sebelum masa berlakunya berakhir.</p>
                <div class="button-row">${link("/retail/offers/OFF-DEMO-01", "Tinjau offer", "button secondary")}</div>
              </article>
            </div>
          </section>
        </div>
      </main>
    `;
  }

  function notificationsPage() {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">Akun pelanggan</span>
          <h1 style="font-size:clamp(2rem,4vw,3.5rem)">Notifikasi</h1>
          <div class="section" style="margin-top:28px">
            <article class="card">
              <div class="chip-row">${status("Baru", "info")}<span class="fine-print">31 Juli 2026 · simulasi</span></div>
              <h3 style="margin-top:12px">Order masuk tahap Printing</h3>
              <p>${activeOrderRef()} sedang dikerjakan. ETA saat ini 2 Agustus 2026.</p>
              <div class="button-row">${link("/orders/" + activeOrderRef(), "Buka order", "button secondary")}</div>
            </article>
            <article class="card" style="margin-top:12px">
              <div class="chip-row">${status("Dibaca", "success")}<span class="fine-print">30 Juli 2026 · simulasi</span></div>
              <h3 style="margin-top:12px">Pembayaran dikonfirmasi</h3>
              <p>Order sudah masuk antrean pemeriksaan file.</p>
            </article>
          </div>
        </div>
      </main>
    `;
  }

  function requestPage() {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">Assisted Retail Request</span>
          <h1 style="font-size:clamp(2rem,4vw,3.5rem)">REQ-DEMO-01</h1>
          <p class="lede">Request dibuat karena kombinasi file/produksi tidak dapat dihargai otomatis.</p>
          <div class="detail-grid section" style="margin-top:28px">
            <section class="layer-card">
              <div class="chip-row">${status("Sedang ditinjau", "warning")}${status("Belum menjadi order", "info")}</div>
              <div class="data-list">
                <div class="data-row"><span>File</span><strong>assembly-large.3mf</strong></div>
                <div class="data-row"><span>Material diminta</span><strong>PLA · multicolor</strong></div>
                <div class="data-row"><span>Alasan routing</span><strong>Kombinasi nonstandar</strong></div>
                <div class="data-row"><span>Pembayaran</span><strong>Belum diminta</strong></div>
              </div>
            </section>
            <aside class="layer-card">
              <span class="card-kicker">Apa berikutnya?</span>
              <h2>Operator menyiapkan offer</h2>
              <p class="lede">Pelanggan akan menerima harga, ETA, dan masa berlaku. Menerima offer mengarah ke checkout normal.</p>
              <div class="button-row">${link("/retail/offers/OFF-DEMO-01", "Lihat contoh offer", "button secondary")}</div>
            </aside>
          </div>
        </div>
      </main>
    `;
  }

  function offerPage() {
    const current = state.offerStatus;
    const tone = current === "accepted" ? "success" : current === "offered" ? "warning" : "danger";
    const labels = {
      offered: "Menunggu keputusan",
      accepted: "Diterima",
      declined: "Ditolak",
      expired: "Kedaluwarsa",
      superseded: "Diganti offer baru",
    };
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">Assisted Retail Offer</span>
          <h1 style="font-size:clamp(2rem,4vw,3.5rem)">OFF-DEMO-01</h1>
          <div style="margin-top:20px">${notice(
            labels[current],
            current === "accepted"
              ? "Penerimaan offer belum membuat order. Pelanggan tetap harus menyelesaikan checkout dan pembayaran."
              : current === "offered"
                ? "Tinjau ruang lingkup, harga simulasi, ETA, dan masa berlaku sebelum memutuskan."
                : current === "superseded"
                  ? "Offer ini read-only. Gunakan offer pengganti yang terbaru."
                  : "Offer ini tidak dapat digunakan untuk checkout.",
            tone,
          )}</div>
          <div class="detail-grid" style="margin-top:22px">
            <section class="layer-card">
              <h2>Ringkasan offer</h2>
              <div class="data-list">
                <div class="data-row"><span>Request</span><strong>REQ-DEMO-01</strong></div>
                <div class="data-row"><span>Scope</span><strong>Custom FDM nonstandar</strong></div>
                <div class="data-row"><span>Harga contoh</span><strong>Rp185.000</strong></div>
                <div class="data-row"><span>ETA contoh</span><strong>4–6 hari kerja</strong></div>
                <div class="data-row"><span>Berlaku sampai</span><strong>2 Agustus 2026</strong></div>
              </div>
              <p class="fine-print">Semua nilai pada halaman ini adalah data simulasi, bukan penawaran aktif.</p>
            </section>
            <aside class="layer-card">
              <span class="card-kicker">Keputusan pelanggan</span>
              <h2>${labels[current]}</h2>
              <div class="button-row">
                ${
                  current === "offered"
                    ? `${button("Terima dan lanjut checkout", "accept-offer")}${button("Tolak offer", "decline-offer", "button secondary")}`
                    : current === "accepted"
                      ? button("Lanjut checkout", "go-checkout")
                      : link("/retail/requests/REQ-DEMO-01", "Kembali ke request", "button secondary")
                }
              </div>
            </aside>
          </div>
        </div>
      </main>
    `;
  }

  const milestones = [
    "Pembayaran dikonfirmasi",
    "Pemeriksaan file",
    "Antrean produksi",
    "Printing",
    "Post-processing",
    "QC",
    "Siap diambil/dikirim",
    "Selesai",
  ];

  function orderPage() {
    const orderSnapshot = activeOrderSnapshot();
    const activeCase = state.complaintCase;
    const orderIndex =
      state.orderState === "revision"
        ? 1
        : state.orderState === "overdue"
          ? 3
          : state.orderState === "pickup" || state.orderState === "delivery"
            ? 6
          : state.orderState === "complete"
            ? 7
            : 3;
    const overdue = state.orderState === "overdue";
    const revision = state.orderState === "revision";
    const pickup = state.orderState === "pickup";
    const delivery = state.orderState === "delivery";
    const received = state.orderState === "complete";
    const orderLabel = revision
      ? "Menunggu revisi file"
      : overdue
        ? "ETA berubah"
        : pickup
          ? "Siap diambil"
          : delivery
            ? "Dalam pengiriman"
            : received
              ? "Selesai · diterima"
              : state.revisionSubmitted
                ? `Revisi v${state.revisionVersion} diterima`
                : "Printing";
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <div class="section-heading">
            <div>
              <span class="eyebrow">Pelacakan pesanan</span>
              <h1 style="font-size:clamp(2rem,4vw,3.5rem)">${activeOrderRef()}</h1>
            </div>
            <div class="chip-row">${status(orderLabel, revision || overdue ? "warning" : pickup || delivery || received ? "success" : "info")}${status("Lunas", "success")}</div>
          </div>
          ${
            revision
              ? notice("Tindakan pelanggan diperlukan", `Unggah revisi file paling lambat ${REVISION_DUE_LABEL} agar jadwal dapat dihitung ulang.`, "warning")
              : state.revisionSubmitted
                ? notice("Revisi file diterima", `Versi ${state.revisionVersion} tercatat sebagai file produksi baru. Versi sebelumnya tetap berada dalam histori.`, "success")
              : overdue
                ? notice("ETA diperbarui", "Printing memerlukan waktu lebih lama. ETA berubah dari 2 menjadi 3 Agustus 2026. Tidak ada persentase progres palsu.", "warning")
                : pickup
                  ? notice("Siap diambil", "Pesanan telah lolos QC dan siap diambil. Detail lokasi/waktu pickup ditampilkan tanpa data internal.", "success")
                  : delivery
                    ? notice("Pesanan sedang dikirim", "Status pengiriman dan nomor tracking customer-safe tersedia. Penyedia tetap netral pada prototipe.", "success")
                    : received
                      ? notice("Pesanan telah diterima", "Masa pengajuan komplain simulasi sedang aktif. Bukti yang dikirim tetap privat.", "success")
                    : notice("Sedang dicetak", "Tahap berikutnya adalah post-processing. ETA simulasi 2 Agustus 2026.", "info")
          }
          <div class="detail-grid" style="margin-top:22px">
            <section class="layer-card">
              <h2>Milestone produksi</h2>
              <ol class="timeline">
                ${milestones
                  .map(
                    (label, index) => `
                      <li class="timeline-item ${index < orderIndex ? "done" : index === orderIndex ? "current" : ""}">
                        <span class="timeline-dot" aria-hidden="true"></span>
                        <div>
                          <h3>${label}</h3>
                          <p>${
                            index < orderIndex
                              ? "Selesai · waktu simulasi tercatat"
                              : index === orderIndex
                                ? revision
                                  ? "Tertahan sampai revisi diterima"
                                  : "Status saat ini"
                                : "Belum dimulai"
                          }</p>
                        </div>
                      </li>
                    `,
                  )
                  .join("")}
              </ol>
            </section>
            <aside>
              <div class="context-card">
                <span class="card-kicker">Customer-safe detail</span>
                <h2>Ringkasan</h2>
                <div class="data-list">
                  ${orderSnapshot.items
                    .map(
                      (item) => `
                        <div class="data-row">
                          <span>${escapeHtml(orderLineTitle(item))}</span>
                          <strong>${escapeHtml(orderLineDetail(item))}${item.type === "custom" ? ` · v${state.revisionVersion}` : ""}</strong>
                        </div>
                      `,
                    )
                    .join("")}
                  <div class="data-row"><span>Fulfillment</span><strong>${escapeHtml(orderSnapshot.fulfillment)}</strong></div>
                  <div class="data-row"><span>Total dibayar</span><strong>${rupiah(orderSnapshot.total)}</strong></div>
                  <div class="data-row"><span>ETA saat ini</span><strong>${overdue ? "3 Agustus 2026" : "2 Agustus 2026"}</strong></div>
                </div>
              </div>
              <div class="context-card">
                <h3>Butuh tindakan?</h3>
                <p>${
                  received && activeCase
                    ? `Komplain ${activeCase.id} sedang ditinjau. Buka kasus yang sama untuk melihat status terbaru.`
                    : received
                      ? "Jika hasil yang diterima bermasalah, ajukan komplain dari Order ini."
                    : "Komplain hasil cetak baru tersedia setelah penerimaan tercatat. Pembatalan tetap berupa permintaan review."
                }</p>
                <div class="button-row">
                  ${revision ? link("/orders/" + activeOrderRef() + "/file-revision", "Kirim revisi", "button") : ""}
                  ${!received ? link("/orders/" + activeOrderRef() + "/cancellation", "Minta pembatalan", "button secondary") : ""}
                  ${
                    received && activeCase
                      ? link(`/orders/${activeOrderRef()}/complaints/${activeCase.id}`, `Lihat status ${activeCase.id}`, "button")
                      : received
                        ? link("/orders/" + activeOrderRef() + "/complaints/new", "Ajukan komplain", "button")
                        : ""
                  }
                </div>
                ${moderatorOnly(
                  `<p class="fine-print">After-sales routes tetap candidate; Participant Mode menyembunyikan governance note ini.</p>`,
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    `;
  }

  function afterSalesPage(kind) {
    const revision = kind === "revision";
    const cancellation = kind === "cancellation";
    const complaintEligible = state.orderState === "complete";
    const heading = revision
      ? "Kirim revisi file"
      : cancellation
        ? "Minta pembatalan"
        : "Ajukan komplain";
    const formKind = revision ? "revision" : cancellation ? "cancellation" : "complaint";
    if (!revision && !cancellation && !complaintEligible) {
      return `
        <main id="main-content" class="main" tabindex="-1">
          <div class="page compact">
            <div class="empty-state">
              <div>
                <span class="eyebrow">After-sales</span>
                <h1 style="font-size:clamp(2rem,4vw,3.5rem);margin:0 auto">Komplain belum dapat diajukan</h1>
                <p>Pesanan belum tercatat diterima. Komplain hasil cetak tersedia setelah pengiriman atau pickup selesai dan masa pengajuan aktif.</p>
                <div class="button-row" style="justify-content:center">${link("/orders/" + activeOrderRef(), "Kembali ke Order", "button")}</div>
                ${moderatorOnly(
                  `<p class="fine-print">Lifecycle gate ini mencegah participant menguji intake pada status Printing atau Dalam pengiriman.</p>`,
                )}
              </div>
            </div>
          </div>
        </main>
      `;
    }
    if (!revision && !cancellation && state.complaintCase) {
      return `
        <main id="main-content" class="main" tabindex="-1">
          <div class="page compact">
            <div class="empty-state">
              <div>
                <span class="eyebrow">After-sales case</span>
                <h1 style="font-size:clamp(2rem,4vw,3.5rem);margin:0 auto">Komplain sudah tercatat</h1>
                <p>${escapeHtml(state.complaintCase.id)} masih aktif. Buka kasus yang sama untuk melihat status atau permintaan informasi terbaru.</p>
                <div class="button-row" style="justify-content:center">
                  ${link(`/orders/${activeOrderRef()}/complaints/${state.complaintCase.id}`, `Lihat status ${state.complaintCase.id}`, "button")}
                  ${link("/orders/" + activeOrderRef(), "Kembali ke Order", "button secondary")}
                </div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">${state.reviewMode === "moderator" ? "Candidate route · after-sales" : "Order " + activeOrderRef()}</span>
          <h1 style="font-size:clamp(2rem,4vw,3.5rem)">${heading}</h1>
          ${moderatorOnly(
            `<p class="lede">Exact customer after-sales route belum canonical. Gunakan Participant Mode untuk menjalankan task.</p>`,
          )}
          ${
            revision
              ? `<div style="margin-top:20px">${notice(
                  "Batas pengiriman revisi",
                  `Kirim file pengganti paling lambat ${REVISION_DUE_LABEL}. File lama tetap tersimpan sebagai versi ${state.revisionVersion}.`,
                  "warning",
                )}</div>`
              : ""
          }
          ${
            cancellation
              ? `<div style="margin-top:20px">${notice(
                  state.cancellationSubmitted ? "Permintaan tercatat" : "Printing sudah dimulai",
                  state.cancellationSubmitted
                    ? "Operator akan meninjau pekerjaan yang sudah dilakukan. Refund tidak dibuat otomatis."
                    : "Pembatalan dan refund tidak otomatis karena proses produksi sudah dimulai. Kirim alasan untuk peninjauan manual.",
                  state.cancellationSubmitted ? "success" : "warning",
                )}</div>`
              : ""
          }
          <div class="detail-grid section" style="margin-top:28px">
            <form class="layer-card" data-form="${formKind}">
              <h2>${revision ? "File pengganti" : cancellation ? "Alasan permintaan" : "Detail masalah"}</h2>
              ${
                revision
                  ? `
                    <div class="field" style="margin-top:18px">
                      <label for="revision-file">File pengganti STL atau 3MF</label>
                      <input id="revision-file" type="file" accept=".stl,.3mf" required aria-describedby="revision-file-hint" />
                      <p class="field-hint" id="revision-file-hint">File dipakai hanya untuk menguji pemilihan dan tidak dibaca atau dikirim. Pengiriman membuat versi ${state.revisionVersion + 1}; versi ${state.revisionVersion} tetap berada dalam histori.</p>
                      <p class="field-confirmation" id="revision-file-selection" role="status"></p>
                    </div>
                    <div class="data-list" style="margin-top:18px">
                      <div class="data-row"><span>Deadline</span><strong>${REVISION_DUE_LABEL}</strong></div>
                      <div class="data-row"><span>Versi aktif</span><strong>v${state.revisionVersion}</strong></div>
                      <div class="data-row"><span>Versi setelah dikirim</span><strong>v${state.revisionVersion + 1}</strong></div>
                    </div>
                  `
                  : cancellation
                    ? `
                      <div class="field" style="margin-top:18px">
                        <label for="cancellation-reason">Alasan pembatalan</label>
                        <textarea id="cancellation-reason" required ${state.cancellationSubmitted ? "disabled" : ""}>Kebutuhan berubah dan saya ingin mengetahui opsi yang tersedia.</textarea>
                      </div>
                    `
                    : `
                    <div class="field" style="margin-top:18px">
                      <label for="issue">Jenis masalah</label>
                      <select id="issue"><option>Hasil cetak tidak sesuai</option><option>Rusak saat diterima</option><option>Masalah lain</option></select>
                    </div>
                    <div class="field" style="margin-top:14px">
                      <label for="evidence">Penjelasan masalah</label>
                      <textarea id="evidence" required>Contoh deskripsi simulasi untuk validasi alur.</textarea>
                    </div>
                    <div class="field" style="margin-top:14px">
                      <label for="complaint-evidence">Foto atau video bukti <span class="fine-print">(opsional, privat)</span></label>
                      <input id="complaint-evidence" type="file" accept="image/*,video/*" multiple />
                      <p class="field-hint">
                        Untuk sesi ini gunakan file simulasi tanpa data pribadi. Prototipe hanya menyimpan jumlah file di tab browser, bukan isi atau nama file.
                      </p>
                      ${
                        state.complaintEvidenceCount
                          ? `<p class="field-confirmation">${state.complaintEvidenceCount} bukti simulasi dipilih.</p>`
                          : ""
                      }
                    </div>
                  `
              }
              <div class="button-row">
                <button class="button" type="submit" ${cancellation && state.cancellationSubmitted ? "disabled" : ""}>
                  ${revision ? "Kirim revisi" : cancellation ? state.cancellationSubmitted ? "Permintaan sudah dikirim" : "Kirim permintaan" : "Kirim komplain"}
                </button>
                ${link("/orders/" + activeOrderRef(), cancellation ? "Kembali ke Order" : "Batal", "button secondary")}
              </div>
            </form>
            <aside class="layer-card">
              <span class="card-kicker">Kebijakan pada prototipe</span>
              <ul class="check-list">
                <li>${revision ? "Histori file dan status tidak ditimpa" : "Permintaan dan bukti disimpan sebagai histori"}</li>
                <li>${cancellation ? "Tahap produksi menentukan jenis peninjauan" : "Operator meninjau bukti sebelum keputusan"}</li>
                <li>Reprint/refund memerlukan approval terpisah</li>
                <li class="pending">Finance mengeksekusi refund setelah approval; tidak otomatis</li>
              </ul>
            </aside>
          </div>
        </div>
      </main>
    `;
  }

  function afterSalesCasePage() {
    const caseData = state.complaintCase;
    if (!caseData) {
      return `
        <main id="main-content" class="main" tabindex="-1">
          <div class="page compact">
            <div class="empty-state">
              <div>
                <span class="eyebrow">After-sales case</span>
                <h1 style="font-size:clamp(2rem,4vw,3.5rem);margin:0 auto">Kasus belum tersedia</h1>
                <p>Belum ada komplain simulasi yang dikirim pada sesi browser ini.</p>
                <div class="button-row" style="justify-content:center">${link("/orders/" + activeOrderRef(), "Kembali ke Order", "button")}</div>
              </div>
            </div>
          </div>
        </main>
      `;
    }
    const hasEvidence = caseData.evidenceCount > 0;
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <span class="eyebrow">${state.reviewMode === "moderator" ? "Candidate route · owned case" : "After-sales case"}</span>
          <div class="section-heading">
            <div>
              <h1 style="font-size:clamp(2rem,4vw,3.5rem)">CASE-DEMO-01</h1>
              <p class="lede">Status komplain dan tindak lanjut customer-safe pada route yang dapat dibuka kembali dari Order.</p>
            </div>
            <div class="chip-row">${status("Sedang ditinjau", "warning")}${status(hasEvidence ? "Bukti diterima" : "Penjelasan diterima", "success")}</div>
          </div>
          <div class="detail-grid" style="margin-top:24px">
            <section class="layer-card">
              <h2>Riwayat kasus</h2>
              <ol class="timeline">
                <li class="timeline-item done"><span class="timeline-dot" aria-hidden="true"></span><div><h3>Komplain diterima</h3><p>31 Juli 2026 · waktu simulasi</p></div></li>
                <li class="timeline-item done"><span class="timeline-dot" aria-hidden="true"></span><div><h3>${hasEvidence ? "Bukti tersedia" : "Penjelasan tersedia"}</h3><p>${
                  hasEvidence
                    ? `${caseData.evidenceCount} bukti simulasi dan deskripsi tercatat privat.`
                    : "Deskripsi masalah tercatat; tidak ada foto atau video yang dikirim."
                }</p></div></li>
                <li class="timeline-item current"><span class="timeline-dot" aria-hidden="true"></span><div><h3>Peninjauan operator</h3><p>Target respons manusia: paling lambat satu hari kerja.</p></div></li>
                <li class="timeline-item"><span class="timeline-dot" aria-hidden="true"></span><div><h3>Keputusan remedy</h3><p>Refund atau reprint tetap memerlukan approval manager.</p></div></li>
              </ol>
            </section>
            <aside>
              <div class="context-card">
                <span class="card-kicker">Langkah berikutnya</span>
                <h2>Tunggu hasil peninjauan</h2>
                <p>Tidak ada tindakan tambahan saat ini. Jika bukti kurang, permintaan informasi akan tampil di route yang sama.</p>
              </div>
              <div class="context-card">
                <h3>Batas informasi pelanggan</h3>
                <p>Biaya internal, margin, supplier, provider payload, dan private notes tidak ditampilkan.</p>
                <div class="button-row">${link("/orders/" + activeOrderRef(), "Kembali ke order", "button secondary")}</div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    `;
  }

  const adminNav = (path) => `
    <aside class="admin-sidebar ${state.adminMenuOpen ? "open" : ""}" aria-label="Navigasi operator">
      <nav class="admin-nav">
        <span class="admin-nav-group">Workspace</span>
        ${adminLink("/admin", "Next actions", "4", path)}
        ${adminLink("/admin/content", "Content & portfolio", "", path)}
        ${adminLink("/admin/catalog", "Catalog & stok", "2", path)}
        <span class="admin-nav-group">Retail operations</span>
        ${adminLink("/admin/retail-requests", "Requests & offers", "3", path)}
        ${adminLink("/admin/retail-orders", "Order & produksi", "5", path)}
        ${adminLink("/admin/retail-cases", "After-sales", "1", path)}
        <span class="admin-nav-group">Legacy</span>
        ${adminLink("/admin/orders", "Order lama · baca", "", path)}
      </nav>
    </aside>
  `;

  function adminLink(href, label, count, path) {
    return `<a href="${href}" data-route="${href}" ${path === href || (href !== "/admin" && path.startsWith(`${href}/`)) ? 'aria-current="page"' : ""}>
      <span>${label}</span>${count ? `<span class="admin-count">${count}</span>` : ""}
    </a>`;
  }

  function adminLayout(path, title, description, content, actions = "") {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="admin-shell">
          ${adminNav(path)}
          <section class="admin-content">
            <div class="admin-heading">
              <div>
                <button type="button" class="button secondary small mobile-only" data-action="toggle-admin-menu" aria-expanded="${state.adminMenuOpen}">Menu operator</button>
                <span class="eyebrow">Operator workspace</span>
                <h1>${title}</h1>
                <p>${description}</p>
              </div>
              <div class="button-row" style="margin-top:0">${actions}</div>
            </div>
            ${content}
          </section>
        </div>
      </main>
    `;
  }

  function adminDashboard(path) {
    const errorBlock =
      state.scenario === "backend-down"
        ? `<div style="margin-bottom:16px">${notice("Data terbaru tidak dapat dimuat", "Tampilan tidak mengubah status menjadi kosong. Coba lagi; perubahan terakhir tetap belum dikirim.", "danger")}</div>`
        : "";
    return adminLayout(
      path,
      "Yang perlu dikerjakan",
      "Satu operator dapat berpindah area tanpa kehilangan konteks. Urutan berbasis urgensi dan next action, bukan grid KPI.",
      `
        ${errorBlock}
        <div class="next-action">
          <span class="next-number">01</span>
          <div><strong>Periksa file REQ-DEMO-01</strong><p>Request quote_required · pelanggan menunggu offer</p></div>
          ${link("/admin/retail-requests/REQ-DEMO-01", "Buka request", "button small")}
        </div>
        <div class="next-action">
          <span class="next-number">02</span>
          <div><strong>Perbarui milestone NV-DEMO-014</strong><p>Printing aktif · ETA perlu dikonfirmasi</p></div>
          ${link("/admin/retail-orders/NV-DEMO-014", "Buka order", "button small")}
        </div>
        ${
          state.complaintCase
            ? `<div class="next-action">
                <span class="next-number">03</span>
                <div><strong>Tinjau ${escapeHtml(state.complaintCase.id)}</strong><p>Bukti komplain lengkap · menunggu keputusan</p></div>
                ${link(`/admin/retail-cases/${state.complaintCase.id}`, "Buka kasus", "button small")}
              </div>`
            : `<div class="next-action">
                <span class="next-number">03</span>
                <div><strong>Periksa antrean after-sales</strong><p>Belum ada case aktif yang ditugaskan pada sesi ini</p></div>
                ${link("/admin/retail-cases", "Buka antrean", "button small")}
              </div>`
        }
        <div class="next-action">
          <span class="next-number">04</span>
          <div><strong>Stok Keychain Layer menipis</strong><p>2 item tersisa · batas minimum 3</p></div>
          ${link("/admin/catalog", "Buka stok", "button small")}
        </div>
      `,
      button("Simulasikan refresh", "admin-refresh", "button secondary small"),
    );
  }

  function adminContent(path) {
    return adminLayout(
      path,
      "Content & portfolio",
      "Alur publikasi langsung untuk satu pengelola non-IT. Preview dan status tetap terlihat sebelum publish.",
      `
        <div class="operator-grid">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Konten</th><th>Tipe</th><th>Status</th><th>Diperbarui</th><th>Aksi</th></tr></thead>
              <tbody>
                <tr><td><strong>Prototype Housing Sensor</strong></td><td>Portfolio</td><td>${status("Published", "success")}</td><td>Hari ini</td><td>${button("Edit", "edit-content", "button secondary small")}</td></tr>
                <tr><td><strong>Workshop FDM untuk Tim</strong></td><td>Service</td><td>${status("Draft", "warning")}</td><td>Kemarin</td><td>${button("Lanjutkan", "edit-content", "button secondary small")}</td></tr>
              </tbody>
            </table>
          </div>
          <aside class="context-card">
            <span class="card-kicker">Next action</span>
            <h2>Lengkapi satu draft</h2>
            <p>Operator boleh langsung publish. Tidak ada reviewer/approver terpisah untuk MVP.</p>
            <div class="button-row">${button("Tambah portfolio", "new-content")}</div>
          </aside>
        </div>
      `,
      button("Tambah konten", "new-content", "button small"),
    );
  }

  function adminCatalog(path) {
    return adminLayout(
      path,
      "Catalog, pricing & stok",
      "Ready Product dan jasa cetak berada dalam katalog yang sama, tetapi jenis stok dan aturan harga dibedakan.",
      `
        ${notice("2 peringatan stok", "Peringatan tampil di dashboard dan disiapkan untuk email. Email simulasi belum dikirim.", "warning")}
        <div class="table-wrap" style="margin-top:16px">
          <table class="data-table">
            <thead><tr><th>Offer</th><th>Jenis</th><th>Stok / pricing</th><th>Status</th><th>Next action</th></tr></thead>
            <tbody>
              <tr><td><strong>Keychain Layer</strong></td><td>Ready Product</td><td>2 item · minimum 3</td><td>${status("Low stock", "warning")}</td><td>${button("Sesuaikan stok", "adjust-stock", "button secondary small")}</td></tr>
              <tr><td><strong>Miniatur Kota</strong></td><td>Made-to-order</td><td>Tidak memakai stok barang jadi</td><td>${status("Aktif", "success")}</td><td>${button("Lihat", "catalog-view", "button secondary small")}</td></tr>
              <tr><td><strong>Custom 3D Print</strong></td><td>Jasa cetak</td><td>PLA Rp1.000/g (pertama 200 g) · ABS Rp1.200/g (pertama 200 g)</td><td>${status("Versioned", "info")}</td><td>${button("Lihat versi", "pricing-version", "button secondary small")}</td></tr>
            </tbody>
          </table>
        </div>
      `,
      button("Tambah offer", "catalog-view", "button small"),
    );
  }

  function adminRequests(path) {
    return adminLayout(
      path,
      "Retail requests & offers",
      "Queue untuk pekerjaan quote_required. Offer disiapkan operator dan memerlukan approval manager sebelum dikirim.",
      `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Request</th><th>Pelanggan</th><th>Routing</th><th>Status</th><th>Next action</th></tr></thead>
            <tbody>
              <tr><td><a class="table-link" href="/admin/retail-requests/REQ-DEMO-01" data-route="/admin/retail-requests/REQ-DEMO-01">REQ-DEMO-01</a></td><td>Ayu Demo</td><td>Kombinasi nonstandar</td><td>${status("Perlu ditinjau", "warning")}</td><td>Periksa file</td></tr>
              <tr><td><strong>REQ-DEMO-02</strong></td><td>Bima Demo</td><td>Slicing gagal</td><td>${status("Draft offer", "info")}</td><td>Lengkapi ETA</td></tr>
              <tr><td><strong>REQ-DEMO-03</strong></td><td>Citra Demo</td><td>Ukuran di luar batas</td><td>${status("Menunggu pelanggan", "warning")}</td><td>Tidak ada</td></tr>
            </tbody>
          </table>
        </div>
      `,
    );
  }

  function adminRequestDetail(path) {
    const conflict = state.conflict;
    return adminLayout(
      path,
      "REQ-DEMO-01",
      "Pemeriksaan request dan penyusunan Assisted Retail Offer. File pelanggan diperlakukan sebagai input tidak tepercaya.",
      `
        ${conflict ? notice("Versi request berubah", "Operator lain memperbarui data ini. Perubahan Anda belum disimpan; muat versi terbaru lalu bandingkan.", "danger") : ""}
        <div class="operator-grid" style="margin-top:${conflict ? "16px" : "0"}">
          <section>
            <div class="context-card">
              <div class="chip-row">${status("quote_required", "warning")}${status("Belum menjadi order", "info")}</div>
              <h2 style="margin-top:14px">Pemeriksaan file aman</h2>
              <div class="data-list">
                <div class="data-row"><span>File asli</span><strong>assembly-large.3mf</strong></div>
                <div class="data-row"><span>Tipe diterima</span><strong>3MF</strong></div>
                <div class="data-row"><span>Profil pelanggan</span><strong>Diabaikan</strong></div>
                <div class="data-row"><span>.gcode</span><strong>Tidak diterima</strong></div>
              </div>
              <div class="button-row">${button("Tandai file aman", "safe-file", "button secondary small")}</div>
            </div>
            <div class="context-card">
              <h2>Draft offer</h2>
              <div class="field-grid" style="margin-top:16px">
                <div class="field"><label for="offer-price">Harga simulasi</label><input id="offer-price" value="185000" inputmode="numeric" /></div>
                <div class="field"><label for="offer-eta">ETA</label><input id="offer-eta" value="4–6 hari kerja" /></div>
                <div class="field full"><label for="offer-note">Catatan pelanggan</label><textarea id="offer-note">Scope dan batasan produksi yang customer-safe.</textarea></div>
              </div>
              <div class="button-row">
                ${button("Simpan draft", "save-offer", "button secondary")}
                ${button("Ajukan approval manager", "submit-offer-approval")}
              </div>
            </div>
          </section>
          <aside>
            <div class="context-card">
              <span class="card-kicker">Role-aware control</span>
              <h3>Operator + Manager</h3>
              <p>Untuk tim kecil, orang yang sama dapat memiliki kedua role. Sistem tetap mencatat langkah penyusunan dan approval secara terpisah.</p>
            </div>
            <div class="context-card">
              <h3>Customer-safe boundary</h3>
              <p>Biaya internal, margin, supplier, profit, dan internal notes tidak muncul pada offer pelanggan.</p>
            </div>
          </aside>
        </div>
      `,
      link("/admin/retail-requests", "Kembali", "button secondary small"),
    );
  }

  function adminOrders(path) {
    const orderSnapshot = activeOrderSnapshot();
    const orderType =
      orderSnapshot.items.length > 1
        ? "Mixed Retail"
        : orderSnapshot.items[0]?.type === "ready"
          ? "Ready Product"
          : "Custom Print";
    return adminLayout(
      path,
      "Retail orders & production",
      "Queue transaksi berbayar, milestone produksi, QC, dan fulfillment. Tidak digabung dengan lifecycle B2B.",
      `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Order</th><th>Jenis</th><th>Status</th><th>ETA</th><th>Next action</th></tr></thead>
            <tbody>
              <tr><td><a class="table-link" href="/admin/retail-orders/NV-DEMO-014" data-route="/admin/retail-orders/NV-DEMO-014">NV-DEMO-014</a></td><td>${orderType}</td><td>${status("Printing", "info")}</td><td>2 Agu 2026</td><td>Konfirmasi milestone</td></tr>
              <tr><td><strong>NV-DEMO-015</strong></td><td>Ready Product</td><td>${status("Siap dikirim", "success")}</td><td>Hari ini</td><td>Input resi</td></tr>
              <tr><td><strong>NV-DEMO-016</strong></td><td>Custom Print</td><td>${status("Pemeriksaan file", "warning")}</td><td>Belum final</td><td>Periksa file</td></tr>
            </tbody>
          </table>
        </div>
      `,
    );
  }

  function adminOrderDetail(path) {
    const failedNotification = state.notificationFailure;
    const orderSnapshot = activeOrderSnapshot();
    return adminLayout(
      path,
      "NV-DEMO-014",
      "Satu workspace untuk status produksi customer-safe dan catatan operasional internal yang tetap terpisah.",
      `
        ${failedNotification ? notice("Status tersimpan, email gagal dikirim", "Perubahan milestone tidak di-rollback. Operator dapat mencoba ulang notifikasi tanpa mengulang update produksi.", "warning") : ""}
        <div class="operator-grid" style="margin-top:${failedNotification ? "16px" : "0"}">
          <section class="context-card">
            <div class="chip-row">${status("Printing", "info")}${status("Lunas", "success")}</div>
            <h2 style="margin-top:14px">Perbarui milestone</h2>
            <div class="field-grid" style="margin-top:18px">
              <div class="field">
                <label for="milestone">Status customer-facing</label>
                <select id="milestone"><option>Antrean produksi</option><option selected>Printing</option><option>Post-processing</option><option>QC</option><option>Siap diambil/dikirim</option></select>
              </div>
              <div class="field">
                <label for="eta">ETA saat ini</label>
                <input id="eta" value="2 Agustus 2026" />
              </div>
              <div class="field full">
                <label for="customer-note">Catatan untuk pelanggan</label>
                <textarea id="customer-note">Objek sedang dicetak. Tahap berikutnya post-processing.</textarea>
              </div>
              <div class="field full">
                <label for="internal-note">Catatan internal · tidak ditampilkan ke pelanggan</label>
                <textarea id="internal-note">Simulasi catatan operasional tanpa biaya/margin nyata.</textarea>
              </div>
            </div>
            <div class="button-row">
              ${button("Simpan status", "save-milestone")}
              ${moderatorOnly(
                button("Simulasikan email gagal", "fail-notification", "button secondary"),
              )}
            </div>
          </section>
          <aside>
            <div class="context-card">
              <span class="card-kicker">Konteks tetap tersimpan</span>
              <h3>Order ${state.operatorContext}</h3>
              <p>Berpindah antar queue tidak mengubah order yang sedang ditangani.</p>
              <div class="data-list">
                ${orderSnapshot.items
                  .map(
                    (item) => `<div class="data-row"><span>${escapeHtml(orderLineTitle(item))}</span><strong>${escapeHtml(orderLineDetail(item))}</strong></div>`,
                  )
                  .join("")}
                <div class="data-row"><span>Fulfillment</span><strong>${escapeHtml(orderSnapshot.fulfillment)}</strong></div>
                <div class="data-row"><span>Total dibayar</span><strong>${rupiah(orderSnapshot.total)}</strong></div>
              </div>
            </div>
            ${failedNotification ? `<div class="context-card"><h3>Recovery</h3><p>Retry hanya mengirim notifikasi dari status yang sudah tersimpan.</p><div class="button-row">${button("Coba ulang email", "retry-notification", "button secondary small")}</div></div>` : ""}
          </aside>
        </div>
      `,
      link("/admin/retail-orders", "Kembali", "button secondary small"),
    );
  }

  function adminCases(path) {
    const caseData = state.complaintCase;
    return adminLayout(
      path,
      "After-sales cases",
      "Komplain, bukti, keputusan reprint/refund, dan eksekusi Finance tetap dapat ditelusuri sebagai langkah berbeda.",
      `
        ${
          caseData
            ? `
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Kasus</th><th>Order</th><th>Tipe</th><th>Status</th><th>Next action</th></tr></thead>
                  <tbody>
                    <tr><td><a class="table-link" href="/admin/retail-cases/CASE-DEMO-01" data-route="/admin/retail-cases/CASE-DEMO-01">CASE-DEMO-01</a></td><td>NV-DEMO-014</td><td>${escapeHtml(caseData.issue)}</td><td>${status(caseData.evidenceCount ? "Bukti tersedia" : "Penjelasan tersedia", "warning")}</td><td>Putuskan resolusi</td></tr>
                  </tbody>
                </table>
              </div>
            `
            : `
              <div class="empty-state">
                <div><h2>Belum ada kasus after-sales</h2><p>Kasus akan muncul setelah komplain pelanggan diterima atau fixture moderator dipilih.</p></div>
              </div>
            `
        }
      `,
    );
  }

  function adminCaseDetail(path) {
    const caseData = state.complaintCase;
    if (!caseData) {
      return adminLayout(
        path,
        "Kasus tidak tersedia",
        "Belum ada case simulasi pada sesi browser ini.",
        `<div class="empty-state"><div><h2>Tidak ada case untuk ditinjau</h2><p>Kembali ke antrean after-sales untuk memilih case yang tersedia.</p></div></div>`,
        link("/admin/retail-cases", "Kembali", "button secondary small"),
      );
    }
    const approvalPending = state.resolutionApprovalStatus === "pending";
    const approvalGranted = state.resolutionApprovalStatus === "approved";
    const approvalStarted = approvalPending || approvalGranted;
    const hasEvidence = caseData.evidenceCount > 0;
    return adminLayout(
      path,
      "CASE-DEMO-01",
      "Pemeriksaan bukti dan resolusi. Approval kompensasi tidak sama dengan eksekusi pembayaran oleh Finance.",
      `
        <div class="operator-grid">
          <section>
            <div class="context-card">
              <div class="chip-row">${status(hasEvidence ? "Bukti tersedia" : "Penjelasan tersedia", "success")}${status(approvalGranted ? "Disetujui manager" : approvalPending ? "Menunggu manager" : "Menunggu usulan operator", approvalGranted ? "success" : "warning")}</div>
              <h2 style="margin-top:14px">${escapeHtml(caseData.issue)}</h2>
              <p>${
                hasEvidence
                  ? `Pelanggan mengirim deskripsi dan ${caseData.evidenceCount} bukti simulasi privat.`
                  : "Pelanggan mengirim deskripsi tanpa foto atau video."
              }</p>
              ${
                hasEvidence
                  ? `<div class="evidence-placeholder" style="margin-top:18px"><span aria-hidden="true">Bukti privat</span><strong>${caseData.evidenceCount} file simulasi</strong></div>`
                  : ""
              }
            </div>
            <div class="context-card">
              <h2>Usulan resolusi</h2>
              <div class="field-grid" style="margin-top:16px">
                <div class="field full">
                  <label for="resolution">Resolusi</label>
                  <select id="resolution" ${approvalStarted ? "disabled" : ""}><option>Free reprint</option><option selected>Refund</option><option>Tidak disetujui</option></select>
                </div>
                <div class="field full">
                  <label for="decision-note">Dasar keputusan</label>
                  <textarea id="decision-note" ${approvalStarted ? "disabled" : ""}>Bukti memenuhi kriteria simulasi untuk ditinjau manager.</textarea>
                </div>
              </div>
              <div class="button-row">
                ${button(
                  approvalGranted
                    ? "Sudah disetujui manager"
                    : approvalPending
                      ? "Menunggu approval manager"
                      : "Ajukan approval manager",
                  "approve-resolution",
                  "button",
                  approvalStarted ? "disabled" : "",
                )}
              </div>
              ${
                approvalStarted
                  ? `<p class="field-confirmation">${
                      approvalGranted
                        ? `Disetujui oleh Manager Demo · ${state.managerApprovedAt}`
                        : `Diajukan oleh Operator Demo · ${state.resolutionSubmittedAt}. Belum ada keputusan manager.`
                    }</p>`
                  : ""
              }
            </div>
          </section>
          <aside>
            <div class="context-card">
              <span class="card-kicker">Separation of duties</span>
              <ol class="timeline">
                <li class="timeline-item ${approvalStarted ? "done" : "current"}"><span class="timeline-dot"></span><div><h3>Operator mengajukan usulan</h3><p>${approvalStarted ? `Diajukan oleh Operator Demo · ${state.resolutionSubmittedAt}` : "Belum diajukan"}</p></div></li>
                <li class="timeline-item ${approvalGranted ? "done" : approvalPending ? "current" : ""}"><span class="timeline-dot"></span><div><h3>Manager memutuskan resolusi</h3><p>${approvalGranted ? `Disetujui oleh Manager Demo · ${state.managerApprovedAt}` : approvalPending ? "Menunggu keputusan manager" : "Belum tersedia"}</p></div></li>
                <li class="timeline-item ${approvalGranted ? "current" : ""}"><span class="timeline-dot"></span><div><h3>Finance mengeksekusi refund</h3><p>${approvalGranted ? "Belum dieksekusi" : "Belum tersedia"}</p></div></li>
              </ol>
            </div>
            ${moderatorOnly(
              approvalPending
                ? `<div class="context-card"><span class="card-kicker">Fixture manager</span><h3>Keputusan role terpisah</h3><p>Kontrol ini hanya untuk moderator dan tidak tampil kepada operator participant.</p><div class="button-row">${button("Simulasikan manager menyetujui", "manager-approve-resolution", "button secondary")}</div></div>`
                : "",
            )}
          </aside>
        </div>
      `,
      link("/admin/retail-cases", "Kembali", "button secondary small"),
    );
  }

  function legacyOrders(path) {
    return adminLayout(
      path,
      "Order lama · read-only",
      "Route /admin/orders dipertahankan sebagai compatibility surface. Mutasi Retail baru dilakukan melalui /admin/retail-orders.",
      `
        ${notice("Legacy compatibility", "Data hanya dapat dilihat. Gunakan Retail Orders untuk proses operasional aktif.", "warning")}
        <div class="empty-state" style="margin-top:16px">
          <div>
            <h2>Tidak ada aksi tulis di route ini</h2>
            <p>Pemisahan ini mencegah lifecycle lama bercampur dengan Retail Order canonical.</p>
            <div class="button-row" style="justify-content:center">${link("/admin/retail-orders", "Buka Retail Orders", "button")}</div>
          </div>
        </div>
      `,
    );
  }

  function recoveryPage(kind) {
    const map = {
      "session-expired": [
        "Sesi Anda berakhir",
        "Masuk kembali untuk melanjutkan. Keranjang simulasi tetap tersedia, tetapi tindakan sensitif belum dijalankan.",
        "Masuk kembali",
        "/login",
      ],
      "access-denied": [
        "Order tidak dapat diakses",
        "Akun ini bukan pemilik order tersebut. Tidak ada detail pelanggan atau status internal yang ditampilkan.",
        "Kembali ke dashboard",
        "/dashboard",
      ],
      "backend-down": [
        "Layanan sementara bermasalah",
        "Data gagal dimuat, bukan berarti daftar kosong. Coba lagi tanpa membuat order atau pembayaran ganda.",
        "Coba lagi",
        "/dashboard",
      ],
    };
    const [title, description, actionLabel, target] = map[kind];
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page">
          <div class="empty-state">
            <div>
              <span class="eyebrow">Recovery state</span>
              <h1 style="font-size:clamp(2rem,4vw,3.5rem);margin:0 auto">${title}</h1>
              <p>${description}</p>
              <div class="button-row" style="justify-content:center">${link(target, actionLabel, "button")}</div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  function notFound(path) {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page">
          <div class="empty-state">
            <div><span class="eyebrow">Prototype 404</span><h1 style="font-size:3rem">Route belum dibuat</h1><p>${escapeHtml(path)} tidak termasuk skenario prototipe ini.</p><div class="button-row" style="justify-content:center">${link("/", "Kembali ke Home", "button")}</div></div>
          </div>
        </div>
      </main>
    `;
  }

  function legacyCustomerOrderUnavailable() {
    return `
      <main id="main-content" class="main" tabindex="-1">
        <div class="page compact">
          <div class="empty-state">
            <div>
              <span class="eyebrow">Legacy compatibility · read-only</span>
              <h1 style="font-size:clamp(2rem,4vw,3.5rem);margin:0 auto">Pemesanan lama tidak tersedia</h1>
              <p>Route /order tidak menerima pembuatan Order atau pembayaran baru. Gunakan Retail untuk melihat produk dan layanan yang tersedia.</p>
              <div class="button-row" style="justify-content:center">${link("/retail", "Jelajahi Retail", "button")}</div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  function contentFor(path) {
    if (state.scenario === "session-expired" && !path.startsWith("/admin")) return recoveryPage("session-expired");
    if (state.scenario === "access-denied" && path.startsWith("/orders/")) return recoveryPage("access-denied");
    if (state.scenario === "backend-down" && path === "/dashboard") return recoveryPage("backend-down");

    if (path === "/") return publicHome();
    if (path === "/order") return legacyCustomerOrderUnavailable();
    if (["/about", "/capabilities", "/projects", "/contact"].includes(path)) return simplePublicPage(path);
    if (path === "/retail") return retailIndex();
    if (path === "/retail/products/ready-keychain") return readyProduct();
    if (path === "/retail/products/custom-fdm") return customProduct();
    if (path === "/retail/products/custom-fdm/configure") return customConfigurator();
    if (path === "/retail/cart") return cartPage();
    if (path === "/login") return authPage("login");
    if (path === "/register") return authPage("register");
    if (path === "/retail/checkout") return state.loggedIn ? checkoutPage() : checkoutAuthGate();
    if (path === "/dashboard") return customerDashboard();
    if (path === "/dashboard/notifications") return notificationsPage();
    if (/^\/retail\/requests\/[^/]+$/.test(path)) return requestPage();
    if (/^\/retail\/offers\/[^/]+$/.test(path)) return offerPage();
    if (/^\/orders\/[^/]+\/file-revision$/.test(path)) return afterSalesPage("revision");
    if (/^\/orders\/[^/]+\/cancellation$/.test(path)) return afterSalesPage("cancellation");
    if (/^\/orders\/[^/]+\/complaints\/new$/.test(path)) return afterSalesPage("complaint");
    if (/^\/orders\/[^/]+\/complaints\/[^/]+$/.test(path)) return afterSalesCasePage();
    if (/^\/orders\/[^/]+$/.test(path)) return orderPage();
    if (path === "/admin") return adminDashboard(path);
    if (path === "/admin/content") return adminContent(path);
    if (path === "/admin/catalog") return adminCatalog(path);
    if (path === "/admin/retail-requests") return adminRequests(path);
    if (/^\/admin\/retail-requests\/[^/]+$/.test(path)) return adminRequestDetail(path);
    if (path === "/admin/retail-orders") return adminOrders(path);
    if (/^\/admin\/retail-orders\/[^/]+$/.test(path)) return adminOrderDetail(path);
    if (path === "/admin/retail-cases") return adminCases(path);
    if (/^\/admin\/retail-cases\/[^/]+$/.test(path)) return adminCaseDetail(path);
    if (path === "/admin/orders") return legacyOrders(path);
    return notFound(path);
  }

  const pageTitles = {
    "/": "Home",
    "/about": "About",
    "/capabilities": "Capabilities",
    "/projects": "Projects",
    "/contact": "Contact",
    "/retail": "Retail",
    "/retail/products/ready-keychain": "Keychain Layer",
    "/retail/products/custom-fdm": "Custom 3D Print",
    "/retail/products/custom-fdm/configure": "Konfigurasi Custom Print",
    "/retail/cart": "Keranjang",
    "/retail/checkout": "Checkout",
    "/order": "Legacy Order",
    "/login": "Login",
    "/register": "Register",
    "/dashboard": "Dashboard Pelanggan",
    "/dashboard/notifications": "Notifikasi",
    "/admin": "Operator Next Actions",
    "/admin/content": "Content & Portfolio",
    "/admin/catalog": "Catalog & Stok",
    "/admin/retail-requests": "Retail Requests",
    "/admin/retail-orders": "Retail Orders",
    "/admin/retail-cases": "After-sales Cases",
    "/admin/orders": "Legacy Orders",
  };

  function titleFor(path) {
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith("/retail/requests/")) return "Assisted Retail Request";
    if (path.startsWith("/retail/offers/")) return "Assisted Retail Offer";
    if (/\/file-revision$/.test(path)) return "File Revision";
    if (/\/cancellation$/.test(path)) return "Cancellation Request";
    if (/\/complaints\/new$/.test(path)) return "New Complaint";
    if (/\/complaints\/[^/]+$/.test(path)) return "After-sales Case";
    if (path.startsWith("/orders/")) return "Order Tracking";
    if (path.startsWith("/admin/retail-requests/")) return "Request Detail";
    if (path.startsWith("/admin/retail-orders/")) return "Order Detail";
    if (path.startsWith("/admin/retail-cases/")) return "Case Detail";
    return "Prototype";
  }

  function canonicalizeCurrentPath() {
    const aliases = {
      "/services": "/capabilities",
      "/portfolio": "/projects",
    };
    const canonicalPath = aliases[window.location.pathname] || window.location.pathname;
    if (canonicalPath !== window.location.pathname) {
      const destination =
        state.reviewMode === "moderator" ? `${canonicalPath}?mode=moderator` : canonicalPath;
      window.history.replaceState({}, "", destination);
    }
    return canonicalPath;
  }

  function render(options = {}) {
    const path = canonicalizeCurrentPath();
    const routeOrderReference = orderRefFromPath(path);
    if (routeOrderReference) state.orderReference = routeOrderReference;
    const activeElement = options.preserveFocus ? document.activeElement : null;
    const activeId = activeElement?.id || "";
    const activeAction = activeElement?.getAttribute?.("data-action") || "";
    persistState();
    document.title = `${titleFor(path)} — Niuva MVP Prototype`;
    app.innerHTML = `
      ${header(path)}
      ${contentFor(path)}
      ${surfaceFor(path) === "customer" ? footer() : ""}
      ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
    `;

    if (options.preserveFocus) {
      const restoredFocus = activeId
        ? document.getElementById(activeId)
        : activeAction
          ? Array.from(document.querySelectorAll("[data-action]")).find(
              (element) => element.getAttribute("data-action") === activeAction,
            )
          : null;
      if (restoredFocus && !restoredFocus.disabled) {
        restoredFocus.focus({ preventScroll: true });
      }
    } else if (!options.initial) {
      window.scrollTo(0, 0);
      const main = document.querySelector("#main-content");
      if (main) main.focus({ preventScroll: true });
    }
  }

  function resetScenarioState() {
    state.loggedIn = false;
    state.returnTo = "/retail/checkout";
    state.fileState = "empty";
    state.slicingState = "idle";
    state.quoteRequired = false;
    state.offerStatus = "offered";
    state.checkoutState = "preview";
    state.reservationMinutes = 30;
    state.orderReference = null;
    state.paymentAttemptReference = null;
    state.reservationStatus = "none";
    state.reservationPolicyId = null;
    state.fulfillmentMode = "delivery";
    state.orderSnapshot = null;
    state.orderState = "printing";
    state.revisionVersion = 1;
    state.revisionSubmitted = false;
    state.notificationFailure = false;
    state.conflict = false;
    state.cancellationSubmitted = false;
    state.cancellationSubmittedAt = "";
    state.complaintEvidenceCount = 0;
    state.complaintCase = null;
    state.resolutionApprovalStatus = "not_requested";
    state.resolutionSubmittedAt = "";
    state.managerApprovedAt = "";
    state.cartItems = [];
    state.configMode = "simple";
  }

  function applyScenario(name) {
    resetScenarioState();
    state.scenario = name;
    let target = "/retail";
    switch (name) {
      case "ready-happy":
        target = "/retail/products/ready-keychain";
        break;
      case "custom-simple":
        state.fileState = "valid";
        state.slicingState = "done";
        target = "/retail/products/custom-fdm/configure";
        break;
      case "custom-detail":
        state.configMode = "detail";
        state.fileState = "valid";
        state.slicingState = "done";
        target = "/retail/products/custom-fdm/configure";
        break;
      case "custom-3mf":
        state.fileState = "valid3mf";
        state.slicingState = "done";
        target = "/retail/products/custom-fdm/configure";
        break;
      case "upload-invalid":
        state.fileState = "invalid";
        target = "/retail/products/custom-fdm/configure";
        break;
      case "quote-required":
        state.fileState = "valid";
        state.slicingState = "failed";
        state.quoteRequired = true;
        target = "/retail/products/custom-fdm/configure";
        break;
      case "mixed-cart":
        state.cartItems = [readyCartItem(), customCartItem()];
        target = "/retail/cart";
        break;
      case "offer-accepted":
        state.offerStatus = "accepted";
        target = "/retail/offers/OFF-DEMO-01";
        break;
      case "offer-declined":
        state.offerStatus = "declined";
        target = "/retail/offers/OFF-DEMO-01";
        break;
      case "offer-expired":
        state.offerStatus = "expired";
        target = "/retail/offers/OFF-DEMO-01";
        break;
      case "offer-superseded":
        state.offerStatus = "superseded";
        target = "/retail/offers/OFF-DEMO-01";
        break;
      case "checkout-stale":
        state.loggedIn = true;
        state.cartItems = [readyCartItem()];
        state.orderSnapshot = createOrderSnapshot();
        state.orderReference = "NV-DEMO-STALE";
        state.paymentAttemptReference = "PA-DEMO-STALE";
        state.reservationStatus = "active";
        state.reservationPolicyId = "NIUVA-RES-30M-v1";
        state.checkoutState = "stale";
        target = "/retail/checkout";
        break;
      case "reservation-warning":
        state.loggedIn = true;
        state.cartItems = [readyCartItem()];
        state.orderSnapshot = createOrderSnapshot();
        state.orderReference = "NV-DEMO-WARN";
        state.paymentAttemptReference = "PA-DEMO-WARN";
        state.reservationStatus = "active";
        state.reservationPolicyId = "NIUVA-RES-30M-v1";
        state.checkoutState = "warning";
        state.reservationMinutes = 5;
        target = "/retail/checkout";
        break;
      case "reservation-expired":
        state.loggedIn = true;
        state.cartItems = [readyCartItem()];
        state.orderSnapshot = createOrderSnapshot();
        state.orderReference = "NV-DEMO-EXP";
        state.paymentAttemptReference = "PA-DEMO-EXP";
        state.reservationStatus = "expired";
        state.reservationPolicyId = "NIUVA-RES-30M-v1";
        state.checkoutState = "expired";
        state.reservationMinutes = 0;
        target = "/retail/checkout";
        break;
      case "revision-required":
        state.orderState = "revision";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        target = "/orders/" + state.orderReference;
        break;
      case "eta-overdue":
        state.orderState = "overdue";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        target = "/orders/" + state.orderReference;
        break;
      case "order-pickup":
        state.orderState = "pickup";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        target = "/orders/" + state.orderReference;
        break;
      case "order-delivery":
        state.orderState = "delivery";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        target = "/orders/" + state.orderReference;
        break;
      case "order-received":
        state.orderState = "complete";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        target = "/orders/" + state.orderReference;
        break;
      case "cancellation":
        state.orderState = "printing";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        target = "/orders/" + state.orderReference + "/cancellation";
        break;
      case "complaint":
        state.orderState = "complete";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        target = "/orders/" + state.orderReference + "/complaints/new";
        break;
      case "case-status":
        state.orderState = "complete";
        state.orderReference = state.orderReference || "NV-DEMO-014";
        state.complaintCase = demoComplaintCase();
        target = "/orders/" + state.orderReference + "/complaints/CASE-DEMO-01";
        break;
      case "session-expired":
        state.cartItems = [readyCartItem()];
        target = "/retail/checkout";
        break;
      case "access-denied":
        target = "/orders/NOT-OWNED";
        break;
      case "backend-down":
        target = "/admin";
        break;
      case "operator-next-actions":
        target = "/admin";
        break;
      case "operator-conflict":
        state.conflict = true;
        target = "/admin/retail-requests/REQ-DEMO-01";
        break;
      case "notification-failed":
        state.notificationFailure = true;
        target = "/admin/retail-orders/NV-DEMO-014";
        break;
      case "refund-separation":
        state.complaintCase = demoComplaintCase();
        target = "/admin/retail-cases/CASE-DEMO-01";
        break;
      default:
        target = "/retail";
    }
    navigate(target);
  }

  function handleAction(action) {
    if (action.startsWith("remove-cart:")) {
      const itemId = action.slice("remove-cart:".length);
      state.cartItems = state.cartItems.filter((item) => item.id !== itemId);
      render({ preserveFocus: true });
      announce("Item dihapus dari keranjang.");
      return;
    }
    switch (action) {
      case "toggle-menu":
        state.menuOpen = !state.menuOpen;
        render({ preserveFocus: true });
        break;
      case "toggle-admin-menu":
        state.adminMenuOpen = !state.adminMenuOpen;
        render({ preserveFocus: true });
        break;
      case "toggle-moderator-panel":
        state.moderatorPanelOpen = !state.moderatorPanelOpen;
        render({ preserveFocus: true });
        break;
      case "participant-mode":
        state.reviewMode = "participant";
        window.history.replaceState({}, "", window.location.pathname);
        render({ preserveFocus: true });
        announce("Participant Mode aktif.");
        break;
      case "reset-session": {
        const reviewMode = state.reviewMode;
        window.sessionStorage.removeItem(STORAGE_KEY);
        Object.assign(state, defaultState, {
          reviewMode,
          moderatorPanelOpen: true,
          cartItems: [],
          complaintCase: null,
        });
        applyScenario("ready-happy");
        break;
      }
      case "submit-inquiry":
        setToast("Inquiry simulasi diterima. Tidak ada data yang dikirim.");
        break;
      case "add-ready":
        state.scenario = "ready-happy";
        state.cartItems = [
          ...state.cartItems.filter((item) => item.id !== "ready-keychain"),
          readyCartItem(),
        ];
        navigate("/retail/cart");
        break;
      case "mode-simple":
        state.configMode = "simple";
        render({ preserveFocus: true });
        announce("Mode sederhana dipilih.");
        break;
      case "mode-detail":
        state.configMode = "detail";
        render({ preserveFocus: true });
        announce("Mode detail dipilih.");
        break;
      case "upload-valid":
        state.fileState = "valid";
        state.slicingState = "idle";
        state.quoteRequired = false;
        render({ preserveFocus: true });
        announce("File valid siap untuk simulasi slicing.");
        break;
      case "upload-invalid":
        state.fileState = "invalid";
        state.slicingState = "idle";
        render({ preserveFocus: true });
        announce("File bermasalah. Ganti file dan coba lagi.");
        break;
      case "slice-ok":
        state.slicingState = "done";
        state.quoteRequired = false;
        render({ preserveFocus: true });
        announce("Slicing selesai dan harga simulasi tersedia.");
        break;
      case "slice-failed":
        state.slicingState = "failed";
        state.quoteRequired = true;
        render({ preserveFocus: true });
        announce("Slicing gagal. Konfigurasi diarahkan ke Assisted Retail Request.");
        break;
      case "add-custom":
        state.cartItems = [
          ...state.cartItems.filter((item) => item.id !== "custom-model-v7"),
          customCartItem(),
        ];
        navigate("/retail/cart");
        break;
      case "create-request":
        navigate("/retail/requests/REQ-DEMO-01");
        break;
      case "go-checkout":
        if (!state.cartItems.length) {
          setToast("Keranjang masih kosong. Pilih produk terlebih dahulu.");
          break;
        }
        if (!state.loggedIn) {
          state.returnTo = "/retail/checkout";
          navigate("/login");
        } else {
          navigate("/retail/checkout");
        }
        break;
      case "accept-offer":
        state.offerStatus = "accepted";
        state.cartItems = [
          ...state.cartItems.filter((item) => item.id !== "custom-model-v7"),
          customCartItem(),
        ];
        render({ preserveFocus: true });
        announce("Offer diterima. Order belum dibuat; lanjutkan checkout.");
        break;
      case "decline-offer":
        state.offerStatus = "declined";
        render({ preserveFocus: true });
        announce("Offer ditolak.");
        break;
      case "confirm-order": {
        // Create immutable order snapshot and start reservation.
        // Retry path (after expiry): preserve existing orderReference;
        // only generate a new Order ID on first confirmation.
        // Capture isRetry BEFORE assignment so the announce is correct.
        const isRetry = !!state.orderReference;
        state.orderSnapshot = createOrderSnapshot();
        if (!state.orderReference) {
          state.orderReference = "NV-DEMO-" + String(Date.now()).slice(-4);
        }
        // Always generate a fresh paymentAttemptReference for each attempt.
        state.paymentAttemptReference = "PA-DEMO-" + String(Date.now()).slice(-4);
        state.reservationStatus = "active";
        state.reservationPolicyId = "NIUVA-RES-30M-v1";
        state.checkoutState = "fresh";
        state.reservationMinutes = 30;
        render({ preserveFocus: true });
        announce(
          isRetry
            ? "Payment attempt baru dibuat. Reservasi 30 menit dimulai. Order yang sama dipertahankan."
            : "Order dan payment attempt simulasi dibuat. Reservasi 30 menit dimulai."
        );
        break;
      }
      case "refresh-checkout":
        // Expired retry: same order, return to preview for revalidation
        // Payment attempt released; new attempt will be created on re-confirm
        state.paymentAttemptReference = null;
        state.reservationStatus = "none";
        state.checkoutState = "preview";
        state.reservationMinutes = 30;
        render({ preserveFocus: true });
        announce("Ketersediaan diperiksa ulang. Tinjau dan konfirmasi untuk membuat attempt baru.");
        break;
      case "accept-stale":
        // Accept updated values; create new snapshot, stay in fresh (reservation continues)
        state.orderSnapshot = createOrderSnapshot();
        state.checkoutState = "fresh";
        render({ preserveFocus: true });
        announce("Nilai terbaru disetujui. Snapshot diperbarui.");
        break;
      case "pay":
        // Fail-closed: require valid order, payment attempt, snapshot, AND active reservation.
        if (!state.orderReference || !state.paymentAttemptReference) {
          state.checkoutState = "preview";
          state.reservationStatus = "none";
          render({ preserveFocus: true });
          announce("Order atau payment attempt belum tersedia. Kembali ke pratinjau.");
          break;
        }
        if (!state.orderSnapshot) {
          state.checkoutState = "preview";
          state.reservationStatus = "none";
          render({ preserveFocus: true });
          announce("Snapshot pesanan tidak ditemukan. Kembali ke pratinjau.");
          break;
        }
        if (state.reservationStatus !== "active") {
          // Reservation expired, consumed, or not started — cannot pay.
          state.checkoutState = "expired";
          render({ preserveFocus: true });
          announce("Reservasi tidak aktif. Periksa ulang ketersediaan sebelum membayar.");
          break;
        }
        state.reservationStatus = "consumed";
        state.orderState = "printing";
        state.revisionVersion = 1;
        state.revisionSubmitted = false;
        state.cancellationSubmitted = false;
        state.cancellationSubmittedAt = "";
        state.complaintEvidenceCount = 0;
        state.complaintCase = null;
        state.resolutionApprovalStatus = "not_requested";
        state.resolutionSubmittedAt = "";
        state.managerApprovedAt = "";
        navigate("/orders/" + state.orderReference);
        setToast("Pembayaran provider-neutral disimulasikan berhasil.");
        break;
      case "admin-refresh":
        setToast("Data simulasi dimuat ulang tanpa mengubah status.");
        break;
      case "edit-content":
      case "new-content":
        setToast("Editor konten simulasi dibuka; tidak ada data yang disimpan.");
        break;
      case "adjust-stock":
        setToast("Penyesuaian stok simulasi dicatat; peringatan akan dievaluasi ulang.");
        break;
      case "catalog-view":
      case "pricing-version":
        setToast("Detail catalog/pricing simulasi dibuka.");
        break;
      case "safe-file":
        setToast("Pemeriksaan file simulasi dicatat aman.");
        break;
      case "save-offer":
        if (state.conflict) {
          announce("Penyimpanan ditolak karena versi berubah.");
        } else {
          setToast("Draft offer simulasi tersimpan.");
        }
        break;
      case "submit-offer-approval":
        setToast("Draft diajukan ke approval manager; belum dikirim ke pelanggan.");
        break;
      case "save-milestone":
        setToast("Milestone simulasi tersimpan dan histori dipertahankan.");
        break;
      case "fail-notification":
        state.notificationFailure = true;
        render({ preserveFocus: true });
        announce("Status tersimpan, tetapi email gagal. Retry tersedia.");
        break;
      case "retry-notification":
        state.notificationFailure = false;
        setToast("Email simulasi berhasil dikirim ulang.");
        break;
      case "approve-resolution":
        if (state.resolutionApprovalStatus !== "not_requested") break;
        state.resolutionApprovalStatus = "pending";
        state.resolutionSubmittedAt = "31 Juli 2026 · 15.45 WIB";
        render({ preserveFocus: true });
        announce("Usulan dikirim ke manager. Belum ada persetujuan dan Finance belum dapat mengeksekusi refund.");
        break;
      case "manager-approve-resolution":
        if (state.reviewMode !== "moderator" || state.resolutionApprovalStatus !== "pending") break;
        state.resolutionApprovalStatus = "approved";
        state.managerApprovedAt = "31 Juli 2026 · 16.00 WIB";
        render({ preserveFocus: true });
        announce("Manager menyetujui usulan. Finance belum mengeksekusi refund.");
        break;
      default:
        break;
    }
  }

  document.addEventListener("click", (event) => {
    const routeElement = event.target.closest("[data-route]");
    if (routeElement) {
      event.preventDefault();
      navigate(routeElement.getAttribute("data-route"));
      return;
    }
    const actionElement = event.target.closest("[data-action]");
    if (actionElement) {
      handleAction(actionElement.getAttribute("data-action"));
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("#scenario-select")) {
      applyScenario(event.target.value);
      return;
    }
    if (event.target.matches('[data-change="material"]')) {
      state.material = event.target.value;
      render({ preserveFocus: true });
      announce(`Material ${state.material} dipilih dan estimasi diperbarui.`);
      return;
    }
    if (event.target.matches('[data-change="fulfillment"]')) {
      state.fulfillmentMode = event.target.value === "pickup" ? "pickup" : "delivery";
      render({ preserveFocus: true });
      announce(
        state.fulfillmentMode === "pickup"
          ? "Pickup dipilih dan ongkir menjadi Rp0."
          : "Pengiriman dipilih dan ongkir dihitung ulang.",
      );
      return;
    }
    if (event.target.matches('[data-change="cart-quantity"]')) {
      const itemId = event.target.getAttribute("data-item-id");
      const quantity = Number.parseInt(event.target.value, 10);
      state.cartItems = state.cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      );
      render({ preserveFocus: true });
      announce(`Jumlah diperbarui menjadi ${quantity}.`);
      return;
    }
    if (event.target.matches("#complaint-evidence")) {
      state.complaintEvidenceCount = event.target.files?.length || 0;
      render({ preserveFocus: true });
      announce(
        state.complaintEvidenceCount
          ? `${state.complaintEvidenceCount} bukti simulasi dipilih.`
          : "Tidak ada bukti dipilih.",
      );
      return;
    }
    if (event.target.matches("#revision-file")) {
      event.target.setCustomValidity("");
      const selection = document.querySelector("#revision-file-selection");
      const selected = event.target.files?.length || 0;
      if (selection) {
        selection.textContent = selected
          ? "Satu file pengganti dipilih dan siap dikirim sebagai versi baru."
          : "Belum ada file pengganti dipilih.";
      }
      announce(
        selected
          ? "File pengganti dipilih dan siap dikirim sebagai versi baru."
          : "Belum ada file pengganti dipilih.",
      );
    }
  });

  document.addEventListener(
    "invalid",
    (event) => {
      if (event.target.matches("#revision-file") && !event.target.files?.length) {
        event.target.setCustomValidity("Pilih satu file STL atau 3MF sebelum mengirim revisi.");
      }
    },
    true,
  );

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("form");
    if (!form) return;
    event.preventDefault();
    const formKind = form.getAttribute("data-form");
    if (formKind === "auth") {
      state.loggedIn = true;
      navigate(state.returnTo || "/dashboard");
      setToast("Login simulasi berhasil.");
      return;
    }
    if (formKind === "revision") {
      const revisionFile = form.querySelector("#revision-file");
      if (!revisionFile?.files?.length) {
        revisionFile?.setCustomValidity("Pilih satu file STL atau 3MF sebelum mengirim revisi.");
        revisionFile?.reportValidity();
        announce("Pilih satu file STL atau 3MF sebelum mengirim revisi.");
        return;
      }
      revisionFile.setCustomValidity("");
      const selectedName = revisionFile.files[0]?.name || "";
      if (!/\.(stl|3mf)$/i.test(selectedName)) {
        revisionFile.setCustomValidity("Format file harus STL atau 3MF.");
        revisionFile.reportValidity();
        announce("Format file harus STL atau 3MF.");
        return;
      }
      state.revisionVersion += 1;
      state.revisionSubmitted = true;
      state.orderState = "printing";
      navigate("/orders/" + activeOrderRef());
      setToast(`Revisi versi ${state.revisionVersion} diterima; versi sebelumnya tetap berada dalam histori.`);
      return;
    }
    if (formKind === "complaint") {
      if (state.complaintCase) {
        navigate("/orders/" + activeOrderRef() + "/complaints/" + state.complaintCase.id);
        setToast("Komplain aktif sudah tersedia; tidak dibuat laporan duplikat.");
        return;
      }
      const issue = form.querySelector("#issue")?.value || "Masalah lain";
      const description = form.querySelector("#evidence")?.value || "";
      state.complaintCase = {
        id: "CASE-DEMO-01",
        issue,
        description,
        evidenceCount: state.complaintEvidenceCount,
        submittedAt: "31 Juli 2026",
      };
      navigate("/orders/" + activeOrderRef() + "/complaints/CASE-DEMO-01");
      setToast("Komplain simulasi diterima dan memiliki status case.");
      return;
    }
    if (formKind === "cancellation") {
      state.cancellationSubmitted = true;
      state.cancellationSubmittedAt = "31 Juli 2026";
      render({ preserveFocus: true });
      setToast("Permintaan pembatalan simulasi tercatat untuk review.");
    }
  });

  window.addEventListener("popstate", () => {
    state.reviewMode =
      new URLSearchParams(window.location.search).get("mode") === "moderator"
        ? "moderator"
        : "participant";
    render();
  });

  render({ initial: true });
})();
