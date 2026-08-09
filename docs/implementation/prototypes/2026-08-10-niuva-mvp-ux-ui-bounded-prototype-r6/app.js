/* Prototype-only renderer. It never calls a production endpoint or provider. */
(function () {
  "use strict";

  const data = window.NiuvaPrototype;
  const isReviewPage = document.documentElement.dataset.page === "review";
  const logoHiddenEvidence = !isReviewPage && new URLSearchParams(window.location.search).get("identity") === "logo-hidden";
  const seedStorageKey = "niuva-r6-participant-seed";
  const reviewStorageKey = "niuva-r6-review-selection";
  const root = document.getElementById("frameRoot");
  const notice = document.getElementById("notice");
  const scenarioSelect = document.getElementById("scenarioSelect");
  const eventList = document.getElementById("eventList");
  const eventCount = document.getElementById("eventCount");
  const reviewRole = document.getElementById("reviewRole");
  const reviewFixture = document.getElementById("reviewFixture");
  const reviewFrame = document.getElementById("reviewFrame");
  const handoffButton = document.getElementById("handoffButton");
  const productNav = document.getElementById("productNav");
  const accountContext = document.getElementById("accountContext");
  const actionRegistry = new Map();
  let actionSequence = 0;

  const state = {
    mode: isReviewPage ? "review" : "participant",
    scenario: "SCN-B2B-01",
    frame: "WF-PUB-01",
    fixture: "FX-B2B-VALID",
    role: "Public prospect",
    notice: "",
    noticeTone: "",
    events: [],
    formAttempted: false,
    consent: false,
    configMode: "Simple",
    fulfillment: "delivery",
    reservationSeconds: 1800,
    reservationTimer: null,
    paymentState: "action-required",
    offerState: "active",
    checkoutAdjustment: 0,
    checkoutRevalidated: false,
    externalSource: "b2b",
    operatorCapability: "order_admin",
    authContext: null,
    operatorSession: false,
    focusTarget: null,
    b2bForm: {
      company: "",
      pic: "",
      email: "",
      phone: "",
      need: "",
      timeline: "",
      brief: ""
    },
    b2bErrors: {},
    afterSalesType: "revision",
    afterSalesNote: "",
    afterSalesAttempted: false,
    recoveryOrigin: null
  };

  const operatorRoles = ["order_admin", "sales_estimator", "manager_approver", "finance", "content_editor", "warehouse"];

  function safeSessionRead(key) {
    try {
      const value = window.sessionStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (_error) {
      return null;
    }
  }

  function safeSessionWrite(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      /* Session persistence is optional for this local-only prototype. */
    }
  }

  function clearPrototypePersistence() {
    try {
      window.sessionStorage.removeItem(seedStorageKey);
      window.sessionStorage.removeItem(reviewStorageKey);
    } catch (_error) {
      /* Reset remains safe when browser storage is unavailable. */
    }
  }

  function applyScenarioSeed(id) {
    const seeded = data.SCENARIOS[id];
    if (!seeded) return false;
    state.scenario = id;
    state.frame = seeded.frame;
    state.fixture = seeded.fixture;
    state.role = seeded.role;
    state.operatorSession = operatorRoles.includes(seeded.role);
    return true;
  }

  function hydratePageState() {
    if (isReviewPage) {
      const savedReview = safeSessionRead(reviewStorageKey);
      if (savedReview && data.SCENARIOS[savedReview.scenario]) applyScenarioSeed(savedReview.scenario);
      else applyScenarioSeed(state.scenario);
      return;
    }
    const seed = safeSessionRead(seedStorageKey);
    if (seed && seed.baseline === data.BASELINE && data.SCENARIOS[seed.scenario]) applyScenarioSeed(seed.scenario);
  }

  hydratePageState();
  if (logoHiddenEvidence) {
    document.documentElement.dataset.identityReview = "logo-hidden";
    state.frame = "WF-PUB-01";
    state.role = "Public prospect";
    state.operatorSession = false;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function currentMeta() {
    return data.FRAME_META[state.frame] || { label: state.frame, route: "Prototype frame", eyebrow: "Candidate frame" };
  }

  function scenario() {
    return data.SCENARIOS[state.scenario] || data.SCENARIOS["SCN-B2B-01"];
  }

  function button(label, action, attrs, variant) {
    const extra = attrs || {};
    const key = "action-" + (++actionSequence);
    actionRegistry.set(key, { action: action, payload: Object.assign({}, extra) });
    return '<button type="button" class="button ' + (variant || "button-primary") + '" data-action="dispatch" data-action-key="' + key + '">' + label + '</button>';
  }

  function badge(label, tone) {
    return '<span class="status-badge ' + (tone || "") + '">' + escapeHtml(label) + '</span>';
  }

  function frameHeader(title, description, eyebrow) {
    const meta = currentMeta();
    return '<header class="frame-header"><p class="context-line">' + escapeHtml(eyebrow || meta.eyebrow) + '</p><h1 id="frame-title" class="frame-title" tabindex="-1">' + escapeHtml(title || meta.label) + '</h1><p class="frame-description">' + escapeHtml(description || "Kondisi contoh ini berhenti sebelum tindakan nyata dijalankan.") + '</p></header>';
  }

  function layout(primary, secondary, single) {
    return '<div class="frame-grid' + (single ? ' single' : '') + '"><section class="stack">' + primary + '</section>' + (single ? '' : '<aside class="stack">' + secondary + '</aside>') + '</div>';
  }

  function footerContract() {
    return "";
  }

  function setNotice(message, tone) {
    state.notice = message || "";
    state.noticeTone = tone || "";
  }

  function queueFocus(selector) {
    state.focusTarget = selector || ".frame-title";
  }

  function isAdminFrame(frame) {
    return /^(WF-ADM-|WF-CMS-)/.test(frame || "");
  }

  function familyForFrame(frame) {
    if (/^(WF-PUB-|WF-B2B-|WF-EXT-)/.test(frame || "")) return "public";
    if (isAdminFrame(frame)) return "admin";
    return "retail";
  }

  function roleLabel(role) {
    const labels = {
      "Public prospect": "Pengunjung",
      "Authenticated customer": "Akun pelanggan",
      order_admin: "Operator pesanan",
      sales_estimator: "Estimator penjualan",
      manager_approver: "Manajer persetujuan",
      finance: "Keuangan",
      content_editor: "Editor konten",
      warehouse: "Pengelola stok"
    };
    return labels[role] || "Pengunjung";
  }

  function navItem(label, frame, active) {
    const current = active ? ' aria-current="page"' : "";
    const key = "nav-" + (++actionSequence);
    actionRegistry.set(key, { action: "product-nav", payload: { frame: frame } });
    return '<button type="button" class="product-nav-link' + (active ? ' is-active' : '') + '" data-action="dispatch" data-action-key="' + key + '"' + current + '>' + escapeHtml(label) + '</button>';
  }

  function renderProductNavigation() {
    if (!productNav || !accountContext) return;
    const family = familyForFrame(state.frame);
    let items;
    if (family === "public") {
      items = [
        ["Beranda", "WF-PUB-01", /^(WF-PUB-01)$/.test(state.frame)],
        ["Layanan", "WF-PUB-02", state.frame === "WF-PUB-02"],
        ["Konsultasi", "WF-B2B-01", /^(WF-B2B-|WF-EXT-)/.test(state.frame)],
        ["Retail", "WF-RET-01", false]
      ];
    } else if (family === "admin") {
      items = [
        ["Antrean", "WF-ADM-01", state.frame === "WF-ADM-01"],
        ["Request", "WF-ADM-02", state.frame === "WF-ADM-02"],
        ["Pesanan Retail", "WF-ADM-03", /^(WF-ADM-03|WF-ADM-04|WF-ADM-06)$/.test(state.frame)],
        ["Stok", "WF-ADM-05", state.frame === "WF-ADM-05"],
        ["Konten", "WF-CMS-01", state.frame === "WF-CMS-01"]
      ];
    } else {
      items = [
        ["Retail", "WF-RET-01", state.frame === "WF-RET-01"],
        ["Konfigurasi", "WF-CFG-01", /^(WF-CFG-|WF-REQ-|WF-OFFER-)/.test(state.frame)],
        ["Keranjang", "WF-CART-01", /^(WF-CART-|WF-CHK-|WF-PAY-)/.test(state.frame)],
        ["Pesanan", "WF-DASH-01", /^(WF-ORD-|WF-AFS-|WF-DASH-|WF-NOTIF-|WF-OWN-|WF-LEGACY-)/.test(state.frame)]
      ];
    }
    productNav.innerHTML = items.map(function (item) { return navItem(item[0], item[1], item[2]); }).join("");
    accountContext.textContent = family === "public" ? "Partnership dan Retail" : roleLabel(state.role);
  }

  function navMatches(frame, navFrame) {
    if (navFrame === "WF-PUB-01") return /^(WF-PUB-)/.test(frame || "");
    if (navFrame === "WF-RET-01") return /^(WF-RET-|WF-CART-|WF-AUTH-|WF-CFG-)/.test(frame || "");
    if (navFrame === "WF-REQ-01") return /^(WF-REQ-|WF-OFFER-|WF-B2B-|WF-EXT-)/.test(frame || "");
    if (navFrame === "WF-CHK-01") return /^(WF-CHK-|WF-PAY-)/.test(frame || "");
    if (navFrame === "WF-ORD-01") return /^(WF-ORD-|WF-AFS-|WF-DASH-|WF-NOTIF-|WF-OWN-SAFE|WF-LEGACY-)/.test(frame || "");
    if (navFrame === "WF-ADM-01") return isAdminFrame(frame);
    return frame === navFrame;
  }

  function b2bValidation() {
    const errors = {};
    const form = state.b2bForm;
    if (!form.pic.trim()) errors.pic = "Nama PIC wajib diisi.";
    if (!form.email.trim()) errors.email = "Email PIC wajib diisi.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Masukkan email yang valid.";
    if (!form.phone.trim()) errors.phone = "Nomor WhatsApp PIC wajib diisi.";
    if (!form.need.trim()) errors.need = "Kebutuhan wajib dijelaskan singkat.";
    if (!form.brief.trim()) errors.brief = "Brief singkat wajib diisi.";
    if (!state.consent) errors.consent = "Persetujuan privasi wajib dicentang.";
    return errors;
  }

  function b2bInput(id, label, type, placeholder, required, error) {
    const value = escapeHtml(state.b2bForm[id]);
    const invalid = Boolean(error);
    const describedBy = invalid ? ' aria-describedby="' + id + '-error"' : "";
    return '<div class="field"><label for="' + id + '">' + label + (required ? ' <span aria-hidden="true">*</span>' : "") + '</label><input id="' + id + '" type="' + (type || "text") + '" value="' + value + '" placeholder="' + placeholder + '" data-field="b2b-' + id + '"' + (required ? " required" : "") + (invalid ? ' aria-invalid="true"' : "") + describedBy + ' />' + (invalid ? '<p class="field-error" id="' + id + '-error" role="alert">' + escapeHtml(error) + '</p>' : "") + '</div>';
  }

  function b2bTextarea(id, label, placeholder, required, error) {
    const value = escapeHtml(state.b2bForm[id]);
    const invalid = Boolean(error);
    const describedBy = invalid ? ' aria-describedby="' + id + '-error"' : "";
    return '<div class="field full"><label for="' + id + '">' + label + (required ? ' <span aria-hidden="true">*</span>' : "") + '</label><textarea id="' + id + '" placeholder="' + placeholder + '" data-field="b2b-' + id + '"' + (required ? " required" : "") + (invalid ? ' aria-invalid="true"' : "") + describedBy + '>' + value + '</textarea>' + (invalid ? '<p class="field-error" id="' + id + '-error" role="alert">' + escapeHtml(error) + '</p>' : "") + '</div>';
  }

  function logEvent(type, detail) {
    state.events.unshift({ type: type, detail: detail, at: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
  }

  function resetTimer() {
    if (state.reservationTimer) window.clearInterval(state.reservationTimer);
    state.reservationTimer = null;
  }

  function resetScenario() {
    resetTimer();
    const scn = scenario();
    state.frame = scn.frame;
    state.fixture = scn.fixture;
    state.role = scn.role;
    state.formAttempted = false;
    state.consent = false;
    state.configMode = "Simple";
    state.fulfillment = "delivery";
    state.reservationSeconds = 1800;
    state.paymentState = "action-required";
    state.offerState = "active";
    state.checkoutAdjustment = 0;
    state.checkoutRevalidated = false;
    state.externalSource = "b2b";
    state.authContext = null;
    state.operatorSession = operatorRoles.includes(state.role);
    state.focusTarget = null;
    state.b2bForm = { company: "", pic: "", email: "", phone: "", need: "", timeline: "", brief: "" };
    state.b2bErrors = {};
    state.afterSalesType = "revision";
    state.afterSalesNote = "";
    state.afterSalesAttempted = false;
    state.recoveryOrigin = null;
    state.events = [];
    if (isReviewPage) safeSessionWrite(reviewStorageKey, { scenario: state.scenario });
    setNotice(isReviewPage ? "Scenario dikembalikan ke seed sintetis." : "Kondisi tugas dikembalikan ke awal.", "");
    logEvent("scenario.reset", scn.id);
    render();
  }

  function selectScenario(id) {
    if (!data.SCENARIOS[id]) return;
    state.scenario = id;
    safeSessionWrite(reviewStorageKey, { scenario: id });
    resetScenario();
    setNotice("Review Mode memilih " + id + "; handoff operator dilakukan sebelum task action.", "");
    render();
  }

  function findTransition(id) {
    return data.TRANSITIONS.find(function (item) { return item.id === id; }) || { id: id, to: state.frame, label: id, safe: true };
  }

  function applyTransition(id, explicitTo) {
    const transition = findTransition(id);
    const to = explicitTo || transition.to || state.frame;
    if (isAdminFrame(to) && state.mode !== "review" && !state.operatorSession) {
      setNotice("Area operasi hanya tersedia bagi operator dengan kewenangan yang sesuai.", "error");
      logEvent("navigation.blocked", id + " → " + to);
      queueFocus("#notice");
      return render();
    }
    queueFocus(".frame-title");
    if (id === "PT-PAY-02") state.paymentState = "uncertain";
    if (id === "PT-PAY-03") state.paymentState = "terminal";
    if (id === "PT-OFFER-01") state.offerState = "accepted";
    if (id === "PT-OFFER-05") state.offerState = "declined";
    if (id === "PT-CHK-02") {
      state.checkoutAdjustment = 2000;
      state.checkoutRevalidated = false;
    }
    if (id === "PT-CHK-01") state.checkoutRevalidated = true;
    if (id === "PT-RES-03") state.reservationSeconds = 0;
    if (id === "PT-CHK-03") state.fulfillment = "fallback";
    if (id === "PT-AUTH-01" || id === "PT-CART-01" || id === "PT-AUTH-02") state.authContext = "cart";
    if (id === "PT-AUTH-04" || id === "PT-AUTH-05") state.authContext = "config";
    if (id === "PT-CHK-05") state.fulfillment = "pickup";
    if (id === "PT-ADM-10") setNotice("Transaksi tidak tersedia. Data tetap tidak berubah; muat ulang atau hubungi bantuan. Tidak ada status berhasil palsu.", "error");
    else if (id === "PT-CHK-04") setNotice("Checkout belum dibuat. Draft tetap tersimpan tanpa pesanan, pembayaran, atau reservasi parsial.", "error");
    else if (id === "PT-CFG-03") setNotice("Request tersimpan tanpa membuat pesanan, reservasi, pembayaran, atau total checkout.", "success");
    else if (id === "PT-PAY-02") setNotice("Hasil belum diketahui. Periksa status; tidak ada tombol bayar ulang.", "warning");
    else if (id === "PT-OFFER-05") setNotice("Offer ditolak dan keputusan tercatat. Tidak ada Offer baru atau tombol pembayaran yang muncul diam-diam.", "warning");
    else if (id === "PT-EXT-01") setNotice("WhatsApp dibuka oleh pengguna. Tidak ada pesan otomatis atau perubahan Inquiry.", "success");
    else setNotice("Tampilan berikutnya siap. Data tetap berupa simulasi.", "");
    state.frame = to;
    state.fixture = state.fixture || scenario().fixture;
    logEvent("transition", id + " → " + to);
    render();
  }

  function startReservationTimer() {
    resetTimer();
    if (state.reservationSeconds <= 0 || state.frame !== "WF-PAY-01") return;
    state.reservationTimer = window.setInterval(function () {
      if (state.mode !== "participant" && state.mode !== "review") return;
      if (state.reservationSeconds > 0) state.reservationSeconds -= 1;
      if (state.reservationSeconds <= 0) {
        resetTimer();
        setNotice("Reservasi expired. Revalidasi baru diperlukan; reservasi lama tidak diaktifkan kembali.", "warning");
        render();
      } else if (state.reservationSeconds === 300) {
        setNotice("Peringatan lima menit: tidak ada perpanjangan otomatis.", "warning");
        render();
      }
    }, 1000);
  }

  function money(amount) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  }

  function commercialSnapshot() {
    const acceptedOffer = state.offerState === "accepted";
    const customOrder = acceptedOffer || /^FX-ORDER-CUSTOM-/.test(state.fixture);
    if (acceptedOffer) {
      return {
        kind: "offer",
        icon: "3D",
        name: "Cetak assembly-large.3mf",
        meta: "PLA · multicolor · ETA 5–7 hari kerja · Harga sesuai Offer",
        itemTotal: 185000
      };
    }
    if (customOrder) {
      return {
        kind: "custom",
        icon: "3D",
        name: "Cetak assembly-large.3mf",
        meta: "Custom 3D Print · spesifikasi tersimpan",
        itemTotal: 45000
      };
    }
    return {
      kind: "ready",
      icon: "M",
      name: "Miniatur Niuva",
      meta: "Produk siap · 1 unit",
      itemTotal: 45000
    };
  }

  function fulfillmentCost() {
    return state.fulfillment === "pickup" ? 0 : 18000;
  }

  function committedTotal() {
    return commercialSnapshot().itemTotal + fulfillmentCost() + state.checkoutAdjustment;
  }

  function timeLabel() {
    if (state.reservationSeconds <= 0) return "EXPIRED";
    const minutes = Math.floor(state.reservationSeconds / 60).toString().padStart(2, "0");
    const seconds = (state.reservationSeconds % 60).toString().padStart(2, "0");
    return minutes + ":" + seconds;
  }

  function renderPublicHome() {
    return frameHeader("Dari kebutuhan menjadi objek yang dapat diuji.", "Niuva menyatukan riset, desain, dan proses pembuatan objek 3D tanpa mencampur jalur konsultasi dengan transaksi Retail.", "Riset · desain · produksi") + '<section class="hero-card"><h2>Buat keputusan lebih jelas sebelum benda dibuat.</h2><div class="public-process" aria-label="Alur kebutuhan hingga objek"><span>Kebutuhan</span><span>File</span><span>Keputusan</span><span>Objek</span></div><p>Mulai dengan konsultasi partnership atau lanjutkan ke Custom 3D Print dan produk siap beli. Setiap langkah menjaga konteks yang sama sampai hasil fisik.</p><div class="actions">' + button("Bahas kebutuhan", "transition", { transition: "PT-PUB-01", to: "WF-PUB-02" }) + button("Jelajahi Retail", "transition", { transition: "PT-PUB-04", to: "WF-RET-01" }, "button-secondary") + '</div></section><section class="project-evidence" aria-label="Bukti proyek Niuva"><figure><img src="assets/projects/pindad-ev-motor.webp" width="555" height="414" alt="Proyek motor listrik Pindad yang menjadi bukti proses desain menuju objek fisik" /><figcaption>Pindad EV Motor · pengembangan dari kebutuhan teknis menuju bentuk yang dapat diuji</figcaption></figure><figure><img src="assets/projects/agate-motorcycle-simulator.webp" width="387" height="553" alt="Simulator sepeda motor Agate sebagai contoh prototipe interaktif" /><figcaption>Agate Motorcycle Simulator · prototipe untuk menguji pengalaman sebelum produksi lanjutan</figcaption></figure></section><section class="capability-grid" aria-label="Layanan Niuva"><article class="capability-card"><span class="capability-index">Eksplorasi</span><h3>Research &amp; Development</h3><p>Mengurai kebutuhan, material, bentuk, dan risiko sebelum keputusan produksi.</p></article><article class="capability-card"><span class="capability-index">Partnership</span><h3>Consultant &amp; Workshop</h3><p>Inquiry tercatat dan ditinjau manusia; percakapan WhatsApp tetap pilihan Anda.</p></article><article class="capability-card"><span class="capability-index">Pembuatan</span><h3>Design, Prototyping &amp; Retail</h3><p>Konfigurasi cetak 3D dan produk siap beli memakai alur transaksi yang terpisah.</p></article></section>';
  }

  function renderCapabilities() {
    return frameHeader("Pilih jalur sesuai keputusan yang ingin dibuat.", "Form konsultasi menjadi jalur utama untuk kebutuhan partnership. WhatsApp adalah pilihan cepat yang dimulai secara sadar oleh pengguna.", "Layanan Niuva") + layout('<section class="capability-grid"><article class="capability-card"><span class="capability-index">Tercatat</span><h3>Form konsultasi</h3><p>Isi kebutuhan, target waktu, dan brief. Inquiry baru tercatat setelah form berhasil dikirim.</p><div class="actions">' + button("Buka form konsultasi", "transition", { transition: "PT-PUB-02", to: "WF-B2B-01" }) + '</div></article><article class="capability-card"><span class="capability-index">Pilihan cepat</span><h3>WhatsApp</h3><p>Anda menentukan kapan percakapan eksternal dibuka. Tindakan ini tidak menggantikan Inquiry.</p><div class="actions">' + button("Tinjau sebelum ke WhatsApp", "external-source", { source: "public" }, "button-secondary") + '</div></article><article class="capability-card"><span class="capability-index">Transaksional</span><h3>Retail</h3><p>Produk siap beli dan Custom 3D Print berjalan tanpa mencampur lifecycle B2B.</p><div class="actions">' + button("Jelajahi Retail", "transition", { transition: "PT-PUB-05", to: "WF-RET-01" }, "button-secondary") + '</div></article></section>', '<aside class="card pad soft"><p class="context-line">Target respons manusia</p><span class="lead-number">Maks. 1 hari kerja</span><p>Senin–Jumat, 09.00–17.00 WIB, hari libur dikecualikan. Target ini bukan janji quotation, harga, ETA, atau pengiriman.</p></aside>');
  }

  function renderB2BForm() {
    const errors = state.b2bErrors;
    const invalid = state.formAttempted && Object.keys(errors).length > 0;
    const persistenceFailure = state.fixture === "FX-B2B-PERSISTENCE-FAIL" && state.formAttempted && !invalid;
    const errorSummary = invalid ? '<div id="b2bError" class="notice-card error-summary" role="alert" tabindex="-1"><div><strong>Periksa ' + Object.keys(errors).length + ' bagian sebelum mengirim.</strong><p>Tidak ada Inquiry dibuat ketika data wajib belum lengkap. Nilai yang sudah diisi tetap dipertahankan.</p><ul class="plain-list">' + Object.keys(errors).map(function (key) { return '<li><a href="#' + key + '">' + escapeHtml(errors[key]) + '</a></li>'; }).join("") + '</ul></div></div>' : "";
    const persistenceNotice = persistenceFailure ? '<div id="b2bPersistenceError" class="notice-card error-summary" role="alert" tabindex="-1"><div><strong>Inquiry belum tersimpan.</strong><p>Terjadi gangguan penyimpanan simulasi. Tidak ada UUID atau acknowledgement palsu; data Anda tetap tersedia untuk dicoba lagi.</p><div class="actions">' + button("Coba simpan lagi", "b2b-retry") + '</div></div></div>' : "";
    const consentError = errors.consent ? '<p class="field-error" id="consent-error" role="alert">' + escapeHtml(errors.consent) + '</p>' : "";
    return frameHeader("Ceritakan apa yang perlu dibuat.", "Form publik tanpa login untuk kebutuhan B2B dan partnership. Mengirim form membuat Inquiry; WhatsApp tidak pernah terkirim otomatis.", "Konsultasi B2B dan partnership") + layout('<div class="card pad">' + errorSummary + persistenceNotice + '<div class="form-grid" style="margin-top:' + ((invalid || persistenceFailure) ? '.9rem' : '0') + '">' + b2bInput("company", "Perusahaan / organisasi", "text", "Contoh: Studio Arunika", false, errors.company) + b2bInput("pic", "Nama PIC", "text", "Nama lengkap", true, errors.pic) + b2bInput("email", "Email PIC", "email", "nama@contoh.id", true, errors.email) + b2bInput("phone", "Nomor WhatsApp PIC", "tel", "08xx xxxx xxxx", true, errors.phone) + b2bInput("need", "Kebutuhan", "text", "Prototipe, workshop, merchandise…", true, errors.need) + b2bInput("timeline", "Target waktu", "text", "Contoh: kuartal 4 2026", false, errors.timeline) + b2bTextarea("brief", "Brief singkat", "Ceritakan konteks, jumlah, atau tujuan Anda.", true, errors.brief) + '</div><div class="consent' + (errors.consent ? ' has-error' : '') + '" style="margin-top:1rem"><input id="consent" type="checkbox" ' + (state.consent ? 'checked' : '') + ' data-action="consent"' + (errors.consent ? ' aria-invalid="true" aria-describedby="consent-error"' : '') + ' /><label for="consent">Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan untuk marketing tanpa persetujuan terpisah.</label>' + consentError + '</div><div class="actions">' + button("Kirim Inquiry", "submit-b2b") + button("WhatsApp cepat", "external-source", { source: "public" }, "button-secondary") + '</div><p class="muted" style="font-size:.72rem">* Nama PIC, email, nomor WhatsApp, kebutuhan, brief, dan persetujuan wajib. Perusahaan dan target waktu dapat dilengkapi bila relevan. Unggah file publik belum tersedia.</p></div>', '<aside class="card pad soft"><p class="context-line">Sebelum mengirim</p><h3>Yang terjadi setelah form berhasil</h3><ol class="plain-list"><li>Inquiry tersimpan dengan status baru.</li><li>Referensi Inquiry ditampilkan pada halaman konfirmasi.</li><li>Anda dapat memilih WhatsApp secara manual.</li></ol><div class="divider"></div><p class="muted">Respons manusia pertama: maksimal satu hari kerja sesuai kalender Niuva Operations.</p></aside>');
  }

  function renderB2BAcknowledgement() {
    return frameHeader("Inquiry Anda sudah tercatat.", "Konfirmasi yang tahan lama sudah tersedia. WhatsApp adalah pilihan lanjutan, bukan pengganti catatan Inquiry.", "Konfirmasi konsultasi") + layout('<section class="card pad success"><p class="context-line">Inquiry tersimpan</p><h3>Terima kasih, kami sudah menerima brief Anda.</h3><p>Operator Niuva Operations akan meninjau kebutuhan ini dan menghubungi Anda sesuai kalender kerja.</p><div class="notice-card" style="margin-top:1rem"><div><strong>INQ-DEMO-001</strong><p>Status baru · referensi dapat digunakan saat menghubungi Niuva.</p></div></div><div class="actions">' + button("Buka WhatsApp", "transition", { transition: "PT-B2B-03", to: "WF-EXT-01" }) + button("Kembali ke layanan", "transition", { transition: "PT-EXT-03", to: "WF-PUB-02" }, "button-secondary") + '</div></section>', '<aside class="card pad"><p class="context-line">Target respons</p><span class="lead-number">Maks. 1 hari kerja</span><p>Senin–Jumat, 09.00–17.00 WIB, hari libur dikecualikan. Bukan janji quotation atau ETA.</p></aside>');
  }

  function renderExternal() {
    const publicSource = state.externalSource === "public";
    return frameHeader("Lanjut ke WhatsApp?", "Periksa tujuan sebelum membuka percakapan eksternal. Tidak ada pesan yang dikirim otomatis.", "Konfirmasi tindakan eksternal") + '<div class="safe-boundary"><div><h2>' + (publicSource ? "WhatsApp dari halaman layanan" : "WhatsApp setelah Inquiry") + '</h2><p>Tujuan mengikuti pengaturan publik Niuva. Inquiry yang sudah dikirim tetap tercatat terpisah.</p><div class="actions" style="justify-content:center">' + button("Lanjutkan ke WhatsApp", "external-handoff") + button("Batal", "transition", { transition: publicSource ? "PT-EXT-02" : "PT-EXT-03", to: publicSource ? "WF-PUB-02" : "WF-B2B-02" }, "button-secondary") + '</div></div></div>';
  }

  function renderRetail() {
    return frameHeader("Pilih objek siap beli atau tentukan spesifikasi cetak.", "Katalog produk dan jasa Custom 3D Print berada pada satu area Retail, tetapi harga, stok, dan jalur komitmennya tetap dibaca per item.", "Retail Niuva") + layout('<section class="card pad"><div class="cart-line"><div class="line-main"><div class="line-icon" aria-hidden="true">RP</div><div><strong>Miniatur Niuva</strong><span>Produk siap beli · stok tersedia · pickup atau delivery</span></div></div><span class="line-price">' + money(45000) + '</span></div><div class="actions">' + button("Tambah Miniatur ke keranjang", "transition", { transition: "PT-RET-01", to: "WF-CART-01" }) + '</div><div class="cart-line" style="margin-top:1rem"><div class="line-main"><div class="line-icon" aria-hidden="true">3D</div><div><strong>Custom 3D Print</strong><span>File privat · estimasi gram dan waktu · sebagian kombinasi perlu review</span></div></div><span class="status-badge">sesuai spesifikasi</span></div><div class="actions">' + button("Mulai konfigurasi cetak", "transition", { transition: "PT-AUTH-04", to: "WF-AUTH-01" }, "button-secondary") + '</div></section>', '<aside class="card pad soft"><p class="context-line">Cara membaca Retail</p><h3>Harga mengikuti objek dan jalur komitmen.</h3><div class="result-value"><span>Produk siap beli</span><strong>Harga per produk</strong></div><div class="result-value"><span>Custom Print eligible</span><strong>Harga otomatis</strong></div><div class="result-value"><span>Kombinasi khusus</span><strong>Review dan Offer</strong></div><p>Transaksi, provider, dan stok nyata belum diaktifkan pada pratinjau ini.</p></aside>');
  }

  function renderCart() {
    return frameHeader("Keranjang sebelum komitmen.", "Keranjang masih berupa draft. Item yang dapat dibayar langsung dan item yang perlu review tidak digabung menjadi satu total.", "Keranjang Retail") + layout('<section class="card pad"><div class="cart-line"><div class="line-main"><div class="line-icon" aria-hidden="true">RP</div><div><strong>Miniatur Niuva</strong><span>Produk siap beli · jumlah 1 · pickup atau delivery</span></div></div><span class="line-price">' + money(45000) + '</span></div><div class="cart-line"><div class="line-main"><div class="line-icon" aria-hidden="true">3D</div><div><strong>Custom Print perlu review</strong><span>File versi 3 · Request belum dibuat</span></div></div><span class="status-badge warning">perlu review</span></div><div class="actions">' + button("Lanjutkan item siap bayar", "transition", { transition: "PT-CART-01", to: "WF-AUTH-01" }) + button("Pisahkan kedua jalur", "transition", { transition: "PT-CART-03", to: "WF-CART-01" }, "button-secondary") + '</div></section>', '<aside class="card pad warning"><p class="context-line">Belum ada komitmen</p><h3>Total checkout belum dibuat.</h3><p>Referensi Request baru muncul setelah pemisahan yang jelas. Keranjang bukan reservasi dan tidak menampilkan biaya internal atau margin.</p></aside>');
  }

  function renderAuth() {
    return frameHeader("Masuk untuk melanjutkan tugas privat.", "Konteks yang tidak sensitif tetap dipertahankan; file, analisis, checkout, dan pesanan hanya tampil kepada pemilik akun.", "Batas akun") + layout('<section class="card pad"><div class="stack"><div class="field"><label for="auth-email">Email</label><input id="auth-email" type="email" placeholder="pelanggan@simulasi.id" /></div><div class="field"><label for="auth-password">Kata sandi</label><input id="auth-password" type="password" placeholder="••••••••" /></div><div class="notice-card"><div><strong>Pembuatan akun belum tersedia</strong><p>Tugas ini memakai akun contoh yang sudah terautentikasi; tidak ada tindakan pendaftaran nyata.</p></div></div><div class="actions">' + button("Masuk dengan akun contoh", "auth-success") + button("Pulihkan akun", "auth-recover", {}, "button-secondary") + '</div></div></section>', '<aside class="card pad soft"><p class="context-line">Kelanjutan tugas</p><h3>' + escapeHtml(state.authContext === "config" ? "Kembali ke konfigurasi" : "Kembali ke keranjang atau pesanan") + '</h3><p>Data privat tidak ditampilkan sebelum kepemilikan terverifikasi. Masuk tidak memperpanjang reservasi.</p></aside>');
  }

  function renderConfigurator(step) {
    const stepClass = step === "result" ? "is-done" : "is-active";
    if (step === "analysis") {
      const recoveryVisible = state.fixture === "FX-CUSTOM-RECOVERY";
      const quoteRequired = state.fixture === "FX-CUSTOM-QUOTE";
      const recovery = recoveryVisible ? '<div class="notice-card error-summary" role="alert" style="margin-top:1rem"><div><strong>Pilih pemulihan yang aman</strong><p>File asli tetap dipertahankan sebagai konteks. Pilih satu langkah berikutnya.</p><div class="actions">' + button("Ganti file", "config-replace", {}, "button-secondary") + button("Coba analisis lagi", "config-retry") + button("Kirim untuk review", "transition", { transition: "PT-CFG-06", to: "WF-REQ-01" }, "button-secondary") + '</div></div></div>' : '';
      const eligibleAction = !recoveryVisible && !quoteRequired ? button("Gunakan hasil yang memenuhi syarat", "transition", { transition: "PT-CFG-02", to: "WF-CFG-03" }) : "";
      const reviewAction = quoteRequired ? button("Kirim ke review quote", "transition", { transition: "PT-CFG-06", to: "WF-REQ-01" }, "button-secondary") : recoveryVisible ? "" : button("Kirim untuk review", "transition", { transition: "PT-CFG-06", to: "WF-REQ-01" }, "button-secondary");
      const failureNotice = quoteRequired ? '<div class="notice-card warning" role="status" style="margin-top:1rem"><div><strong>Komitmen otomatis belum tersedia.</strong><p>Hasil ini harus masuk review quote; tidak ada perkiraan harga, Order, reservasi, atau pembayaran.</p></div></div>' : "";
      const recoveryControl = recoveryVisible ? '<span class="status-badge danger">Pemulihan diperlukan</span>' : button("Lihat pilihan pemulihan", "config-failure", {}, "button-danger");
      return frameHeader("Periksa model privat Anda.", "Analisis file memakai data contoh. File yang tidak didukung, terlalu besar, atau gagal dianalisis selalu memiliki pilihan pemulihan yang aman.", "Custom 3D Print") + '<section class="card pad"><div class="stepper"><div class="step is-done"><span class="step-number">1</span> Siapkan</div><div class="step ' + stepClass + '"><span class="step-number">2</span> Analisis</div><div class="step"><span class="step-number">3</span> Hasil</div><div class="step"><span class="step-number">4</span> Tinjau</div></div><div class="file-drop"><div><div class="file-icon">3MF</div><strong>assembly-large.3mf</strong><p>Versi 3 · hasil analisis contoh siap</p><div class="actions" style="justify-content:center">' + eligibleAction + reviewAction + '</div></div></div><div class="actions">' + recoveryControl + '</div>' + failureNotice + recovery + '</section>';
    }
    return frameHeader("Tentukan spesifikasi Custom 3D Print.", "Pilih pengaturan sederhana atau terperinci. Model dan parameter memakai data contoh; tidak ada unggah, slicer, atau profil mesin nyata.", "Custom 3D Print") + layout('<section class="card pad"><div class="stepper"><div class="step ' + (step === "setup" ? "is-active" : "is-done") + '"><span class="step-number">1</span> Siapkan</div><div class="step"><span class="step-number">2</span> Analisis</div><div class="step"><span class="step-number">3</span> Hasil</div><div class="step"><span class="step-number">4</span> Tinjau</div></div><h3>Mode pengaturan</h3><div class="option-row"><label class="option ' + (state.configMode === "Simple" ? "is-selected" : "") + '"><input type="radio" name="config" value="Simple" ' + (state.configMode === "Simple" ? "checked" : "") + ' data-action="config-mode" /> Sederhana</label><label class="option ' + (state.configMode === "Detailed" ? "is-selected" : "") + '"><input type="radio" name="config" value="Detailed" ' + (state.configMode === "Detailed" ? "checked" : "") + ' data-action="config-mode" /> Terperinci</label></div><div class="divider"></div><div class="file-drop"><div><div class="file-icon">3MF</div><strong>Pilih file model contoh</strong><p>Area privat · kepemilikan akun diperlukan</p><div class="actions" style="justify-content:center">' + button("Gunakan file contoh", "transition", { transition: "PT-CFG-01", to: "WF-CFG-02" }) + '</div></div></div></section>', '<aside class="card pad soft"><p class="context-line">Spesifikasi saat ini</p><div class="result-value"><span>Material</span><strong>PLA</strong></div><div class="result-value"><span>Warna</span><strong>Satu warna</strong></div><div class="result-value"><span>Pengaturan</span><strong>' + escapeHtml(state.configMode === "Simple" ? "Sederhana" : "Terperinci") + '</strong></div><div class="result-value"><span>Pemilik</span><strong>Akun pelanggan</strong></div></aside>');
  }

  function renderResult() {
    return frameHeader("Hasil yang dapat diperiksa sebelum lanjut.", "Cabang otomatis menampilkan gram, waktu mesin, komponen harga, rentang ETA, dan versi harga. Kombinasi yang perlu review tidak menampilkan total perkiraan.", "Hasil Custom 3D Print") + layout('<section class="card pad"><div class="stepper"><div class="step is-done"><span class="step-number">1</span> Siapkan</div><div class="step is-done"><span class="step-number">2</span> Analisis</div><div class="step is-active"><span class="step-number">3</span> Hasil</div><div class="step"><span class="step-number">4</span> Tinjau</div></div><div class="cluster"><span class="status-badge success">dapat dihitung</span></div><div class="stack-tight" style="margin-top:1rem"><div class="result-value"><span>File</span><strong>bracket-demo-v3.stl · versi 3</strong></div><div class="result-value"><span>Material dan berat</span><strong>PLA · 92 g</strong></div><div class="result-value"><span>Waktu mesin</span><strong>3 jam 42 menit</strong></div><div class="result-value"><span>Jasa cetak</span><strong>' + money(46000) + '</strong></div><div class="result-value"><span>Rentang ETA</span><strong>3–5 hari kerja</strong></div><div class="result-value"><span>Versi harga</span><strong>PRICE-v2</strong></div></div><div class="actions">' + button("Masukkan hasil ke keranjang", "transition", { transition: "PT-CFG-05", to: "WF-CART-01" }) + button("Tinjau jalur review", "transition", { transition: "PT-CFG-03", to: "WF-REQ-01" }, "button-secondary") + '</div></section>', '<aside class="card pad warning"><p class="context-line">Aturan pembulatan</p><h3>Hanya total akhir.</h3><p>Berat dan durasi tetap memakai presisi hasil analisis. Hanya nominal total dibulatkan ke rupiah terdekat.</p><div class="divider"></div><p class="muted">Pajak, finishing, listrik, QC, pelepasan support, dan risiko gagal cetak sudah termasuk sesuai keputusan bisnis saat ini.</p></aside>');
  }

  function renderRequest() {
    const partnership = state.scenario.indexOf("B2B") >= 0 || state.scenario.indexOf("ROUTING") >= 0;
    const primaryAction = partnership
      ? button("Teruskan sebagai Inquiry B2B", "transition", { transition: "PT-REQ-02", to: "WF-ADM-02" })
      : button("Siapkan draft Offer", "transition", { transition: "PT-REQ-03", to: "WF-ADM-02" });
    const nextTitle = partnership ? "Inquiry B2B tetap terpisah" : "Offer Retail berbantuan";
    const nextCopy = partnership
      ? "Inquiry baru menyimpan referensi Request sebagai asal, tetapi tetap memiliki status dan riwayat sendiri."
      : "Estimator menyiapkan draft; manajer harus menyetujui versi tersebut sebelum dapat dilihat pelanggan.";
    return frameHeader(
      partnership ? "Teruskan pekerjaan tanpa mencampur alurnya." : "Request Anda sudah tersimpan.",
      "Request, Offer, Order, dan Inquiry memiliki status serta riwayat yang berbeda.",
      "Request untuk ditinjau"
    ) + layout(
      '<section class="card pad"><div class="cluster"><span class="status-badge success">tersimpan</span><span class="route-tag">REQ-DEMO-001</span></div><h3 style="margin-top:.8rem">Review Custom 3D Print</h3><div class="result-value"><span>Sumber</span><strong>Custom 3D Print · versi 3</strong></div><div class="result-value"><span>Alasan</span><strong>Perlu review harga</strong></div><div class="result-value"><span>Komitmen</span><strong>Belum ada pesanan atau pembayaran</strong></div><p>Referensi dibuat setelah Anda memilih jalur review. Belum ada harga perkiraan atau ETA yang dijanjikan.</p><div class="actions">' + primaryAction + button("Periksa batas kepemilikan", "transition", { transition: "PT-OWN-01", to: "WF-OWN-SAFE" }, "button-secondary") + '</div></section>',
      '<aside class="card pad soft"><span class="eyebrow">Tindakan berikutnya</span><h3>' + nextTitle + '</h3><p>' + nextCopy + '</p><div class="divider"></div><p class="muted">Perubahan status selalu menyimpan aktor dan versi.</p></aside>'
    );
  }

  function renderOffer() {
    const declined = state.offerState === "declined";
    const decisionArea = declined
      ? '<div class="notice-card" style="margin-top:1rem"><div><strong>Offer ditolak</strong><p>Request tetap tersimpan sebagai sumber riwayat. Tidak ada Offer baru yang dibuat diam-diam.</p></div></div>'
      : '<div class="actions">' + button("Terima dan tinjau", "transition", { transition: "PT-OFFER-01", to: "WF-OFFER-02" }) + button("Tolak Offer", "transition", { transition: "PT-OFFER-05", to: "WF-OFFER-02" }, "button-secondary") + '</div>';
    return frameHeader(
      declined ? "Keputusan penolakan sudah dicatat." : "Periksa Offer sebelum checkout.",
      "Offer menyimpan versi, masa berlaku, harga, file, dan ETA sebagai satu snapshot. Menerima Offer belum membuat pesanan atau pembayaran.",
      "Offer Retail berbantuan"
    ) + layout(
      '<section class="card pad ' + (declined ? "warning" : "") + '"><div class="cluster">' + badge(declined ? "ditolak" : "menunggu keputusan", declined ? "warning" : "success") + '<span class="route-tag">OFF-DEMO-001 · v2</span></div><h3 style="margin-top:.8rem">Cetak assembly-large.3mf</h3><div class="result-value"><span>Spesifikasi</span><strong>PLA · multicolor</strong></div><div class="result-value"><span>Harga sesuai Offer</span><strong>' + money(185000) + '</strong></div><div class="result-value"><span>Rentang ETA</span><strong>5–7 hari kerja</strong></div><div class="result-value"><span>Berlaku sampai</span><strong>30 Agustus 2026 · 17.00 WIB</strong></div>' + decisionArea + '</section>',
      '<aside class="card pad warning"><span class="eyebrow">Batas persetujuan</span><h3>Sudah disetujui manajer</h3><p>Estimator menyiapkan draft, lalu manajer menerbitkan versi yang dapat dilihat pelanggan. Aktor dan versi tetap tercatat.</p></aside>'
    );
  }

  function renderOfferResult() {
    const accepted = state.offerState !== "declined";
    return frameHeader("Status Offer tercatat dengan jelas.", "Diterima, ditolak, kedaluwarsa, dan digantikan adalah status berbeda. Hanya versi aktif yang sudah disetujui dapat lanjut.", "Hasil keputusan Offer") + '<section class="card pad"><div class="metric-grid"><div class="metric-card"><span class="metric-label">Keputusan</span><strong class="metric-value">' + (accepted ? "Diterima" : "Ditolak") + '</strong></div><div class="metric-card"><span class="metric-label">Pesanan</span><strong class="metric-value">Belum dibuat</strong></div><div class="metric-card"><span class="metric-label">Reservasi</span><strong class="metric-value">Belum dibuat</strong></div></div><div class="notice-card" style="margin-top:1rem"><div><strong>Snapshot terlindungi</strong><p>Checkout akan memeriksa ulang harga, file, ETA, dan ketersediaan sebelum membuat komitmen.</p></div></div><div class="actions">' + (accepted ? button("Lanjut ke pemeriksaan checkout", "transition", { transition: "PT-OFFER-02", to: "WF-CHK-01" }) : button("Kembali ke Request", "transition", { transition: "PT-OFFER-05", to: "WF-REQ-01" })) + button("Periksa versi yang berubah", "transition", { transition: "PT-OFFER-04", to: "WF-REQ-01" }, "button-secondary") + '</div></section>';
  }

  function renderCheckout() {
    const stale = state.frame === "WF-CHK-02";
    const snapshot = commercialSnapshot();
    const itemTotal = snapshot.itemTotal;
    const delivery = fulfillmentCost();
    const adjustment = state.checkoutAdjustment;
    const total = itemTotal + delivery + adjustment;
    const fulfillmentLabel = state.fulfillment === "pickup" ? "Pengambilan di lokasi" : "Ongkir";
    const fulfillmentDetail = state.fulfillment === "pickup" ? "Tidak ada biaya pengiriman" : "Tarif berlaku untuk pemeriksaan ini";
    const adjustmentLabel = stale ? "Penyesuaian harga setelah validasi" : "Penyesuaian harga disetujui";
    return frameHeader(
      stale ? "Periksa perubahan sebelum membayar." : "Periksa total checkout Anda.",
      "Harga, pilihan pemenuhan, masa berlaku ongkir, dan total akhir harus jelas sebelum pembayaran.",
      "Pemeriksaan checkout"
    ) + layout(
      '<section class="card pad"><div class="stepper"><div class="step is-done"><span class="step-number">1</span> Keranjang</div><div class="step is-active"><span class="step-number">2</span> Periksa</div><div class="step"><span class="step-number">3</span> Bayar</div><div class="step"><span class="step-number">4</span> Pesanan</div></div><div class="cart-line"><div class="line-main"><div class="line-icon">' + snapshot.icon + '</div><div><strong>' + snapshot.name + '</strong><span>' + snapshot.meta + ' · ' + (state.fulfillment === "delivery" ? "dikirim" : "diambil") + '</span></div></div><span class="line-price">' + money(itemTotal) + '</span></div><div class="delta-row"><span>' + fulfillmentLabel + '</span><span aria-hidden="true"></span><span class="new">' + money(delivery) + '</span><span class="delta">' + fulfillmentDetail + '</span></div>' + (adjustment > 0 ? '<div class="result-value changed"><span>' + adjustmentLabel + '</span><strong>+' + money(adjustment) + '</strong></div>' : '') + '<div class="total-row"><span>Total akhir</span><strong>' + money(total) + '</strong></div><div class="actions">' + (stale ? button("Setujui total baru", "transition", { transition: "PT-CHK-01", to: "WF-CHK-01" }) : button("Konfirmasi total dan bayar", "transition", { transition: "PT-PAY-01", to: "WF-PAY-01" })) + (!state.checkoutRevalidated ? button("Periksa perubahan", "transition", { transition: "PT-CHK-02", to: "WF-CHK-02" }, "button-secondary") : '') + button("Uji kegagalan pembuatan", "transition", { transition: "PT-CHK-04", to: "WF-CHK-01" }, "button-danger") + '</div></section>',
      '<aside class="card pad soft"><span class="eyebrow">Pemenuhan</span><div class="option-row"><button type="button" class="option ' + (state.fulfillment === "delivery" ? "is-selected" : "") + '" data-action="fulfillment" data-value="delivery" aria-pressed="' + (state.fulfillment === "delivery") + '">Dikirim</button><button type="button" class="option ' + (state.fulfillment === "pickup" ? "is-selected" : "") + '" data-action="fulfillment" data-value="pickup" aria-pressed="' + (state.fulfillment === "pickup") + '">Diambil</button></div><p style="margin-top:1rem">Tarif pengiriman berlaku paling lama 30 menit dan diperiksa kembali sebelum pembayaran. Untuk pengambilan, lokasi dan jam layanan tampil setelah pesanan siap.</p></aside>'
    );
  }

  function renderFulfillmentFallback() {
    return frameHeader("Pengiriman belum dapat dihitung.", "Kegagalan layanan ongkir tidak memilih kurir lain atau membuat komitmen secara diam-diam.", "Pilihan aman checkout") + '<section class="card pad warning"><div class="notice-card"><div><strong>Tarif pengiriman belum tersedia</strong><p>Pilih ambil di lokasi bila tersedia, atau kirim Request untuk ditinjau tanpa membuat pesanan, reservasi, maupun pembayaran.</p></div></div><div class="actions">' + button("Pilih ambil di lokasi", "transition", { transition: "PT-CHK-05", to: "WF-CHK-01" }) + button("Kirim Request untuk ditinjau", "transition", { transition: "PT-CHK-06", to: "WF-REQ-01" }, "button-secondary") + '</div></section>';
  }

  function renderPayment() {
    const expired = state.reservationSeconds <= 0;
    const warning = !expired && state.reservationSeconds <= 300;
    const content = frameHeader("Selesaikan pembayaran dalam waktu reservasi.", "Reservasi berlaku 30 menit. Peringatan lima menit dan hasil yang belum pasti ditampilkan sebagai status terpisah.", "Pembayaran") + layout('<section class="card pad"><div class="reservation-clock"><div><span class="eyebrow">Waktu reservasi</span><p style="margin:.35rem 0 0">Tidak diperpanjang otomatis.</p></div><strong class="clock-value ' + (expired ? "expired" : warning ? "warning" : "") + '">' + timeLabel() + '</strong></div><div class="actions">' + button("Uji peringatan 5 menit", "timer-warning", {}, "button-secondary") + button("Uji reservasi berakhir", "timer-expire", {}, "button-danger") + '</div><div class="divider"></div><div class="stack-tight"><div class="result-value"><span>Referensi pembayaran</span><strong>PAY-DEMO-001</strong></div><div class="result-value"><span>Nominal</span><strong>' + money(committedTotal()) + '</strong></div><div class="result-value"><span>Status</span><strong>' + escapeHtml(state.paymentState === "pending" ? "Menunggu tindakan" : state.paymentState) + '</strong></div></div><div class="actions">' + button("Uji pembayaran berhasil", "transition", { transition: "PT-PAY-03", to: "WF-PAY-03" }) + button("Uji hasil belum pasti", "transition", { transition: "PT-PAY-02", to: "WF-PAY-02" }, "button-secondary") + '</div></section>', '<aside class="card pad soft"><span class="eyebrow">Tindakan aman</span><h3>Satu tindakan sesuai status</h3><p>Status menunggu hanya menampilkan pemeriksaan status. Hasil yang belum pasti tidak pernah menawarkan bayar ulang secara buta.</p></aside>');
    window.setTimeout(startReservationTimer, 0);
    return content;
  }

  function renderPaymentUncertain() {
    const expired = state.reservationSeconds <= 0;
    return frameHeader("Kami sedang memeriksa hasil pembayaran.", "Jangan membayar ulang. Pemeriksaan status akan menentukan hasil akhir dan pesanan yang dimiliki akun Anda.", "Hasil pembayaran belum pasti") + '<section class="card pad warning"><div class="cluster">' + badge("sedang diperiksa", "warning") + '<span class="route-tag">PAY-DEMO-001</span></div><h3 style="margin-top:.9rem">Pembayaran belum dapat dipastikan</h3><p>Referensi tetap tersimpan. ' + (expired ? "Waktu reservasi sudah berakhir; tidak ada hitung mundur aktif." : "Reservasi masih aktif dan tidak diperpanjang otomatis.") + '</p>' + (!expired ? '<div class="reservation-clock" style="margin-top:1rem"><span>Sisa waktu reservasi</span><strong class="clock-value warning">' + timeLabel() + '</strong></div>' : '') + '<div class="actions">' + button("Periksa status", "payment-reconcile") + button("Hubungi bantuan", "support-path", {}, "button-secondary") + '</div></section>';
  }

  function renderPaymentTerminal() {
    const success = state.paymentState !== "uncertain" && state.paymentState !== "terminal-failed";
    return frameHeader(success ? "Pembayaran sudah selesai." : "Pembayaran belum berhasil.", "Setiap hasil akhir memiliki referensi yang dapat diperiksa. Pembayaran berhasil membuka pesanan milik akun Anda.", "Status pembayaran") + '<section class="card pad ' + (success ? "success" : "danger") + '"><div class="cluster">' + badge(success ? "berhasil" : "gagal", success ? "success" : "danger") + '<span class="route-tag">PAY-DEMO-001</span></div><h3 style="margin-top:.9rem">' + (success ? "Pembayaran berhasil" : "Pembayaran belum berhasil") + '</h3><p>' + (success ? "Reservasi digunakan satu kali. Pesanan sekarang dapat dilihat pada tracking." : "Tidak ada percobaan ulang diam-diam. Periksa kembali total atau hubungi bantuan sesuai status ini.") + '</p><div class="actions">' + (success ? button("Lihat tracking", "transition", { transition: "PT-ORD-01", to: "WF-ORD-01" }) : button("Kembali ke pemeriksaan", "transition", { transition: "PT-RES-04", to: "WF-CHK-01" })) + '</div></section>';
  }

  function milestoneSequence() {
    const custom = commercialSnapshot().kind !== "ready";
    const pickup = /PICKUP/.test(state.fixture) || state.fulfillment === "pickup";
    const sharedCustom = [
      ["payment_confirmed", "Pembayaran dikonfirmasi", "Pesanan dibuat untuk akun Anda."],
      ["file_review_when_applicable", "Pemeriksaan file", "File dan spesifikasi diperiksa operator."],
      ["production_queue", "Antrean produksi", "Menunggu slot produksi yang tersedia."],
      ["printing", "Printing", "Pencetakan sedang berlangsung; ETA 5–7 hari kerja."],
      ["post_processing_when_applicable", "Post-processing", "Dikerjakan bila hasil cetak memerlukannya."],
      ["quality_control", "Quality control", "Hasil diperiksa sebelum pemenuhan."]
    ];
    const sharedReady = [
      ["payment_confirmed", "Pembayaran dikonfirmasi", "Pesanan dibuat untuk akun Anda."],
      ["processing_or_packing", "Pemrosesan atau pengemasan", "Produk disiapkan untuk pemenuhan."]
    ];
    const pickupTail = [
      ["ready_for_pickup", "Siap diambil", "Lokasi, jam layanan, dan batas pengambilan ditampilkan."],
      ["picked_up", "Sudah diambil", "Serah terima tercatat."],
      ["completed", "Selesai", "Riwayat pesanan tetap tersedia."]
    ];
    const deliveryTail = [
      ["ready_to_ship", "Siap dikirim", "Pesanan siap diserahkan ke pengiriman."],
      ["shipped", "Dikirim", "Pengiriman sudah dimulai."],
      ["delivered", "Diterima", "Penerimaan tercatat."],
      ["completed", "Selesai", "Riwayat pesanan tetap tersedia."]
    ];
    return (custom ? sharedCustom : sharedReady).concat(pickup ? pickupTail : deliveryTail);
  }

  function renderOrder() {
    const snapshot = commercialSnapshot();
    const custom = snapshot.kind !== "ready";
    const fulfillment = state.fulfillment === "pickup" ? "diambil" : "dikirim";
    return frameHeader("Ikuti pekerjaan yang sedang berlangsung.", "Milestone produksi menampilkan status dan rentang ETA yang faktual—tanpa persentase palsu, posisi antrean, atau telemetri printer.", "Tracking pesanan") + layout('<section class="card pad"><div class="cluster"><span class="status-badge success">sudah dibayar</span><span class="route-tag">ORD-DEMO-001</span></div><div class="order-line"><div class="line-main"><div class="line-icon">' + snapshot.icon + '</div><div><strong>' + snapshot.name + '</strong><span>' + snapshot.meta + ' · ' + fulfillment + '</span></div></div><span class="line-price">' + money(committedTotal()) + '</span></div><div class="metric-grid" style="margin-top:1rem"><div class="metric-card"><span class="metric-label">Status saat ini</span><strong class="metric-value">' + (custom ? "Sedang dicetak" : "Sedang disiapkan") + '</strong></div><div class="metric-card"><span class="metric-label">Rentang ETA</span><strong class="metric-value">' + (custom ? "5–7 hari kerja" : "1–2 hari kerja") + '</strong></div><div class="metric-card"><span class="metric-label">Berikutnya</span><strong class="metric-value">' + (custom ? "Post-processing" : (state.fulfillment === "pickup" ? "Siap diambil" : "Siap dikirim")) + '</strong></div></div><div class="actions">' + button("Lihat seluruh milestone", "transition", { transition: "PT-ORD-05", to: "WF-ORD-02" }) + button("Ajukan bantuan", "transition", { transition: "PT-AFS-01", to: "WF-AFS-01" }, "button-secondary") + button("Periksa batas kepemilikan", "transition", { transition: "PT-ORD-03", to: "WF-OWN-SAFE" }, "button-danger") + '</div></section>', '<aside class="card pad soft"><span class="eyebrow">Data aman bagi pelanggan</span><h3>Hanya informasi yang Anda perlukan</h3><p>Biaya internal, pemasok, margin, catatan operator, dan payload penyedia tidak ditampilkan kepada pelanggan.</p></aside>');
  }

  function renderMilestones() {
    const steps = milestoneSequence();
    const currentIndex = commercialSnapshot().kind === "ready" ? 1 : 3;
    const cards = steps.map(function (step, index) {
      const stateClass = index < currentIndex ? " is-done" : index === currentIndex ? " is-current" : "";
      return '<article class="milestone-card' + stateClass + '" data-state="' + step[0] + '"><div class="milestone-dot"></div><strong>' + step[1] + '</strong><p>' + step[2] + '</p></article>';
    }).join("");
    return frameHeader("Satu urutan milestone yang faktual.", "Alur produk siap dan Custom Print, serta pengambilan dan pengiriman, tidak dicampur menjadi satu status.", "Milestone produksi") + '<div class="milestone-grid">' + cards + '</div><div class="actions">' + button("Uji ETA terlewati", "transition", { transition: "PT-ORD-02", to: "WF-ORD-03" }) + button("Uji batas pengambilan", "transition", { transition: "PT-ORD-07", to: "WF-ORD-03" }, "button-secondary") + button("Uji kendala produksi", "transition", { transition: "PT-ORD-04", to: "WF-ORD-04" }, "button-danger") + '</div>';
  }

  function renderOrderException() {
    return frameHeader("Kendala memerlukan tindakan yang jelas.", "Kendala tidak otomatis menjadi refund, pembatalan, cetak ulang, atau return. Riwayat dan penanggung jawab tetap terlihat.", "Pemulihan pesanan") + '<section class="card pad warning"><div class="cluster"><span class="status-badge warning">perlu revisi file</span><span class="route-tag">ORD-DEMO-001</span></div><h3 style="margin-top:.9rem">Operator membutuhkan klarifikasi file</h3><p>Anda dapat mengirim revisi atau mengajukan bantuan untuk ditinjau. Status tidak berubah secara diam-diam.</p><div class="actions">' + button("Ajukan bantuan", "transition", { transition: "PT-AFS-01", to: "WF-AFS-01" }) + button("Kembali ke pesanan", "transition", { transition: "PT-ORD-01", to: "WF-ORD-01" }, "button-secondary") + '</div></section>';
  }

  function renderOrderOverdue() {
    const pickup = state.scenario.indexOf("PICKUP") >= 0;
    return frameHeader(pickup ? "Pengambilan memerlukan tindak lanjut." : "ETA berubah; riwayat tetap faktual.", "Pelanggan melihat alasan dan rentang pengganti. Batas pengambilan baru dihitung setelah pesanan siap diambil.", "Perubahan pada pesanan") + '<section class="card pad warning"><div class="cluster">' + badge(pickup ? "batas pengambilan terlewati" : "ETA terlewati", "warning") + '<span class="route-tag">ORD-DEMO-001</span></div><h3 style="margin-top:.9rem">' + (pickup ? "Pesanan siap tetapi belum diambil" : "Rentang ETA perlu diperbarui") + '</h3><p>' + (pickup ? "Batas pengambilan: 7 hari kalender setelah siap diambil. Niuva akan mengingatkan secara manual; tidak ada pembatalan atau refund otomatis." : "Alasan: penyesuaian antrean material. ETA baru: 7–9 hari kerja. Tindakan penyelesaian belum dijanjikan otomatis.") + '</p><div class="actions">' + button("Lihat riwayat perubahan", "transition", { transition: "PT-ORD-06", to: "WF-ORD-04" }) + button("Hubungi bantuan", "support-path", {}, "button-secondary") + '</div></section>';
  }

  function renderAfterSales() {
    const typeLabels = { revision: "Revisi file", complaint: "Komplain hasil", cancellation: "Tinjauan pembatalan" };
    const eligibleTypes = state.fixture === "FX-AFTER-LIFECYCLE" ? ["cancellation", "revision"] : ["complaint", "revision"];
    if (!eligibleTypes.includes(state.afterSalesType)) state.afterSalesType = eligibleTypes[0];
    const noteError = state.afterSalesAttempted && !state.afterSalesNote.trim() ? '<p class="field-error" id="case-note-error" role="alert">Jelaskan singkat apa yang terjadi sebelum mengirim.</p>' : "";
    const options = eligibleTypes.map(function (value) {
      return '<button class="option' + (state.afterSalesType === value ? ' is-selected' : '') + '" type="button" data-action="case-type" data-value="' + value + '" aria-pressed="' + (state.afterSalesType === value ? 'true' : 'false') + '">' + typeLabels[value] + '</button>';
    }).join("");
    return frameHeader("Minta bantuan tanpa kehilangan konteks.", "Kelayakan mengikuti status pesanan. Pilih jenis bantuan dan jelaskan faktanya; hasil penyelesaian tetap harus ditinjau.", "Bantuan setelah pembelian") + layout('<section class="card pad"><div class="case-line"><div><strong>Permintaan belum dikirim</strong><span class="muted">Pesanan ORD-DEMO-001 · milik akun Anda</span></div><span class="status-badge">draft</span></div><div class="option-row" style="margin-top:1rem" role="group" aria-label="Jenis bantuan">' + options + '</div><p class="muted" style="margin-top:.65rem">Pilihan aktif: <strong>' + typeLabels[state.afterSalesType] + '</strong></p><p class="muted">Pilihan lain tidak tersedia untuk fase pesanan sintetis ini; tidak ada hasil refund, reprint, atau pembatalan otomatis.</p><div class="field' + (noteError ? ' has-error' : '') + '" style="margin-top:1rem"><label for="case-note">Apa yang terjadi?</label><textarea id="case-note" placeholder="Jelaskan faktanya; jangan masukkan data sensitif yang tidak diperlukan." data-field="after-sales-note"' + (noteError ? ' aria-invalid="true" aria-describedby="case-note-error"' : '') + '>' + escapeHtml(state.afterSalesNote) + '</textarea>' + noteError + '</div><div class="actions">' + button("Kirim permintaan", "submit-after-sales") + button("Lihat batas kebijakan", "support-path", {}, "button-secondary") + '</div></section>', '<aside class="card pad soft"><span class="eyebrow">Sesuai kebijakan</span><h3>Status dan tindakan berikutnya</h3><p>Pelanggan hanya melihat status serta tindakan yang relevan. Persetujuan internal dan rekonsiliasi keuangan tidak ditampilkan di area pelanggan.</p></aside>');
  }

  function renderAfterSalesReview() {
    const caseRole = state.role;
    const caseActions = caseRole === "manager_approver"
      ? button("Setujui atau tolak penyelesaian", "operator-remedy", { capability: "manager_approver" }) + '<button class="button button-quiet" type="button" disabled>Rekonsiliasi keuangan setelah persetujuan</button>'
      : caseRole === "finance"
        ? button("Siapkan rekonsiliasi keuangan", "operator-remedy", { capability: "finance" }, "button-secondary") + '<button class="button button-quiet" type="button" disabled>Perlu persetujuan manajer</button>'
        : button("Simpan review faktual", "operator-draft") + '<button class="button button-quiet" type="button" disabled>Perlu persetujuan manajer</button>';
    return frameHeader("Bukti siap ditinjau.", "Review operator, persetujuan manajer, dan rekonsiliasi keuangan adalah kewenangan yang berbeda.", "Review bantuan pelanggan") + '<section class="card pad"><div class="cluster"><span class="status-badge warning">sedang ditinjau</span><span class="route-tag">CASE-DEMO-001</span></div><div class="metric-grid" style="margin-top:1rem"><div class="metric-card"><span class="metric-label">Pemilik</span><strong class="metric-value">Akun pelanggan</strong></div><div class="metric-card"><span class="metric-label">Bukti</span><strong class="metric-value">2 file</strong></div><div class="metric-card"><span class="metric-label">Keputusan</span><strong class="metric-value">Menunggu</strong></div></div><div class="permission-box" style="margin-top:1rem">' + (state.role === "finance" ? "Keuangan dapat menyiapkan rekonsiliasi setelah persetujuan manajer, tetapi tidak dapat menyetujui penyelesaian." : "Admin pesanan menyiapkan review faktual; persetujuan atau penolakan memerlukan manajer.") + '</div><div class="actions">' + caseActions + '</div></section>';
  }

  function renderDashboard() {
    return frameHeader("Apa yang perlu Anda perhatikan?", "Dashboard menampilkan tindakan berikutnya dari data milik akun Anda tanpa membocorkan referensi milik orang lain.", "Akun pelanggan") + '<div class="metric-grid"><div class="metric-card"><span class="metric-label">Pesanan aktif</span><strong class="metric-value">1 tracking</strong><p>Sedang dicetak · ETA 5–7 hari kerja</p></div><div class="metric-card"><span class="metric-label">Request</span><strong class="metric-value">1 ditinjau</strong><p>Perlu review harga</p></div><div class="metric-card"><span class="metric-label">Notifikasi</span><strong class="metric-value">2 baru</strong><p>Hanya untuk akun Anda</p></div></div><section class="card pad" style="margin-top:1rem"><div class="queue-card" style="border:0;padding:0"><header><div><span class="eyebrow">Tindakan yang disarankan</span><h3 style="margin-top:.5rem">Lihat progres Custom 3D Print</h3></div><span class="status-badge success">milik Anda</span></header><p>Pesanan ORD-DEMO-001 sedang dicetak. Buka tracking untuk melihat rentang ETA dan riwayat.</p><div class="actions">' + button("Buka pesanan", "transition", { transition: "PT-DASH-03", to: "WF-ORD-01" }) + button("Lihat notifikasi", "transition", { transition: "PT-DASH-02", to: "WF-NOTIF-01" }, "button-secondary") + '</div></div></section>';
  }

  function renderNotifications() {
    return frameHeader("Notifikasi membuka tujuan yang aman.", "Setiap notifikasi menyebut peristiwa dan tujuannya. Pengiriman email belum diaktifkan pada pratinjau ini.", "Notifikasi pelanggan") + '<section class="card pad"><div class="notice-card"><div><strong>Pesanan siap diambil</strong><p>ORD-DEMO-001 · membuka tracking milik akun Anda</p></div><span class="status-badge success">di aplikasi</span></div><div class="notice-card" style="margin-top:.7rem"><div><strong>Tindak lanjut pengambilan diperlukan</strong><p>Pengingat dan tindak lanjut manual · tidak ada pembatalan otomatis</p></div><span class="status-badge warning">email direncanakan</span></div></section>';
  }

  function renderAdminQueue() {
    const operator = state.role === "Public prospect" || state.role === "Authenticated customer" ? "order_admin" : state.role;
    state.operatorCapability = operator;
    return frameHeader("Kerjakan antrean sesuai kewenangan.", "Admin Studio menyatukan CMS dan operasi, tetapi setiap tindakan tetap dibatasi oleh peran dan versi data.", "Admin Studio") + '<div class="ops-summary"><p><strong>Ringkasan antrean contoh</strong></p><p>2 Request perlu ditinjau · 1 konflik pesanan · 1 keputusan bantuan menunggu</p></div><div class="queue-grid" style="margin-top:1rem"><article class="queue-card"><header><strong>REQ-DEMO-001</strong><span class="status-badge warning">perlu review harga</span></header><p>Custom 3D Print · alur Request terpisah</p><div class="queue-meta"><span>Estimator penjualan</span><span>versi 3</span></div><div class="actions">' + button("Buka Request", "transition", { transition: "PT-ADM-01", to: "WF-ADM-02" }, "button-secondary") + '</div></article><article class="queue-card"><header><strong>ORD-DEMO-001</strong><span class="status-badge danger">konflik versi</span></header><p>Pesanan Retail · perlu membandingkan draft</p><div class="queue-meta"><span>Admin pesanan</span><span>versi 12</span></div><div class="actions">' + button("Buka pesanan", "transition", { transition: "PT-ADM-07", to: "WF-ADM-03" }, "button-secondary") + '</div></article><article class="queue-card"><header><strong>CASE-DEMO-001</strong><span class="status-badge warning">sedang ditinjau</span></header><p>Bantuan pelanggan · keputusan manajer menunggu</p><div class="queue-meta"><span>Admin pesanan</span><span>Keuangan</span></div><div class="actions">' + button("Buka kasus", "transition", { transition: "PT-ADM-08", to: "WF-ADM-04" }, "button-secondary") + '</div></article></div><div class="actions">' + button("Kelola konten", "transition", { transition: "PT-CMS-00", to: "WF-CMS-01" }, "button-secondary") + button("Peringatan stok", "transition", { transition: "PT-STOCK-01", to: "WF-ADM-05" }, "button-secondary") + button("Arsip lama", "transition", { transition: "PT-ADM-05", to: "WF-ADM-06" }, "button-secondary") + '</div>';
  }

  function renderAdminRequest() {
    const estimator = state.role === "sales_estimator" || state.operatorCapability === "sales_estimator";
    return frameHeader("Siapkan, setujui, lalu tampilkan.", "Request dan Offer Retail tetap terpisah dari Inquiry B2B. Draft belum dapat dilihat pelanggan sampai disetujui manajer.", "Request dan Offer Retail") + layout('<section class="card pad"><div class="cluster"><span class="status-badge warning">draft</span><span class="route-tag">REQ-DEMO-001</span></div><h3 style="margin-top:.9rem">Offer Retail berbantuan</h3><div class="result-value"><span>Kewenangan saat ini</span><strong>' + escapeHtml(estimator ? "Estimator penjualan" : "Penyetuju manajer") + '</strong></div><div class="result-value"><span>Versi</span><strong>OFFER-v2 · draft tidak dapat diubah</strong></div><div class="result-value"><span>Tampilan pelanggan</span><strong>Belum berubah</strong></div><div class="actions">' + (estimator ? button("Simpan untuk persetujuan", "operator-draft") : button("Setujui Offer", "transition", { transition: "PT-ADM-03", to: "WF-OFFER-01" })) + button("Tolak atau kembalikan", "transition", { transition: "PT-ADM-03-DENY", to: "WF-ADM-02" }, "button-secondary") + '</div></section>', '<aside class="card pad soft"><span class="eyebrow">Batas kewenangan</span><h3>' + (estimator ? "Hanya menyiapkan draft" : "Keputusan manajer") + '</h3><p>' + (estimator ? "Estimator dapat menyiapkan rincian dan jalur, tetapi tidak dapat menyetujui atau menerbitkan." : "Manajer dapat menyetujui atau menolak versi yang tidak dapat diubah; aktor dan versi dicatat.") + '</p></aside>');
  }

  function renderAdminOrder() {
    return frameHeader("Pulihkan tanpa menimpa perubahan.", "Area kerja pesanan Retail berbeda dari arsip lama. Konflik versi dan transaksi yang tidak tersedia memiliki jalur pemulihan yang terlihat.", "Operasi pesanan Retail") + '<section class="card pad"><div class="cluster"><span class="status-badge danger">konflik versi</span><span class="route-tag">ORD-DEMO-001 · v12 → v13</span></div><h3 style="margin-top:.9rem">Simpan draft ditolak</h3><p>Data berubah di server. Bandingkan nilai terbaru dengan draft sebelum mencoba lagi.</p><div class="permission-box">Tampilan pelanggan tidak dapat diedit dari kewenangan ini. Tidak ada notifikasi berhasil ketika penyimpanan ditolak.</div><div class="actions">' + button("Bandingkan dan muat ulang", "operator-recover") + button("Uji transaksi tidak tersedia", "transition", { transition: "PT-ADM-10", to: "WF-ADM-03" }, "button-danger") + '</div></section>';
  }

  function renderAdminCase() {
    const caseRole = state.role;
    const caseActions = caseRole === "manager_approver"
      ? button("Setujui atau tolak penyelesaian", "operator-remedy", { capability: "manager_approver" }) + '<button class="button button-quiet" type="button" disabled>Rekonsiliasi keuangan setelah persetujuan</button>'
      : caseRole === "finance"
        ? button("Siapkan rekonsiliasi keuangan", "operator-remedy", { capability: "finance" }, "button-secondary") + '<button class="button button-quiet" type="button" disabled>Perlu persetujuan manajer</button>'
        : button("Simpan review faktual", "operator-draft") + '<button class="button button-quiet" type="button" disabled>Perlu persetujuan manajer</button>';
    return frameHeader("Kelola kasus dengan kewenangan yang jelas.", "Review, persetujuan, pelaksanaan, dan rekonsiliasi keuangan bukan satu izin yang sama.", "Kasus bantuan Retail") + '<section class="card pad"><div class="cluster"><span class="status-badge warning">keputusan menunggu</span><span class="route-tag">CASE-DEMO-001</span></div><div class="case-line"><div><strong>Klaim pelanggan · 2 bukti</strong><span>Pesanan ORD-DEMO-001 · kasus milik pelanggan</span></div><span class="status-badge">review</span></div><div class="actions">' + caseActions + '</div><div class="permission-box" style="margin-top:1rem">Persetujuan hanya mencatat keputusan. Pelaksanaan dan rekonsiliasi tetap menjadi peristiwa terpisah yang diawasi.</div></section>';
  }

  function renderInventory() {
    return frameHeader("Temukan tekanan stok lebih awal.", "Peringatan menyebut bahan dan tindakan berikutnya. Pratinjau ini tidak mengubah stok atau mengaktifkan penjadwalan.", "Dukungan persediaan") + '<section class="card pad"><div class="queue-grid"><article class="queue-card"><header><strong>PLA putih</strong><span class="status-badge danger">habis</span></header><p>Berpotensi menghambat antrean Custom 3D Print.</p><div class="queue-meta"><span>Gudang</span><span>Perlu tindak lanjut</span></div></article><article class="queue-card"><header><strong>ABS hitam</strong><span class="status-badge warning">menipis</span></header><p>Material yang sudah dicadangkan perlu diperiksa.</p><div class="queue-meta"><span>Gudang</span><span>Periksa reservasi</span></div></article><article class="queue-card"><header><strong>TPU natural</strong><span class="status-badge">konflik</span></header><p>Versi hitungan berubah; bandingkan sebelum menyimpan.</p><div class="queue-meta"><span>Gudang</span><span>Belum ada perubahan</span></div></article></div><div class="actions">' + button("Tandai sudah ditinjau", "operator-draft") + '</div></section>';
  }

  function renderAdminLegacy() {
    return frameHeader("Arsip hanya-baca, bukan area kerja.", "Pesanan lama tetap dapat dicari sebagai riwayat, tetapi tidak menyediakan perubahan, pembayaran, atau percobaan ulang.", "Kompatibilitas arsip") + '<section class="card pad"><div class="cluster"><span class="status-badge dark">arsip hanya-baca</span><span class="route-tag">/admin/orders</span></div><div class="table-wrap" style="margin-top:1rem"><table><thead><tr><th>Referensi</th><th>Jenis</th><th>Status</th><th>Tindakan</th></tr></thead><tbody><tr><td class="mono">LEGACY-0007</td><td>Pesanan historis</td><td>Diarsipkan</td><td>Lihat ringkasan</td></tr><tr><td class="mono">LEGACY-0012</td><td>Pesanan historis</td><td>Diarsipkan</td><td>Lihat riwayat</td></tr></tbody></table></div><div class="actions">' + button("Kembali ke Admin", "transition", { transition: "PT-ADM-00", to: "WF-ADM-01" }, "button-secondary") + '</div></section>';
  }

  function renderCms() {
    const manager = state.role === "manager_approver" || state.operatorCapability === "manager_approver";
    return frameHeader("Edit dengan aman, terbitkan sesuai kewenangan.", "Satu area CMS mencakup draft, pratinjau, konflik versi, rollback, dan penerbitan langsung yang tetap tercatat.", "Siklus konten") + '<section class="card pad"><div class="cluster"><span class="status-badge ' + (manager ? "success" : "warning") + '">' + (manager ? "Penyetuju manajer" : "Editor konten") + '</span><span class="route-tag">/admin/content</span></div><div class="form-grid" style="margin-top:1rem"><div class="field"><label for="cms-title">Judul halaman</label><input id="cms-title" value="Design &amp; Prototyping" /></div><div class="field"><label for="cms-status">Status</label><select id="cms-status"><option>Draft</option><option>Pratinjau</option><option>Terjadwal</option><option>Diarsipkan</option></select></div><div class="field full"><label for="cms-copy">Isi</label><textarea id="cms-copy">Dari brief menjadi objek yang dapat diuji.</textarea></div></div><div class="permission-box" style="margin-top:1rem">' + (manager ? "Penerbitan langsung tersedia bagi penyetuju manajer. Aktor, versi, dan riwayat tetap terlihat." : "Editor dapat mengubah, memvalidasi, dan melihat pratinjau. Penerbitan memerlukan kewenangan manajer.") + '</div><div class="actions">' + button("Simpan draft", "operator-draft") + button("Lihat pratinjau", "operator-preview", {}, "button-secondary") + (manager ? button("Terbitkan", "operator-publish") : button("Tidak berwenang menerbitkan", "operator-denied", {}, "button-danger")) + '</div></section>';
  }

  function renderSafeBoundary() {
    return frameHeader("Data tersebut tidak dapat ditampilkan.", "Referensi yang tidak ada dan bukan milik akun menggunakan respons aman yang sama, tanpa membocorkan keberadaan data.", "Batas kepemilikan") + '<div class="safe-boundary"><div><div class="safe-icon" aria-hidden="true">⌁</div><h2>Data tidak tersedia</h2><p>Periksa tautan atau kembali ke dashboard. Data terlindungi, pemilik, catatan internal, dan keberadaan referensi tidak dibocorkan.</p><div class="actions" style="justify-content:center">' + button("Kembali ke dashboard", "transition", { transition: "PT-OWN-04", to: "WF-DASH-01" }) + button("Kembali", "history-back", {}, "button-secondary") + '</div></div></div>';
  }

  function renderLegacyCustomer() {
    return frameHeader("Jalur lama ini tidak aktif.", "Jalur pesanan lama hanya dapat memberi respons aman, redirect yang disetujui, atau riwayat hanya-baca. Tidak ada pembuatan atau pembayaran baru.", "Kompatibilitas pelanggan lama") + '<section class="card pad warning"><div class="cluster"><span class="status-badge warning">kompatibilitas</span><span class="route-tag">/order</span></div><h3 style="margin-top:.9rem">Area pesanan lama tidak tersedia</h3><p>Jika redirect diaktifkan melalui keputusan terpisah, pelanggan dapat diarahkan ke penemuan Retail. Saat ini hanya batas aman yang diperagakan.</p><div class="actions">' + button("Uji redirect yang disetujui", "transition", { transition: "PT-LEGACY-02", to: "WF-RET-01" }) + button("Tetap hanya-baca", "history-back", {}, "button-secondary") + '</div></section>';
  }

  function renderEvidenceThread() {
    let current = 0;
    if (/^(WF-CFG-|WF-CART-|WF-AUTH-)/.test(state.frame)) current = 1;
    if (/^(WF-REQ-|WF-OFFER-|WF-CHK-|WF-PAY-)/.test(state.frame)) current = 2;
    if (/^(WF-ORD-|WF-AFS-|WF-DASH-|WF-NOTIF-)/.test(state.frame)) current = 3;
    const labels = [
      ["Kebutuhan", "tujuan dan pilihan"],
      ["File", "versi dan spesifikasi"],
      ["Keputusan", "harga, ETA, dan persetujuan"],
      ["Objek", "produksi dan tindak lanjut"]
    ];
    return '<div class="evidence-thread" aria-label="Alur dari kebutuhan ke objek">' + labels.map(function (item, index) {
      return '<span class="' + (index === current ? 'is-current' : '') + '"><strong>' + item[0] + '</strong>' + item[1] + '</span>';
    }).join("") + '</div>';
  }

  function renderOpsContext() {
    return '<div class="ops-context-strip" aria-label="Konteks operasi"><div><span>Peran aktif</span><strong>' + escapeHtml(roleLabel(state.role)) + '</strong></div><div><span>Prinsip penyimpanan</span><strong>Bandingkan versi sebelum simpan</strong></div><div><span>Batas data</span><strong>Proyeksi pelanggan tetap aman</strong></div></div>';
  }

  function renderFrame() {
    let content;
    switch (state.frame) {
      case "WF-PUB-01": content = renderPublicHome(); break;
      case "WF-PUB-02": content = renderCapabilities(); break;
      case "WF-B2B-01": content = renderB2BForm(); break;
      case "WF-B2B-02": content = renderB2BAcknowledgement(); break;
      case "WF-EXT-01": content = renderExternal(); break;
      case "WF-RET-01": content = renderRetail(); break;
      case "WF-CART-01": content = renderCart(); break;
      case "WF-AUTH-01": content = renderAuth(); break;
      case "WF-CFG-01": content = renderConfigurator("setup"); break;
      case "WF-CFG-02": content = renderConfigurator("analysis"); break;
      case "WF-CFG-03": content = renderResult(); break;
      case "WF-REQ-01": content = renderRequest(); break;
      case "WF-OFFER-01": content = renderOffer(); break;
      case "WF-OFFER-02": content = renderOfferResult(); break;
      case "WF-CHK-01": content = renderCheckout(); break;
      case "WF-CHK-02": content = renderCheckout(); break;
      case "WF-CHK-03": content = renderFulfillmentFallback(); break;
      case "WF-PAY-01": content = renderPayment(); break;
      case "WF-PAY-02": content = renderPaymentUncertain(); break;
      case "WF-PAY-03": content = renderPaymentTerminal(); break;
      case "WF-ORD-01": content = renderOrder(); break;
      case "WF-ORD-02": content = renderMilestones(); break;
      case "WF-ORD-03": content = renderOrderOverdue(); break;
      case "WF-ORD-04": content = renderOrderException(); break;
      case "WF-AFS-01": content = renderAfterSales(); break;
      case "WF-AFS-02": content = renderAfterSalesReview(); break;
      case "WF-DASH-01": content = renderDashboard(); break;
      case "WF-NOTIF-01": content = renderNotifications(); break;
      case "WF-ADM-01": content = renderAdminQueue(); break;
      case "WF-ADM-02": content = renderAdminRequest(); break;
      case "WF-ADM-03": content = renderAdminOrder(); break;
      case "WF-ADM-04": content = renderAdminCase(); break;
      case "WF-ADM-05": content = renderInventory(); break;
      case "WF-ADM-06": content = renderAdminLegacy(); break;
      case "WF-CMS-01": content = renderCms(); break;
      case "WF-OWN-SAFE": content = renderSafeBoundary(); break;
      case "WF-LEGACY-01": content = renderLegacyCustomer(); break;
      default: content = frameHeader("Tampilan belum tersedia", "Kembali ke jalur utama untuk melanjutkan.", "Batas aman") + '<div class="empty-state">Tampilan tidak tersedia.</div>';
    }
    if (familyForFrame(state.frame) === "retail") return renderEvidenceThread() + content;
    if (familyForFrame(state.frame) === "admin") return renderOpsContext() + content;
    return content;
  }

  function renderReviewPage() {
    if (!isReviewPage) return;
    if (!scenarioSelect.options.length) {
      scenarioSelect.innerHTML = data.SCENARIO_IDS.map(function (id) {
        return '<option value="' + escapeHtml(id) + '">' + escapeHtml(id + " — " + data.SCENARIOS[id].title) + '</option>';
      }).join("");
    }
    scenarioSelect.value = state.scenario;
    reviewRole.textContent = state.role;
    reviewFixture.textContent = state.fixture;
    reviewFrame.textContent = state.frame;
    eventCount.textContent = state.events.length + " event" + (state.events.length === 1 ? "" : "s");
    eventList.innerHTML = state.events.length ? state.events.slice(0, 12).map(function (item) {
      return '<li><strong>' + escapeHtml(item.type) + '</strong> ' + escapeHtml(item.detail) + ' <span class="muted">' + escapeHtml(item.at) + '</span></li>';
    }).join("") : '<li class="event-empty">Belum ada event pada seed ini.</li>';
  }

  function scrubParticipantMarkup(markup) {
    const template = document.createElement("template");
    template.innerHTML = markup;
    template.content.querySelectorAll(".route-tag, .frame-id, [data-review-only]").forEach(function (node) { node.remove(); });
    const textWalker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (textWalker.nextNode()) textNodes.push(textWalker.currentNode);
    textNodes.forEach(function (node) {
      node.nodeValue = node.nodeValue
        .replace(/\b(?:WF|PT|SCN|FX)-[A-Z0-9-]+\b/g, "referensi contoh")
        .replace(/Review Mode/gi, "ruang persiapan")
        .replace(/Participant Mode/gi, "tugas pengguna")
        .replace(/bounded prototype/gi, "pratinjau")
        .replace(/\bprototype\b/gi, "pratinjau")
        .replace(/\bfixture\b/gi, "contoh")
        .replace(/\bsimulated\b/gi, "contoh")
        .replace(/\bcandidate\/?TBD\b/gi, "belum ditetapkan")
        .replace(/\bcandidate\b/gi, "belum ditetapkan")
        .replace(/\/(?:admin|retail|orders?|dashboard|login|contact)(?:\/[A-Za-z0-9_:\-#]+)*/g, "jalur terkait");
    });
    template.content.querySelectorAll("*").forEach(function (node) {
      Array.from(node.attributes).forEach(function (attribute) {
        if (/\b(?:WF|PT|SCN|FX)-[A-Z0-9-]+\b/.test(attribute.value)) node.removeAttribute(attribute.name);
      });
    });
    return template.innerHTML;
  }

  function render() {
    if (isReviewPage) {
      renderReviewPage();
      return;
    }
    actionRegistry.clear();
    actionSequence = 0;
    document.documentElement.dataset.family = familyForFrame(state.frame);
    root.innerHTML = scrubParticipantMarkup(renderFrame() + footerContract());
    renderProductNavigation();
    notice.className = "notice" + (state.noticeTone ? " " + state.noticeTone : "");
    notice.textContent = state.notice;
    document.querySelectorAll(".stepper").forEach(function (stepper) {
      stepper.setAttribute("role", "list");
      stepper.setAttribute("aria-label", "Tahapan alur");
      stepper.querySelectorAll(".step").forEach(function (step) {
        step.setAttribute("role", "listitem");
        if (step.classList.contains("is-active")) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    });
    const focusTarget = state.focusTarget;
    state.focusTarget = null;
    if (focusTarget) {
      const focusNode = document.querySelector(focusTarget) || document.getElementById("frame-title");
      if (focusNode && typeof focusNode.focus === "function") focusNode.focus({ preventScroll: true });
    }
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    let action = target.dataset.action;
    let payload = Object.assign({}, target.dataset);
    if (action === "dispatch") {
      const registered = actionRegistry.get(target.dataset.actionKey);
      if (!registered) return;
      action = registered.action;
      payload = registered.payload;
    }
    if (isReviewPage) {
      if (action === "handoff-participant") {
        safeSessionWrite(seedStorageKey, {
          scenario: state.scenario,
          baseline: data.BASELINE,
          seededAt: new Date().toISOString()
        });
        logEvent("participant.handoff", state.scenario + " → index.html");
        safeSessionWrite(reviewStorageKey, { scenario: state.scenario });
        return;
      }
      if (action === "reset-review") {
        event.preventDefault();
        clearPrototypePersistence();
        state.scenario = "SCN-B2B-01";
        applyScenarioSeed(state.scenario);
        state.events = [];
        logEvent("review.reset", "all session state cleared");
        render();
      }
      return;
    }
    if (action !== "consent" && action !== "case-type") queueFocus(".frame-title");
    if (action === "product-home") { state.frame = "WF-PUB-01"; state.role = "Public prospect"; state.operatorSession = false; setNotice("", ""); return render(); }
    if (action === "product-nav") {
      const destination = payload.frame;
      if (isAdminFrame(destination) && !state.operatorSession) {
        setNotice("Ruang operasi hanya tersedia untuk peran operator yang sudah disiapkan.", "error");
        queueFocus("#notice");
        return render();
      }
      state.frame = destination;
      setNotice("", "");
      return render();
    }
    if (action === "reset") return resetScenario();
    if (action === "quick-frame") {
      if (isAdminFrame(payload.frame) && !state.operatorSession) {
        setNotice("Ruang operasi hanya tersedia untuk peran operator yang sudah disiapkan.", "error");
        logEvent("navigation.blocked", payload.frame);
        queueFocus("#notice");
        return render();
      }
      state.frame = payload.frame;
      logEvent("quick.frame", state.frame);
      setNotice("Tampilan tugas dibuka.", "");
      return render();
    }
    if (action === "transition") return applyTransition(payload.transition, payload.to);
    if (action === "submit-b2b") {
      state.formAttempted = true;
      state.b2bErrors = b2bValidation();
      if (Object.keys(state.b2bErrors).length > 0) { setNotice("Form B2B belum lengkap. Tidak ada Inquiry dibuat.", "error"); logEvent("validation.error", "B2B required fields or consent"); queueFocus("#b2bError"); return render(); }
      if (state.fixture === "FX-B2B-PERSISTENCE-FAIL") { setNotice("Inquiry belum tersimpan. Tidak ada UUID atau acknowledgement palsu; coba simpan lagi.", "error"); logEvent("persistence.error", "B2B inquiry write unavailable"); queueFocus("#b2bPersistenceError"); return render(); }
      state.fixture = "FX-B2B-VALID";
      return applyTransition("PT-B2B-01", "WF-B2B-02");
    }
    if (action === "b2b-retry") { state.fixture = "FX-B2B-VALID"; applyTransition("PT-B2B-01", "WF-B2B-02"); setNotice("Inquiry tersimpan setelah percobaan ulang.", "success"); queueFocus(".frame-title"); return render(); }
    if (action === "consent") { state.consent = target.checked; return; }
    if (action === "case-type") { state.afterSalesType = payload.value || "revision"; state.afterSalesAttempted = false; queueFocus('[data-action="case-type"][data-value="' + state.afterSalesType + '"]'); return render(); }
    if (action === "submit-after-sales") {
      state.afterSalesAttempted = true;
      if (!state.afterSalesNote.trim()) { setNotice("Tambahkan ringkasan kejadian sebelum mengirim case.", "error"); queueFocus("#case-note"); return render(); }
      logEvent("after_sales.submit", state.afterSalesType);
      return applyTransition("PT-AFS-02", "WF-AFS-02");
    }
    if (action === "external-source") { state.externalSource = payload.source || "b2b"; return applyTransition("PT-PUB-03", "WF-EXT-01"); }
    if (action === "external-handoff") { logEvent("external.handoff", "WhatsApp user-initiated; no automatic send"); setNotice("Handoff eksternal disimulasikan. Kembali ke Niuva bila selesai.", "success"); return render(); }
    if (action === "auth-success") { logEvent("auth.simulated", "authenticated_owner fixture"); state.role = "Authenticated customer"; setNotice("Masuk dengan akun contoh berhasil. Anda kembali ke tugas yang sama.", "success"); state.frame = state.authContext === "config" ? "WF-CFG-01" : "WF-CART-01"; state.authContext = null; return render(); }
    if (action === "auth-recover") { setNotice("Instruksi pemulihan bersifat umum dan tidak mengungkap keberadaan akun.", ""); return render(); }
    if (action === "config-mode") { state.configMode = target.value; return render(); }
    if (action === "config-failure") { if (state.fixture === "FX-CUSTOM-RECOVERY") { setNotice("Pemulihan tetap diperlukan. Pilih ganti file, coba analisis lagi, atau kirim untuk review.", "error"); queueFocus("#notice"); } else { state.recoveryOrigin = state.fixture; state.fixture = "FX-CUSTOM-RECOVERY"; setNotice("File atau analisis gagal. Konteks dipertahankan; pilih tindakan aman di bawah.", "error"); queueFocus("#notice"); } return render(); }
    if (action === "config-replace") { state.recoveryOrigin = null; state.fixture = "FX-CUSTOM-VALID"; state.frame = "WF-CFG-01"; setNotice("Siapkan file pengganti. Parameter sebelumnya tidak dipublikasikan sebagai hasil.", ""); return render(); }
    if (action === "config-retry") { const retryWasQuote = state.recoveryOrigin === "FX-CUSTOM-QUOTE"; state.recoveryOrigin = null; state.fixture = retryWasQuote ? "FX-CUSTOM-QUOTE" : "FX-CUSTOM-ANALYSIS"; state.frame = "WF-CFG-02"; setNotice(retryWasQuote ? "Analisis ulang tetap memerlukan review harga; total otomatis tidak tersedia." : "Analisis ulang dimulai dengan data contoh; tunggu hasil berikutnya.", retryWasQuote ? "warning" : ""); return render(); }
    if (action === "fulfillment") { state.fulfillment = payload.value; setNotice("Metode penerimaan dipilih; nilai akan diperiksa kembali sebelum pembayaran.", ""); return render(); }
    if (action === "timer-warning") { state.reservationSeconds = 300; setNotice("Sisa waktu lima menit. Reservasi tidak diperpanjang otomatis.", "warning"); return render(); }
    if (action === "timer-expire") { state.reservationSeconds = 0; resetTimer(); setNotice("Reservasi berakhir. Periksa kembali nilai terbaru sebelum melanjutkan.", "warning"); return render(); }
    if (action === "support-path") { setNotice("Batas kebijakan ditampilkan. Tidak ada pembayaran ulang atau penyelesaian otomatis.", ""); return render(); }
    if (action === "operator-remedy") { const capability = payload.capability; state.role = capability; logEvent("operator.remedy", capability); setNotice(capability === "finance" ? "Keuangan menyiapkan rekonsiliasi setelah persetujuan manajer; keputusan tidak dapat disetujui dari peran ini." : "Keputusan dicatat untuk pemeriksaan; pelaksanaan tetap menjadi langkah terpisah.", capability === "finance" ? "warning" : "success"); return render(); }
    if (action === "operator-draft") { logEvent("operator.draft", state.operatorCapability); setNotice("Draft contoh tersimpan; tampilan pelanggan belum berubah.", "success"); return render(); }
    if (action === "operator-preview") { setNotice("Pratinjau aktif; konten belum diterbitkan.", ""); return render(); }
    if (action === "operator-publish") { logEvent("operator.publish", "manager_approver actor/version audit"); setNotice("Penerbitan contoh berhasil; aktor, versi, dan riwayat tetap terlihat.", "success"); return render(); }
    if (action === "operator-denied") { setNotice("Editor konten tidak berwenang menerbitkan. Simpan draft atau lihat pratinjau; persetujuan manajer diperlukan.", "error"); queueFocus("#notice"); return render(); }
    if (action === "operator-recover") { setNotice("Draft dibandingkan dengan versi terbaru; tidak ada data yang ditimpa.", "success"); logEvent("operator.conflict.recovered", "reload/compare"); return render(); }
    if (action === "payment-reconcile") { state.paymentState = "uncertain"; state.frame = "WF-PAY-02"; setNotice("Status masih belum diketahui. Pemeriksaan atau bantuan diperlukan; tidak ada pesanan atau pembayaran ulang.", "warning"); return render(); }
    if (action === "history-back") { state.frame = "WF-PUB-01"; setNotice("Kembali ke halaman yang aman.", ""); return render(); }
  });

  document.addEventListener("change", function (event) {
    if (event.target.dataset.action === "scenario-select") selectScenario(event.target.value);
    if (event.target.dataset.action === "consent") { state.consent = event.target.checked; }
    if (event.target.dataset.action === "config-mode") { state.configMode = event.target.value; render(); }
  });

  document.addEventListener("input", function (event) {
    const field = event.target.dataset.field || "";
    if (field.indexOf("b2b-") === 0) {
      const key = field.slice(4);
      state.b2bForm[key] = event.target.value;
      if (state.b2bErrors[key] && event.target.value.trim()) delete state.b2bErrors[key];
    }
    if (field === "after-sales-note") state.afterSalesNote = event.target.value;
  });

  render();
})();
