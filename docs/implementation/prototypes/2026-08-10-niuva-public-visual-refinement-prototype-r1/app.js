(function () {
  "use strict";

  var app = document.getElementById("app");
  var stateKey = "niuvalab.visualRefinementState";
  var initialUrl = new URL(window.location.href);
  var initialContactState = initialUrl.searchParams.get("state") || "empty";
  var invalidFixture = window.NIUVAVISUALFIXTURES && window.NIUVAVISUALFIXTURES["contact-invalid"] && window.NIUVAVISUALFIXTURES["contact-invalid"].seed;
  var seededInvalid = initialContactState === "invalid" && invalidFixture;
  var state = {
    route: normalizeRoute(window.location.pathname),
    detailSlug: getDetailSlug(window.location.pathname),
    contactState: normalizeContactState(initialContactState),
    persistenceFailure: initialContactState === "persistence-fail",
    mapState: "ready",
    whatsappConfirm: false,
    inquirySubmitted: false,
    whatsappReturnState: null,
    focusAfterRender: null,
    form: seededInvalid ? Object.assign({}, invalidFixture.form) : { company: "", pic: "", email: "", phone: "", need: "", timeline: "", brief: "", consent: false },
    errors: seededInvalid ? Object.assign({}, invalidFixture.errors) : {},
    notice: "",
    retailDeferred: false
  };

  function assetPath(relativePath) {
    return "/" + String(relativePath || "").replace(/^\/+/, "");
  }

  var projectData = {
    pindad: {
      slug: "pindad-ev-motor",
      title: "Pindad EV Motor",
      label: "Riset · bentuk · uji",
      image: assetPath("assets/projects/pindad-ev-motor.webp"),
      alt: "Motor listrik Pindad sebagai contoh keluaran pengembangan objek fisik",
      challenge: "Kebutuhan teknis perlu diterjemahkan menjadi bentuk yang bisa ditinjau bersama.",
      decision: "Tim menguji hubungan antara proporsi, komponen, dan pengalaman penggunaan sebelum bentuk akhir dipilih.",
      output: "Satu artefak yang dapat dipakai untuk membaca keputusan desain berikutnya."
    },
    agate: {
      slug: "agate-motorcycle-simulator",
      title: "Agate Motorcycle Simulator",
      label: "Prototipe · pengalaman",
      image: assetPath("assets/projects/agate-motorcycle-simulator.webp"),
      alt: "Simulator sepeda motor Agate sebagai contoh prototipe pengalaman",
      challenge: "Pengalaman interaktif perlu diuji sebelum keputusan produksi diperluas.",
      decision: "Prototipe dipakai untuk menyamakan pemahaman antara bentuk, gerak, dan konteks penggunaan.",
      output: "Artefak pengalaman yang membantu tim menemukan pertanyaan penting lebih awal."
    },
    xeon: {
      slug: "xeon-redesign",
      title: "Xeon Redesign",
      label: "Redesign · keputusan",
      image: assetPath("assets/projects/xeon-redesign.webp"),
      alt: "Detail redesign Xeon sebagai contoh dokumentasi keputusan desain",
      challenge: "Perubahan bentuk harus tetap punya alasan yang dapat dibaca oleh tim lintas fungsi.",
      decision: "Eksplorasi bentuk disusun sebagai rangkaian keputusan, bukan sekadar pilihan tampilan.",
      output: "Dokumentasi visual yang menjaga konteks saat pekerjaan berpindah tangan."
    }
  };

  function normalizeRoute(pathname) {
    var clean = (pathname || "/").replace(/\/index\.html$/, "").replace(/\/$/, "") || "/";
    if (/^\/projects\/[^/]+$/.test(clean)) return "project-detail";
    if (clean === "/projects") return "projects";
    if (clean === "/contact") return "contact";
    return "home";
  }

  function getDetailSlug(pathname) {
    var match = (pathname || "").match(/^\/projects\/([^/]+)/);
    var keyBySlug = { "pindad-ev-motor": "pindad", "agate-motorcycle-simulator": "agate", "xeon-redesign": "xeon" };
    return match ? (keyBySlug[match[1]] || null) : null;
  }

  function normalizeContactState(value) {
    var allowed = { empty: true, invalid: true, success: true, whatsapp: true, "whatsapp-handoff-confirmed": true };
    return allowed[value] ? value : "empty";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function navLink(href, label, route) {
    var active = state.route === route || (route === "projects" && state.route === "project-detail");
    return '<a class="nav-link' + (active ? " is-active" : "") + '" href="' + href + '" data-route="' + route + '"' + (active ? ' aria-current="page"' : '') + '>' + label + '</a>';
  }

  function shell(content, pageLabel) {
    var header = '<header class="site-header"><div class="header-inner"><a class="brand" href="/" data-route="home" aria-label="Niuva, kembali ke Home"><img src="assets/niuva-mark.svg" width="34" height="34" alt="" aria-hidden="true" /><span>niuva</span></a><nav class="site-nav" aria-label="Navigasi utama">' + navLink("/", "Home", "home") + navLink("/projects", "Projects", "projects") + navLink("/contact", "Diskusikan project", "contact") + '</nav><a class="header-action" href="/contact" data-route="contact">Mulai percakapan <span aria-hidden="true">↗</span></a></div></header>';
    var main = '<main id="main-content" tabindex="-1"><div class="simulation-note" role="note"><span class="simulation-dot" aria-hidden="true"></span>SIMULASI · Tidak ada data yang dikirim</div><div class="page-shell" data-page="' + pageLabel + '">' + content + '</div></main>';
    var footer = '<footer class="site-footer"><div><span class="footer-mark">niuva</span><p>Riset, desain, dan pembuatan objek yang bisa diuji.</p></div><div class="footer-meta"><span>Jakarta · Indonesia</span><a href="/contact" data-route="contact">Hubungi Niuva ↗</a></div></footer>';
    var live = '<div id="live-region" class="sr-only" aria-live="polite" aria-atomic="true">' + escapeHtml(state.notice) + '</div>';
    return header + main + footer + live;
  }

  function sectionLabel(text) { return '<p class="section-label">' + text + "</p>"; }
  function button(label, attrs, className) { return '<button type="button" class="button ' + (className || "button-primary") + '" ' + (attrs || "") + '>' + label + "</button>"; }
  function routeButton(label, href, className) { return '<a class="button ' + (className || "button-primary") + '" href="' + href + '" data-route="' + normalizeRoute(href) + '">' + label + "</a>"; }

  function homeView() {
    return '<section class="home-lead"><div class="home-copy"><h1>Benda yang baik dimulai dari pertanyaan yang tepat.</h1><p class="lede">Kami membantu tim mengurai kebutuhan, menguji bentuk, dan membuat artefak yang memberi keputusan lebih jelas sebelum produksi dilanjutkan.</p><p class="hero-path" aria-label="Alur kerja Niuva: Need, Research, Experiment, Prototype, Output"><span>Need</span><span aria-hidden="true">→</span><span>Research</span><span aria-hidden="true">→</span><span>Experiment</span><span aria-hidden="true">→</span><span>Prototype</span><span aria-hidden="true">→</span><span>Output</span></p><div class="action-row">' + routeButton("Diskusikan project", "/contact") + routeButton("Lihat project", "/projects", "button-quiet") + '</div><p class="micro-copy">Untuk partnership, form menjadi catatan utama. WhatsApp tersedia sebagai pilihan cepat setelah Anda memilihnya.</p></div><figure class="lead-artifact"><div class="artifact-label">Bukti kerja</div><img src="assets/projects/pindad-ev-motor.webp" width="555" height="414" alt="Motor listrik Pindad sebagai contoh keluaran pengembangan objek fisik" /><figcaption><span>Pindad EV Motor</span><span>Riset · bentuk · uji</span></figcaption></figure></section><section class="evidence-band" aria-labelledby="evidence-title"><div class="section-intro"><h2 id="evidence-title">Dari kebutuhan yang belum rapi menuju artefak yang dapat dibicarakan.</h2></div><ol class="evidence-thread" aria-label="Alur kerja Niuva"><li><span class="thread-stage">Need</span><strong>Kebutuhan</strong><p>Konteks, batas, dan pertanyaan yang perlu dijawab.</p></li><li><span class="thread-stage">Research</span><strong>Riset</strong><p>Material, bentuk, dan risiko dibaca bersama.</p></li><li><span class="thread-stage">Experiment</span><strong>Eksperimen</strong><p>Alternatif diuji agar keputusan tidak berhenti di asumsi.</p></li><li><span class="thread-stage">Prototype</span><strong>Prototipe</strong><p>Artefak membantu tim melihat hal yang sebelumnya abstrak.</p></li><li><span class="thread-stage">Output</span><strong>Hasil</strong><p>Hasil fisik menjadi dasar langkah berikutnya.</p></li></ol></section><section class="home-split"><div><h2>Setiap hasil membawa jejak keputusan yang membuatnya ada.</h2></div><div class="open-sheet"><p>Research &amp; Development</p><p>Consultant &amp; Workshop</p><p>Design &amp; Prototyping</p><p>Apparel &amp; Merchandise</p><span class="sheet-rule" aria-hidden="true"></span><p class="sheet-note">Empat layanan, satu cara kerja: membuat konteks tetap terlihat.</p></div></section><section class="retail-bridge"><div><h2>Butuh objek siap beli atau custom print?</h2><p>Retail Niuva berjalan sebagai perjalanan transaksi yang terpisah dari partnership. Pilih jalur yang sesuai kebutuhan Anda.</p><p id="retail-status" class="retail-bridge-note" role="status">Halaman transaksi Retail belum dibuka di prototype ini.</p>' + (state.retailDeferred ? '<p class="retail-deferred-note" role="status">Jalur Retail sedang disiapkan; transaksi tetap belum dibuka.</p>' : '') + '</div><button class="text-link retail-trigger" type="button" data-action="retail" aria-describedby="retail-status">Lihat status Retail <span aria-hidden="true">→</span></button></section>';
  }

  function projectRow(project, featured) {
    return '<article class="project-row ' + (featured ? "project-row-featured" : "") + '"><a class="project-image" href="/projects/' + project.slug + '" data-route="project-detail"><img src="' + project.image + '" width="' + (featured ? "555" : "385") + '" height="' + (featured ? "414" : "546") + '" alt="' + project.alt + '" loading="lazy" /><span class="project-image-caption"><strong>' + project.title + '</strong><span>' + project.label + '</span></span></a><div class="project-copy"><h2><a href="/projects/' + project.slug + '" data-route="project-detail">' + project.title + '</a></h2><p>' + project.challenge + '</p><a class="text-link" href="/projects/' + project.slug + '" data-route="project-detail">Baca konteks project <span aria-hidden="true">→</span></a></div></article>';
  }

  function projectsView() {
    return '<section class="route-intro projects-intro"><div><h1>Karya yang menyimpan keputusan.</h1></div><p class="intro-aside">Kami menunjukkan apa yang dapat dibaca dari sebuah pekerjaan: tantangannya, keputusan yang diambil, dan output yang membantu langkah berikutnya.</p></section><section class="project-index" aria-labelledby="project-index-title"><h2 class="sr-only" id="project-index-title">Daftar project</h2>' + projectRow(projectData.pindad, true) + projectRow(projectData.agate, false) + projectRow(projectData.xeon, false) + '</section><section class="projects-end"><p>Belum semua proses dapat ditampilkan sebagai gambar. Kami lebih memilih mencatat batas bukti daripada mengisinya dengan visual yang tidak sesuai.</p><a class="text-link" href="/contact" data-route="contact">Bicarakan kebutuhan Anda <span aria-hidden="true">↗</span></a></section>';
  }

  function projectNotFoundView() {
    return '<section class="not-found" aria-labelledby="project-not-found-title"><h1 id="project-not-found-title">Project tidak ditemukan.</h1><p>Link ini tidak cocok dengan bukti project yang tersedia. Kembali ke daftar project untuk memilih artefak yang benar.</p><a class="button button-primary" href="/projects" data-route="projects">Kembali ke Projects</a></section>';
  }

  function detailView() {
    var project = projectData[state.detailSlug];
    if (!project) return projectNotFoundView();
    return '<section class="detail-top"><a class="back-link" href="/projects" data-route="projects">← Kembali ke project</a><div class="detail-heading"><div><h1>' + project.title + '</h1></div><p class="detail-intro">Satu artefak tidak menjawab semua pertanyaan. Ia membantu tim memilih pertanyaan berikutnya dengan lebih jernih.</p></div></section><section class="detail-artifact"><figure><img src="' + project.image + '" width="555" height="414" alt="' + project.alt + '" /><figcaption>Media project yang disetujui untuk bukti visual.</figcaption></figure><div class="artifact-aside"><span class="artifact-label">Bukti konteks</span><p>Contoh dokumentasi yang menghubungkan kebutuhan teknis dengan bentuk yang dapat diuji.</p></div></section><section class="decision-sheet" aria-label="Konteks project"><div>' + sectionLabel("Tantangan") + '<p>' + project.challenge + '</p></div><div>' + sectionLabel("Keputusan") + '<p>' + project.decision + '</p></div><div>' + sectionLabel("Output") + '<p>' + project.output + '</p></div></section><section class="detail-close"><h2>Apakah Anda sedang memegang pertanyaan yang sama?</h2><a class="text-link" href="/contact" data-route="contact">Ceritakan konteksnya <span aria-hidden="true">↗</span></a></section>';
  }

  function field(id, label, type, required, value, error, placeholder) {
    var described = error ? ' aria-describedby="' + id + '-error" aria-invalid="true"' : "";
    return '<div class="field"><label for="' + id + '">' + label + (required ? ' <span aria-hidden="true">*</span>' : "") + '</label><input id="' + id + '" name="' + id + '" type="' + type + '" value="' + escapeHtml(value) + '" placeholder="' + placeholder + '"' + (required ? " required" : "") + described + ' />' + (error ? '<p class="field-error" id="' + id + '-error">' + error + "</p>" : "") + "</div>";
  }

  function textarea(id, label, required, value, error, placeholder) {
    return '<div class="field field-wide"><label for="' + id + '">' + label + (required ? ' <span aria-hidden="true">*</span>' : "") + '</label><textarea id="' + id + '" name="' + id + '" rows="5" placeholder="' + placeholder + '"' + (required ? " required" : "") + (error ? ' aria-describedby="' + id + '-error" aria-invalid="true"' : "") + '>' + escapeHtml(value) + '</textarea>' + (error ? '<p class="field-error" id="' + id + '-error">' + error + "</p>" : "") + "</div>";
  }

  function contactForm() {
    var errors = state.errors;
    var invalid = Object.keys(errors).length > 0;
    var summary = invalid ? '<div class="error-summary" id="form-error-summary" role="alert" tabindex="-1"><strong>Periksa beberapa bagian sebelum mengirim.</strong><ul>' + Object.keys(errors).map(function (key) { return '<li><a href="#' + key + '">' + escapeHtml(errors[key]) + "</a></li>"; }).join("") + "</ul><p>Data yang sudah diisi tetap dipertahankan.</p></div>" : "";
    var persistenceStatus = state.contactState === "persistence-unavailable" ? '<div class="persistence-status" id="persistence-status" role="alert" tabindex="-1"><strong>Inquiry belum tersimpan.</strong><p>Data yang sudah Anda isi tetap ada. Coba kirim lagi setelah memeriksa koneksi simulasi ini.</p><button class="text-button" type="button" data-action="persistence-retry">Coba kirim lagi <span aria-hidden="true">↗</span></button></div>' : "";
    var disabled = state.contactState === "submitting" ? " disabled" : "";
    var consentError = errors.consent ? '<p class="field-error" id="consent-error">Persetujuan diperlukan agar inquiry dapat ditinjau.</p>' : "";
    return '<form class="inquiry-form" id="inquiry-form" tabindex="-1" novalidate>' + summary + persistenceStatus + '<div class="form-grid">' + field("company", "Perusahaan / organisasi", "text", false, state.form.company, errors.company, "Contoh: Studio Arunika") + field("pic", "Nama PIC", "text", true, state.form.pic, errors.pic, "Nama lengkap") + field("email", "Email PIC", "email", true, state.form.email, errors.email, "nama@contoh.id") + field("phone", "Nomor WhatsApp PIC", "tel", true, state.form.phone, errors.phone, "08xx xxxx xxxx") + field("need", "Kebutuhan", "text", true, state.form.need, errors.need, "Prototipe, workshop, merchandise…") + field("timeline", "Target waktu", "text", false, state.form.timeline, errors.timeline, "Contoh: kuartal 4 2026") + textarea("brief", "Brief singkat", true, state.form.brief, errors.brief, "Ceritakan konteks, jumlah, atau tujuan Anda.") + '</div><label class="consent ' + (errors.consent ? "has-error" : "") + '"><input id="consent" name="consent" type="checkbox"' + (state.form.consent ? " checked" : "") + (errors.consent ? ' aria-describedby="consent-error" aria-invalid="true"' : "") + ' /><span>Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan untuk marketing tanpa persetujuan terpisah.</span></label>' + consentError + '<div class="form-actions">' + '<button class="button button-primary" type="submit"' + disabled + '>' + (state.contactState === "submitting" ? "Menyimpan…" : "Kirim Inquiry") + '</button>' + button("WhatsApp cepat", 'data-action="whatsapp-open"', "button-quiet") + '</div><p class="form-note">Nama PIC, email, nomor WhatsApp, kebutuhan, brief, dan persetujuan wajib. Perusahaan serta target waktu dapat dilengkapi bila relevan.</p></form>';
  }

  function contactAside() {
    var map = state.mapState === "unavailable" ? '<div class="map-state map-unavailable" role="status"><span class="map-icon" aria-hidden="true">⌁</span><strong>Peta tidak tersedia saat ini.</strong><p>Lokasi detail belum tersedia di prototype. Gunakan form untuk menghubungi Niuva atau coba lagi.</p><button class="text-button" type="button" data-action="map-retry">Coba lagi</button></div>' : '<div class="map-state map-ready"><span class="map-grid" aria-hidden="true"></span><strong>Studio Niuva</strong><p>Jakarta · Indonesia</p><span class="map-caption">Lokasi visual simulasi — provider tidak dipanggil.</span></div>';
    return '<aside class="contact-aside"><div class="response-sheet"><h2>Respons manusia, bukan janji otomatis.</h2><dl><div><dt>Owner</dt><dd>Niuva Operations</dd></div><div><dt>Target pertama</dt><dd>Maks. 1 hari kerja</dd></div><div><dt>Kalender</dt><dd>Senin–Jumat · 09.00–17.00 WIB</dd></div></dl><p class="aside-note">Hari libur dikecualikan. Target ini bukan jaminan quotation, harga, ETA, atau project creation.</p></div><div class="map-sheet"><h2 class="aside-heading">Kunjungi studio</h2>' + map + '</div></aside>';
  }

  function successView() {
    return '<section class="success-layout" id="contact-status" tabindex="-1" aria-labelledby="success-title" aria-live="polite"><div class="success-main"><span class="status-mark" aria-hidden="true">✓</span><p class="section-label">Inquiry tercatat · simulasi</p><h1 id="success-title">Brief Anda siap ditinjau.</h1><p class="lede">Niuva Operations akan meninjau konteks yang Anda kirim dan memberikan respons manusia pertama sesuai kalender kerja.</p><div class="acknowledgement"><div><span>Referensi</span><strong>INQ-SIM-001</strong></div><div><span>Langkah berikutnya</span><strong>Review oleh Niuva Operations</strong></div></div><div class="action-row"><button class="button button-primary" type="button" data-action="whatsapp-open">Pilih WhatsApp cepat</button><a class="button button-quiet" href="/" data-route="home">Kembali ke Home</a></div><p class="form-note">WhatsApp tidak dikirim otomatis dan tidak menggantikan catatan Inquiry.</p></div><div class="success-side"><p class="section-label">Batas yang jelas</p><p>Konfirmasi ini tidak menjanjikan quotation, harga, ETA, pengiriman, atau project creation.</p></div></section>';
  }

  function whatsappView() {
    var intro = state.inquirySubmitted
      ? "Inquiry Anda sudah tercatat. Anda memilih untuk membuka percakapan eksternal sebagai langkah lanjutan."
      : "Form belum dikirim. Handoff WhatsApp tidak membuat Inquiry secara otomatis; Anda dapat kembali mengisi form terlebih dahulu.";
    return '<section class="handoff" id="whatsapp-handoff" tabindex="-1" aria-labelledby="whatsapp-handoff-title"><div class="handoff-mark" aria-hidden="true">↗</div><p class="section-label">Pilihan cepat · WhatsApp</p><h1 id="whatsapp-handoff-title">Periksa tujuan sebelum melanjutkan.</h1><p class="lede">' + intro + ' Tidak ada pesan yang dikirim otomatis.</p><div class="handoff-actions"><button class="button button-primary" type="button" data-action="whatsapp-confirm">Siapkan handoff WhatsApp</button><button class="button button-quiet" type="button" data-action="whatsapp-cancel">Kembali</button></div><p class="form-note">Handoff ini hanya disimulasikan di prototype.</p></section>';
  }

  function whatsappHandoffView() {
    var submitted = state.inquirySubmitted;
    var title = submitted ? "WhatsApp siap dibuka." : "WhatsApp siap dibuka, form belum terkirim.";
    var intro = submitted
      ? "Inquiry Anda sudah tercatat. Handoff ini hanya disimulasikan dan tidak mengubah status Inquiry."
      : "Handoff ini hanya disimulasikan. Inquiry belum tercatat karena form belum dikirim; isi dan kirim form agar kebutuhan dapat ditinjau.";
    var action = submitted ? "Kembali ke Inquiry" : "Kembali ke form";
    return '<section class="handoff handoff-confirmed" id="whatsapp-handoff-status" tabindex="-1" aria-labelledby="whatsapp-handoff-status-title" aria-live="polite"><div class="handoff-mark" aria-hidden="true">✓</div><p class="section-label">Handoff disiapkan · WhatsApp</p><h1 id="whatsapp-handoff-status-title">' + title + '</h1><p class="lede">' + intro + '</p><div class="handoff-actions"><button class="button button-primary" type="button" data-action="whatsapp-return">' + action + '</button><a class="button button-quiet" href="/" data-route="home">Kembali ke Home</a></div><p class="form-note">Tidak ada provider atau pesan eksternal yang dipanggil.</p></section>';
  }

  function contactView() {
    if (state.contactState === "success") return successView();
    if (state.contactState === "whatsapp") return whatsappView();
    if (state.contactState === "whatsapp-handoff-confirmed") return whatsappHandoffView();
    var unavailable = state.contactState === "persistence-unavailable";
    var title = state.contactState === "invalid" ? "Beberapa detail perlu dilengkapi." : unavailable ? "Inquiry belum tersimpan." : "Bawa pertanyaan yang cukup penting untuk dibahas.";
    var intro = state.contactState === "invalid" ? "Form belum dikirim. Periksa pesan di setiap field; isi yang sudah Anda tulis tetap ada." : unavailable ? "Data yang sudah Anda isi tetap ada. Kirim lagi setelah simulasi penyimpanan tersedia." : "Ceritakan konteksnya. Form menjadi catatan utama untuk kebutuhan partnership dan B2B.";
    var responseSummary = '<div class="contact-response-summary" aria-label="Ekspektasi respons"><div><span>Owner</span><strong>Niuva Operations</strong></div><div><span>Respons pertama</span><strong>Maks. 1 hari kerja</strong></div><div><span>Kalender</span><strong>Senin–Jumat · 09.00–17.00 WIB</strong></div></div>';
    return '<section class="route-intro contact-intro"><div><h1>' + title + '</h1></div><div class="intro-aside"><p>' + intro + '</p>' + responseSummary + '<div class="contact-start-actions"><a class="button button-primary contact-start" href="#inquiry-form">Mulai isi form <span aria-hidden="true">↓</span></a><button class="button button-quiet contact-whatsapp-start" type="button" data-action="whatsapp-open" aria-describedby="contact-channel-note">WhatsApp cepat</button></div><p class="contact-channel-note" id="contact-channel-note">Inquiry hanya tercatat setelah Anda mengirim form. WhatsApp adalah pilihan lanjutan; tidak ada pesan otomatis.</p></div></section><section class="contact-layout"><div class="form-sheet"><div class="sheet-heading"><h2>Satu catatan untuk memulai percakapan.</h2></div>' + contactForm() + '</div>' + contactAside() + '</section>';
  }

  function revealContactState(selector) {
    var target = document.querySelector(selector);
    if (!target) return;
    var align = function () {
      var header = document.querySelector(".site-header");
      var offset = (header ? header.getBoundingClientRect().height : 0) + 16;
      var targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      var previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, targetTop);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
    window.setTimeout(function () {
      target.focus({ preventScroll: true });
      window.setTimeout(align, 50);
    }, 0);
    window.setTimeout(align, 120);
  }

  function focusAfterContactReturn(contactState) {
    if (contactState === "invalid") return "#form-error-summary";
    if (contactState === "persistence-unavailable") return "#persistence-status";
    if (contactState === "empty") return "#inquiry-form";
    return null;
  }

  function render() {
    var content;
    var label;
    if (state.route === "projects") { content = projectsView(); label = "projects"; }
    else if (state.route === "project-detail") { content = detailView(); label = state.detailSlug ? "project-detail" : "project-not-found"; }
    else if (state.route === "contact") { content = contactView(); label = "contact"; }
    else { content = homeView(); label = "home"; }
    app.innerHTML = shell(content, label);
    document.title = state.route === "home" ? "Niuva — Dari kebutuhan menjadi objek" : state.route === "projects" ? "Niuva — Project evidence" : state.route === "project-detail" ? (state.detailSlug ? "Niuva — Project evidence" : "Niuva — Project tidak ditemukan") : "Niuva — Diskusikan project";
    wireEvents();
    if (state.focusAfterRender) {
      var focusTarget = state.focusAfterRender;
      state.focusAfterRender = null;
      revealContactState(focusTarget);
    } else if (state.contactState === "invalid") {
      revealContactState("#form-error-summary");
    } else if (state.contactState === "persistence-unavailable") {
      revealContactState("#persistence-status");
    } else if (state.contactState === "success") {
      revealContactState("#contact-status");
    } else if (state.contactState === "whatsapp") {
      revealContactState("#whatsapp-handoff");
    } else if (state.contactState === "whatsapp-handoff-confirmed") {
      revealContactState("#whatsapp-handoff-status");
    }
  }

  function navigate(href) {
    var url = new URL(href, window.location.origin);
    history.pushState({}, "", url.pathname + url.search + url.hash);
    state.route = normalizeRoute(url.pathname);
    state.detailSlug = getDetailSlug(url.pathname);
    state.contactState = normalizeContactState(url.searchParams.get("state"));
    state.persistenceFailure = url.searchParams.get("state") === "persistence-fail";
    state.inquirySubmitted = state.contactState === "success";
    state.whatsappReturnState = null;
    state.focusAfterRender = null;
    state.errors = {};
    state.whatsappConfirm = state.contactState === "whatsapp";
    state.notice = "";
    state.retailDeferred = false;
    render();
    var main = document.getElementById("main-content");
    if (main) main.focus();
  }

  function readForm(form) {
    var data = new FormData(form);
    return { company: String(data.get("company") || ""), pic: String(data.get("pic") || ""), email: String(data.get("email") || ""), phone: String(data.get("phone") || ""), need: String(data.get("need") || ""), timeline: String(data.get("timeline") || ""), brief: String(data.get("brief") || ""), consent: data.get("consent") === "on" };
  }

  function validateForm() {
    var errors = {};
    ["pic", "email", "phone", "need", "brief"].forEach(function (key) { if (!state.form[key].trim()) errors[key] = "Bagian ini wajib diisi."; });
    if (state.form.email && !/^\S+@\S+\.\S+$/.test(state.form.email)) errors.email = "Gunakan alamat email yang valid.";
    if (!state.form.consent) errors.consent = "Persetujuan diperlukan.";
    return errors;
  }

  function handleSubmit(form) {
    state.form = readForm(form);
    state.errors = validateForm();
    if (Object.keys(state.errors).length) { state.contactState = "invalid"; state.notice = "Form belum lengkap. Periksa ringkasan error."; render(); return; }
    state.contactState = "submitting";
    state.notice = "Inquiry sedang disiapkan dalam simulasi.";
    render();
    window.setTimeout(function () {
      if (sessionStorage.getItem(stateKey) === "contact-persistence-fail" || state.persistenceFailure) {
        state.contactState = "persistence-unavailable";
        state.inquirySubmitted = false;
        state.errors = {};
        state.notice = "Inquiry belum tersimpan.";
      } else {
        state.contactState = "success";
        state.inquirySubmitted = true;
        state.notice = "Brief Anda siap ditinjau.";
      }
      render();
    }, 350);
  }

  function wireEvents() {
    app.querySelectorAll("[data-route]").forEach(function (element) {
      element.addEventListener("click", function (event) { event.preventDefault(); navigate(element.getAttribute("href")); });
    });
    app.querySelectorAll("[data-action]").forEach(function (element) {
      element.addEventListener("click", function () {
        var action = element.getAttribute("data-action");
        if (action === "retail") { state.retailDeferred = true; state.notice = "Jalur Retail sedang disiapkan; transaksi belum dibuka di prototype."; render(); }
        if (action === "map-retry") { state.mapState = "ready"; state.notice = "Detail lokasi ditampilkan kembali."; render(); }
        if (action === "persistence-retry") {
          state.persistenceFailure = false;
          state.contactState = "empty";
          state.errors = {};
          state.notice = "Form siap dikirim ulang; isi tetap dipertahankan.";
          sessionStorage.removeItem(stateKey);
          state.focusAfterRender = "#inquiry-form";
          render();
        }
        if (action === "whatsapp-open") {
          state.whatsappReturnState = state.contactState === "success" ? "success" : state.contactState === "invalid" ? "invalid" : state.contactState === "persistence-unavailable" ? "persistence-unavailable" : "empty";
          state.contactState = "whatsapp";
          render();
        }
        if (action === "whatsapp-cancel") {
          var cancelState = state.whatsappReturnState || (state.inquirySubmitted ? "success" : "empty");
          state.contactState = cancelState;
          state.focusAfterRender = focusAfterContactReturn(cancelState);
          state.whatsappReturnState = null;
          render();
        }
        if (action === "whatsapp-confirm") {
          state.notice = state.inquirySubmitted
            ? "Handoff WhatsApp disimulasikan; status Inquiry tetap tercatat."
            : "Handoff WhatsApp disimulasikan; Inquiry belum tercatat karena form belum dikirim.";
          state.contactState = "whatsapp-handoff-confirmed";
          render();
        }
        if (action === "whatsapp-return") {
          var returnState = state.whatsappReturnState || (state.inquirySubmitted ? "success" : "empty");
          state.contactState = returnState;
          state.focusAfterRender = focusAfterContactReturn(returnState);
          state.whatsappReturnState = null;
          render();
        }
      });
    });
    var form = document.getElementById("inquiry-form");
    if (form) {
      form.addEventListener("submit", function (event) { event.preventDefault(); handleSubmit(form); });
      form.addEventListener("input", function () { state.form = readForm(form); });
    }
  }

  window.addEventListener("popstate", function () {
    var url = new URL(window.location.href);
    state.route = normalizeRoute(url.pathname);
    state.detailSlug = getDetailSlug(url.pathname);
    state.contactState = normalizeContactState(url.searchParams.get("state"));
    state.persistenceFailure = url.searchParams.get("state") === "persistence-fail";
    state.inquirySubmitted = state.contactState === "success";
    state.whatsappReturnState = null;
    state.focusAfterRender = null;
    state.errors = {};
    state.retailDeferred = false;
    if (state.contactState === "invalid" && invalidFixture) {
      state.form = Object.assign({}, invalidFixture.form);
      state.errors = Object.assign({}, invalidFixture.errors);
    }
    render();
  });

  var seeded = sessionStorage.getItem(stateKey);
  if (seeded && seeded.indexOf("contact-") === 0) {
    var seededState = seeded.replace("contact-", "");
    if (seededState === "persistence-fail") {
      state.persistenceFailure = true;
      state.contactState = "empty";
    } else {
      state.contactState = normalizeContactState(seededState);
    }
  }
  if (state.contactState === "success") state.inquirySubmitted = true;
  if (seeded === "contact-unavailable") state.mapState = "unavailable";
  if (seeded === "contact-whatsapp") state.whatsappConfirm = true;
  if (new URLSearchParams(window.location.search).get("state") === "unavailable") state.mapState = "unavailable";
  render();
}());
