/* Synthetic-only contract data for the Niuva bounded prototype. */
(function (root, factory) {
  const data = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = data;
  if (root) root.NiuvaPrototype = data;
})(typeof window !== "undefined" ? window : null, function () {
  const FRAME_IDS = [
    "WF-ADM-01", "WF-ADM-02", "WF-ADM-03", "WF-ADM-04", "WF-ADM-05",
    "WF-ADM-06", "WF-AFS-01", "WF-AFS-02", "WF-AUTH-01", "WF-B2B-01",
    "WF-B2B-02", "WF-CART-01", "WF-CFG-01", "WF-CFG-02", "WF-CFG-03",
    "WF-CHK-01", "WF-CHK-02", "WF-CHK-03", "WF-CMS-01", "WF-DASH-01",
    "WF-EXT-01", "WF-LEGACY-01", "WF-NOTIF-01", "WF-OFFER-01",
    "WF-OFFER-02", "WF-ORD-01", "WF-ORD-02", "WF-ORD-03", "WF-ORD-04",
    "WF-OWN-SAFE", "WF-PAY-01", "WF-PAY-02", "WF-PAY-03", "WF-PUB-01",
    "WF-PUB-02", "WF-REQ-01", "WF-RET-01"
  ];

  const TRANSITION_IDS = [
    "PT-ADM-00", "PT-ADM-01", "PT-ADM-02", "PT-ADM-03", "PT-ADM-03-DENY",
    "PT-ADM-04", "PT-ADM-05", "PT-ADM-07", "PT-ADM-08", "PT-ADM-09",
    "PT-ADM-10", "PT-AFS-00", "PT-AFS-01", "PT-AFS-02", "PT-AFS-03",
    "PT-AFS-04", "PT-AFS-05", "PT-AFS-06", "PT-AUTH-01", "PT-AUTH-02",
    "PT-AUTH-03", "PT-AUTH-04", "PT-AUTH-05", "PT-B2B-01", "PT-B2B-02",
    "PT-B2B-03", "PT-B2B-04", "PT-CART-01", "PT-CART-02", "PT-CART-03",
    "PT-CFG-01", "PT-CFG-02", "PT-CFG-03", "PT-CFG-04", "PT-CFG-05",
    "PT-CFG-06", "PT-CHK-01", "PT-CHK-02", "PT-CHK-03", "PT-CHK-04",
    "PT-CHK-05", "PT-CHK-06", "PT-CMS-00", "PT-CMS-01", "PT-CMS-02",
    "PT-CMS-03", "PT-DASH-01", "PT-DASH-02", "PT-DASH-03", "PT-DASH-04",
    "PT-DASH-05", "PT-DASH-06", "PT-EXT-01", "PT-EXT-02", "PT-EXT-03",
    "PT-LEGACY-01", "PT-LEGACY-02", "PT-NOTIF-01", "PT-OFFER-01",
    "PT-OFFER-02", "PT-OFFER-03", "PT-OFFER-04", "PT-OFFER-05", "PT-ORD-01",
    "PT-ORD-02", "PT-ORD-03", "PT-ORD-04", "PT-ORD-05", "PT-ORD-06",
    "PT-ORD-07", "PT-OWN-01", "PT-OWN-02", "PT-OWN-03", "PT-OWN-04",
    "PT-PAY-01", "PT-PAY-02", "PT-PAY-03", "PT-PAY-04", "PT-PAY-05",
    "PT-PAY-06", "PT-PUB-01", "PT-PUB-02", "PT-PUB-03", "PT-PUB-04",
    "PT-PUB-05", "PT-REQ-01", "PT-REQ-02", "PT-REQ-03", "PT-RES-01",
    "PT-RES-02", "PT-RES-03", "PT-RES-04", "PT-RES-05", "PT-RET-01",
    "PT-STOCK-01"
  ];

  const FIXTURE_IDS = [
    "FX-ADMIN-CONFLICT", "FX-ADMIN-ROLE-CAPABILITY", "FX-ADMIN-TRANSACTION-UNAVAILABLE",
    "FX-AFTER-LIFECYCLE", "FX-AFTER-REVIEW", "FX-AUTH-BOUNDARY", "FX-B2B-HANDOFF",
    "FX-B2B-INVALID", "FX-B2B-PERSISTENCE-FAIL", "FX-B2B-VALID", "FX-CHECKOUT-CREATION-FAIL",
    "FX-CMS-LIFECYCLE", "FX-CUSTOM-ELIGIBLE", "FX-CUSTOM-QUOTE", "FX-CUSTOM-RECOVERY",
    "FX-DASHBOARD", "FX-EXT-B2B", "FX-EXT-PUBLIC", "FX-FULFILLMENT-UNAVAILABLE",
    "FX-LEGACY-ARCHIVE", "FX-LEGACY-ORDER", "FX-MIXED-CART", "FX-NOT-FOUND",
    "FX-NOTIFICATION-ROLE", "FX-OFFER-ACTIVE", "FX-OFFER-TERMINAL",
    "FX-ORDER-CUSTOM-DELIVERY", "FX-ORDER-CUSTOM-PICKUP", "FX-ORDER-EXCEPTIONS",
    "FX-ORDER-OVERDUE", "FX-ORDER-PICKUP-OVERDUE", "FX-ORDER-READY-DELIVERY",
    "FX-ORDER-READY-PICKUP", "FX-OWNERSHIP-DENIED", "FX-PAY-ACTION-REQUIRED",
    "FX-PAY-PENDING", "FX-PAY-TERMINAL", "FX-PAY-UNCERTAIN", "FX-READY-DELIVERY-STALE",
    "FX-READY-PICKUP", "FX-REQUEST-ROUTING", "FX-RESERVATION-STATES", "FX-STOCK-ALERT"
  ];

  const SCENARIO_IDS = [
    "SCN-ADM-01", "SCN-ADM-02", "SCN-ADM-REQUEST-01", "SCN-ADM-TRANSACTION-01",
    "SCN-AFS-01", "SCN-AFS-02", "SCN-AFS-FINANCE-01", "SCN-AFS-REVIEW-01",
    "SCN-AUTH-CART-01", "SCN-AUTH-CFG-01", "SCN-AUTH-RECOVERY-01", "SCN-B2B-01",
    "SCN-B2B-02", "SCN-B2B-03", "SCN-B2B-HANDOFF-01", "SCN-CHK-01",
    "SCN-CHK-CREATION-FAIL-01", "SCN-CHK-FULFILLMENT-01", "SCN-CMS-01",
    "SCN-CMS-02", "SCN-CMS-03", "SCN-CUSTOM-01", "SCN-CUSTOM-RECOVERY-01",
    "SCN-DASH-01", "SCN-LEGACY-01", "SCN-MIXED-01", "SCN-NOTIF-01",
    "SCN-OFFER-01", "SCN-OFFER-DECLINE-01", "SCN-OFFER-RECOVERY-01", "SCN-ORD-01",
    "SCN-ORD-02", "SCN-ORD-EXCEPTIONS-01", "SCN-ORD-PICKUP-OVERDUE-01",
    "SCN-ORD-VARIANTS-01", "SCN-OWNERSHIP-01", "SCN-OWNERSHIP-02", "SCN-PAY-01",
    "SCN-PAY-RECOVERY-01", "SCN-QUOTE-01", "SCN-QUOTE-ROUTING-01", "SCN-READY-01",
    "SCN-RES-01", "SCN-STOCK-01"
  ];

  const FRAME_META = {
    "WF-PUB-01": { label: "Unified Homepage", route: "/", eyebrow: "Public path" },
    "WF-PUB-02": { label: "Capabilities", route: "/capabilities", eyebrow: "Public path" },
    "WF-B2B-01": { label: "Inquiry form", route: "/contact#form-konsultasi", eyebrow: "B2B / partnership" },
    "WF-B2B-02": { label: "Inquiry acknowledgement", route: "/contact#form-konsultasi", eyebrow: "B2B / partnership" },
    "WF-EXT-01": { label: "External action confirmation", route: "External WhatsApp handoff", eyebrow: "Boundary" },
    "WF-RET-01": { label: "Retail discovery", route: "/retail", eyebrow: "Retail" },
    "WF-CART-01": { label: "Conceptual cart", route: "/retail/cart", eyebrow: "Retail" },
    "WF-AUTH-01": { label: "Sign in continuation", route: "/login", eyebrow: "Account boundary" },
    "WF-CFG-01": { label: "Custom Print setup", route: "/retail/products/custom-print/configure", eyebrow: "Custom 3D Print" },
    "WF-CFG-02": { label: "File analysis result", route: "/retail/products/custom-print/configure", eyebrow: "Custom 3D Print" },
    "WF-CFG-03": { label: "Calculated print result", route: "/retail/products/custom-print/configure", eyebrow: "Custom 3D Print" },
    "WF-REQ-01": { label: "Retail Request", route: "/retail/requests/:requestId", eyebrow: "Request lifecycle" },
    "WF-OFFER-01": { label: "Assisted Retail Offer", route: "/retail/offers/:offerId", eyebrow: "Offer lifecycle" },
    "WF-OFFER-02": { label: "Offer result / revalidation", route: "/retail/offers/:offerId", eyebrow: "Offer lifecycle" },
    "WF-CHK-01": { label: "Checkout review", route: "/retail/checkout", eyebrow: "Checkout" },
    "WF-CHK-02": { label: "Checkout changes", route: "/retail/checkout", eyebrow: "Checkout" },
    "WF-CHK-03": { label: "Fulfillment fallback", route: "/retail/checkout", eyebrow: "Checkout" },
    "WF-PAY-01": { label: "Payment in progress", route: "/retail/checkout", eyebrow: "Payment" },
    "WF-PAY-02": { label: "Payment uncertain", route: "/retail/checkout", eyebrow: "Payment" },
    "WF-PAY-03": { label: "Payment terminal", route: "/retail/checkout", eyebrow: "Payment" },
    "WF-ORD-01": { label: "Owned Order", route: "/orders/:id", eyebrow: "Order tracking" },
    "WF-ORD-02": { label: "Production milestones", route: "/orders/:id", eyebrow: "Order tracking" },
    "WF-ORD-03": { label: "Order exception / overdue", route: "/orders/:id", eyebrow: "Order tracking" },
    "WF-ORD-04": { label: "Order recovery", route: "/orders/:id", eyebrow: "Order tracking" },
    "WF-AFS-01": { label: "After-sales request", route: "Customer after-sales route (candidate)", eyebrow: "After-sales" },
    "WF-AFS-02": { label: "After-sales review", route: "Customer after-sales route (candidate)", eyebrow: "After-sales" },
    "WF-DASH-01": { label: "Customer dashboard", route: "/dashboard", eyebrow: "Account" },
    "WF-NOTIF-01": { label: "Notifications", route: "/dashboard/notifications", eyebrow: "Account" },
    "WF-ADM-01": { label: "Admin queue", route: "/admin", eyebrow: "Review Mode operator" },
    "WF-ADM-02": { label: "Request / Offer detail", route: "/admin/retail-requests/:id", eyebrow: "Review Mode operator" },
    "WF-ADM-03": { label: "Retail Order workbench", route: "/admin/retail-orders/:id", eyebrow: "Review Mode operator" },
    "WF-ADM-04": { label: "Retail Case workbench", route: "/admin/retail-cases/:caseId", eyebrow: "Review Mode operator" },
    "WF-ADM-05": { label: "Inventory alert", route: "/admin/inventory", eyebrow: "Review Mode operator" },
    "WF-ADM-06": { label: "Legacy archive", route: "/admin/orders", eyebrow: "Compatibility" },
    "WF-CMS-01": { label: "CMS lifecycle", route: "/admin/content", eyebrow: "Review Mode operator" },
    "WF-OWN-SAFE": { label: "Safe unavailable state", route: "Owned-record boundary", eyebrow: "Privacy boundary" },
    "WF-LEGACY-01": { label: "Legacy customer compatibility", route: "/order", eyebrow: "Compatibility" }
  };

  const SCENARIO_META = {
    "SCN-B2B-01": ["Submit a form-first B2B Inquiry", "WF-B2B-01", "FX-B2B-VALID", "Public prospect"],
    "SCN-B2B-02": ["Recover from invalid B2B fields", "WF-B2B-01", "FX-B2B-INVALID", "Public prospect"],
    "SCN-B2B-03": ["Recover from Inquiry persistence failure", "WF-B2B-01", "FX-B2B-PERSISTENCE-FAIL", "Public prospect"],
    "SCN-B2B-HANDOFF-01": ["Verify Request → separate B2B Inquiry handoff", "WF-REQ-01", "FX-B2B-HANDOFF", "sales_estimator"],
    "SCN-READY-01": ["Buy a Ready Product safely", "WF-RET-01", "FX-READY-PICKUP", "Authenticated customer"],
    "SCN-AUTH-RECOVERY-01": ["Reauthenticate without losing ownership", "WF-AUTH-01", "FX-AUTH-BOUNDARY", "Authenticated customer"],
    "SCN-AUTH-CART-01": ["Sign in and return to cart", "WF-CART-01", "FX-AUTH-BOUNDARY", "Retail visitor"],
    "SCN-AUTH-CFG-01": ["Sign in and return to configurator", "WF-CFG-01", "FX-AUTH-BOUNDARY", "Retail visitor"],
    "SCN-MIXED-01": ["Separate direct and quote-required cart lanes", "WF-CART-01", "FX-MIXED-CART", "Authenticated customer"],
    "SCN-CUSTOM-01": ["Understand calculated Custom Print result", "WF-CFG-01", "FX-CUSTOM-ELIGIBLE", "Authenticated customer"],
    "SCN-CUSTOM-RECOVERY-01": ["Recover from file or analysis failure", "WF-CFG-02", "FX-CUSTOM-RECOVERY", "Authenticated customer"],
    "SCN-QUOTE-01": ["Continue when automatic commitment is unavailable", "WF-CFG-02", "FX-CUSTOM-QUOTE", "Authenticated customer"],
    "SCN-QUOTE-ROUTING-01": ["Route quote-required work safely", "WF-REQ-01", "FX-REQUEST-ROUTING", "sales_estimator"],
    "SCN-OFFER-01": ["Accept an Assisted Retail Offer", "WF-OFFER-01", "FX-OFFER-ACTIVE", "Authenticated customer"],
    "SCN-OFFER-RECOVERY-01": ["Recover from expired or stale Offer", "WF-OFFER-02", "FX-OFFER-TERMINAL", "Authenticated customer"],
    "SCN-OFFER-DECLINE-01": ["Decline an active Offer", "WF-OFFER-01", "FX-OFFER-ACTIVE", "Authenticated customer"],
    "SCN-CHK-01": ["Review changed checkout values", "WF-CHK-01", "FX-READY-DELIVERY-STALE", "Authenticated customer"],
    "SCN-CHK-FULFILLMENT-01": ["Recover from unavailable delivery service", "WF-CHK-03", "FX-FULFILLMENT-UNAVAILABLE", "Authenticated customer"],
    "SCN-CHK-CREATION-FAIL-01": ["Recover from fail-closed checkout creation", "WF-CHK-01", "FX-CHECKOUT-CREATION-FAIL", "Authenticated customer"],
    "SCN-RES-01": ["Understand reservation timer and expiry", "WF-PAY-01", "FX-RESERVATION-STATES", "Authenticated customer"],
    "SCN-PAY-01": ["Recover from unknown payment outcome", "WF-PAY-02", "FX-PAY-UNCERTAIN", "Authenticated customer"],
    "SCN-PAY-RECOVERY-01": ["Recover from pending or terminal payment", "WF-PAY-01", "FX-PAY-PENDING", "Authenticated customer"],
    "SCN-ORD-01": ["Find production progress and ETA", "WF-ORD-01", "FX-ORDER-CUSTOM-DELIVERY", "Authenticated customer"],
    "SCN-ORD-02": ["Respond to overdue ETA", "WF-ORD-03", "FX-ORDER-OVERDUE", "Authenticated customer"],
    "SCN-ORD-PICKUP-OVERDUE-01": ["Respond to overdue pickup", "WF-ORD-03", "FX-ORDER-PICKUP-OVERDUE", "Authenticated customer"],
    "SCN-ORD-EXCEPTIONS-01": ["Understand an Order exception", "WF-ORD-04", "FX-ORDER-EXCEPTIONS", "Authenticated customer"],
    "SCN-ORD-VARIANTS-01": ["Compare four milestone sequences", "WF-ORD-02", "FX-ORDER-CUSTOM-PICKUP", "Authenticated customer"],
    "SCN-AFS-01": ["Submit an eligible after-sales request", "WF-AFS-01", "FX-AFTER-REVIEW", "Authenticated customer"],
    "SCN-AFS-02": ["Understand after-sales eligibility", "WF-AFS-01", "FX-AFTER-LIFECYCLE", "Authenticated customer"],
    "SCN-AFS-REVIEW-01": ["Review and govern a Case", "WF-ADM-04", "FX-AFTER-REVIEW", "order_admin"],
    "SCN-AFS-FINANCE-01": ["Prepare Finance reconciliation", "WF-ADM-04", "FX-AFTER-REVIEW", "finance"],
    "SCN-ADM-01": ["Recover from a stale operator save", "WF-ADM-01", "FX-ADMIN-CONFLICT", "order_admin"],
    "SCN-ADM-REQUEST-01": ["Prepare an Assisted Retail Offer draft", "WF-ADM-02", "FX-ADMIN-ROLE-CAPABILITY", "sales_estimator"],
    "SCN-ADM-02": ["Approve or reject an Offer", "WF-ADM-02", "FX-ADMIN-ROLE-CAPABILITY", "manager_approver"],
    "SCN-ADM-TRANSACTION-01": ["Recover from unavailable Admin transaction", "WF-ADM-03", "FX-ADMIN-TRANSACTION-UNAVAILABLE", "order_admin"],
    "SCN-CMS-01": ["Edit and preview content", "WF-CMS-01", "FX-CMS-LIFECYCLE", "content_editor"],
    "SCN-CMS-02": ["Use rollback and archive safely", "WF-CMS-01", "FX-CMS-LIFECYCLE", "content_editor"],
    "SCN-CMS-03": ["Publish with manager capability", "WF-CMS-01", "FX-CMS-LIFECYCLE", "manager_approver"],
    "SCN-DASH-01": ["Find the next owned action", "WF-DASH-01", "FX-DASHBOARD", "Authenticated customer"],
    "SCN-OWNERSHIP-01": ["Open a foreign or missing record", "WF-OWN-SAFE", "FX-OWNERSHIP-DENIED", "Authenticated customer"],
    "SCN-OWNERSHIP-02": ["Attempt foreign Request, Offer, and Case", "WF-OWN-SAFE", "FX-NOT-FOUND", "Authenticated customer"],
    "SCN-STOCK-01": ["Triage a stock alert", "WF-ADM-05", "FX-STOCK-ALERT", "warehouse"],
    "SCN-NOTIF-01": ["Inspect a role-scoped notification", "WF-NOTIF-01", "FX-NOTIFICATION-ROLE", "Authenticated customer"],
    "SCN-LEGACY-01": ["Distinguish active and legacy surfaces", "WF-LEGACY-01", "FX-LEGACY-ORDER", "Authenticated customer"]
  };

  const TRANSITION_OVERRIDES = {
    "PT-PUB-01": { from: "WF-PUB-01", to: "WF-PUB-02", label: "Open consultation path", safe: true },
    "PT-PUB-04": { from: "WF-PUB-01", to: "WF-RET-01", label: "Browse Retail", safe: true },
    "PT-B2B-01": { from: "WF-B2B-01", to: "WF-B2B-02", label: "Submit valid Inquiry", safe: true },
    "PT-B2B-03": { from: "WF-B2B-02", to: "WF-EXT-01", label: "Open WhatsApp confirmation", safe: true },
    "PT-RET-01": { from: "WF-RET-01", to: "WF-CART-01", label: "Add Ready Product", safe: true },
    "PT-CART-01": { from: "WF-CART-01", to: "WF-AUTH-01", label: "Continue to sign in", safe: true },
    "PT-CART-02": { from: "WF-CART-01", to: "WF-CHK-01", label: "Open checkout", safe: true },
    "PT-CFG-03": { from: "WF-CFG-02", to: "WF-REQ-01", label: "Retain quote-required Request", safe: true, noCommit: true },
    "PT-CFG-05": { from: "WF-CFG-03", to: "WF-CART-01", label: "Carry eligible result to cart", safe: true, noCommit: true },
    "PT-OFFER-01": { from: "WF-OFFER-01", to: "WF-OFFER-02", label: "Accept Offer snapshot", safe: true, noCommit: true },
    "PT-OFFER-02": { from: "WF-OFFER-02", to: "WF-CHK-01", label: "Continue after revalidation", safe: true },
    "PT-CHK-02": { from: "WF-CHK-01", to: "WF-CHK-02", label: "Review authoritative delta", safe: true },
    "PT-CHK-03": { from: "WF-CHK-01", to: "WF-CHK-03", label: "Handle fulfillment fallback", safe: true },
    "PT-CHK-04": { from: "WF-CHK-01", to: "WF-CHK-01", label: "Recover from fail-closed creation", safe: true, noCommit: true },
    "PT-PAY-01": { from: "WF-CHK-01", to: "WF-PAY-01", label: "Start payment reservation", safe: true },
    "PT-PAY-02": { from: "WF-PAY-01", to: "WF-PAY-02", label: "Reconcile uncertain payment", safe: true, noDuplicate: true },
    "PT-PAY-03": { from: "WF-PAY-01", to: "WF-PAY-03", label: "Resolve terminal payment", safe: true },
    "PT-ORD-01": { from: "WF-PAY-03", to: "WF-ORD-01", label: "Open owned Order", safe: true },
    "PT-ORD-05": { from: "WF-ORD-01", to: "WF-ORD-02", label: "View production milestone", safe: true },
    "PT-ORD-07": { from: "WF-ORD-02", to: "WF-ORD-03", label: "View pickup overdue", safe: true },
    "PT-AFS-01": { from: "WF-ORD-01", to: "WF-AFS-01", label: "Start eligible after-sales action", safe: true },
    "PT-AFS-02": { from: "WF-AFS-01", to: "WF-AFS-02", label: "Submit evidence", safe: true },
    "PT-ADM-03": { from: "WF-ADM-02", to: "WF-OFFER-01", label: "Approve Offer version", safe: true, noCommit: true },
    "PT-ADM-10": { from: "WF-ADM-03", to: "WF-ADM-03", label: "Fail closed on unavailable transaction", safe: true, noCommit: true },
    "PT-CMS-01": { from: "WF-CMS-01", to: "WF-CMS-01", label: "Edit and preview draft", safe: true, noCommit: true },
    "PT-OWN-01": { from: "WF-REQ-01", to: "WF-OWN-SAFE", label: "Protect foreign Request", safe: true, privacy: true }
  };

  const TRANSITIONS = TRANSITION_IDS.map(function (id) {
    return Object.assign({
      id: id,
      from: "WF-" + id.replace(/^PT-/, "").split("-")[0],
      to: "WF-OWN-SAFE",
      label: id.replace(/^PT-/, "").replace(/-/g, " ").toLowerCase(),
      safe: true
    }, TRANSITION_OVERRIDES[id] || {});
  });

  const FIXTURES = FIXTURE_IDS.reduce(function (acc, id) {
    acc[id] = { id: id, label: id.replace(/^FX-/, "").replace(/-/g, " "), synthetic: true };
    return acc;
  }, {});

  const SCENARIOS = SCENARIO_IDS.reduce(function (acc, id) {
    const meta = SCENARIO_META[id] || ["Review packet state", "WF-PUB-01", "FX-B2B-VALID", "Reviewer"];
    acc[id] = { id: id, title: meta[0], frame: meta[1], fixture: meta[2], role: meta[3] };
    return acc;
  }, {});

  const FORBIDDEN_SIDE_EFFECTS = [
    "quote_required_to_order", "request_to_payment", "offer_to_payment_without_revalidation",
    "uncertain_payment_duplicate", "foreign_record_disclosure", "provider_call",
    "whatsapp_automatic_send", "legacy_order_mutation", "false_transaction_success"
  ];

  const VISUAL_REQUIREMENT_IDS = [
    "UX-VIS-001", "UX-VIS-002", "UX-ASSET-001", "UX-MOTION-001", "UX-COPY-001"
  ];

  return Object.freeze({
    VERSION: "r6-candidate-static",
    BASELINE: "237e64adce816f71f8461eca3242aa72edb662f2",
    FRAME_IDS: Object.freeze(FRAME_IDS),
    TRANSITION_IDS: Object.freeze(TRANSITION_IDS),
    FIXTURE_IDS: Object.freeze(FIXTURE_IDS),
    SCENARIO_IDS: Object.freeze(SCENARIO_IDS),
    FRAME_META: Object.freeze(FRAME_META),
    TRANSITIONS: Object.freeze(TRANSITIONS),
    FIXTURES: Object.freeze(FIXTURES),
    SCENARIOS: Object.freeze(SCENARIOS),
    FORBIDDEN_SIDE_EFFECTS: Object.freeze(FORBIDDEN_SIDE_EFFECTS),
    VISUAL_REQUIREMENT_IDS: Object.freeze(VISUAL_REQUIREMENT_IDS)
  });
});
