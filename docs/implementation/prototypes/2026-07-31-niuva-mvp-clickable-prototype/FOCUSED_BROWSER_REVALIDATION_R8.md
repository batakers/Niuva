# Focused Browser Revalidation — Round 8

Status: **TARGETED PASS — FULL INDEPENDENT EXPERT RERUN STILL REQUIRED**
Date: 3 August 2026
Scope: prototype-only remediation for `R7-P1-01` through `R7-P1-04` and
`R7-P2-01`

## Boundary

Round 8 validates the specific Round 7 source findings. It does not replace a
full formal expert critique, does not create human participant evidence, and
does not promote candidate routes.

The prototype was served locally on port `4178` and exercised in visible Chrome
at 390 x 844 px. All data and payment behavior remained simulated.

## RED/GREEN contract evidence

Command:

```powershell
node --test prototype-flow.contract.test.cjs
```

| Phase | Result |
| --- | --- |
| RED before remediation | 0 passed, 6 failed |
| GREEN after remediation | 6 passed, 0 failed |
| GREEN after snapshot-total refinement | 6 passed, 0 failed |
| `node --check app.js` | PASS |
| `node --check server.js` | PASS |

The test covers state-aware Admin actions, legacy `/order`, explicit mobile
labels, active-attempt cart locking, semantic checkout progress, and bounded
mobile Ready Product media.

## Browser evidence

### R7-P1-01 — operator case state

- Clean Participant `/admin` no longer advertises a nonexistent case.
- Its third action is “Periksa antrean after-sales” and links to
  `/admin/retail-cases`.
- Clean Participant output contains no Panel Moderator instruction.
- Moderator `case-status` still seeds `CASE-DEMO-01`.
- After switching to Participant Mode, `/admin` advertises the seeded case and
  “Buka kasus” reaches `/admin/retail-cases/CASE-DEMO-01` with usable resolution
  controls.

Focused result: **PASS**.

### R7-P1-02 — legacy customer `/order`

Direct `/order` now renders:

- `Legacy compatibility · read-only`;
- H1 `Pemesanan lama tidak tersedia`;
- explicit copy that the route cannot create an Order or payment; and
- a non-mutating `Jelajahi Retail` link.

It no longer falls through to the prototype 404 and is classified as legacy.

Focused result: **PASS**.

### R7-P1-03 — mobile action clarity and hierarchy

- Ready Product sticky action: `Tambah ke keranjang` with action `add-ready`.
- Cart sticky action: `Lanjut checkout` with action `go-checkout`.
- Active-attempt cart sticky action: `Kembali ke pembayaran`.
- Ready Product H1 moved from approximately 936 px in Round 7 to 726 px in the
  same 844 px viewport.
- Audited product and locked-cart screens had no horizontal overflow and no
  visible interactive target below 44 px.

Focused result: **PASS**.

### R7-P1-04 — active Order/payment-attempt recovery

After confirmation:

- checkout shows `Reservasi aktif 30 menit`;
- the back link says `Lihat keranjang terkunci`;
- cart announces the active Order reference;
- quantity is disabled and edit/remove/continue-shopping controls are absent;
- item and total use the immutable Order snapshot;
- shipping is Rp18.000 and Total Order is Rp63.000 in the exercised fixture;
- the sticky bar repeats the Rp63.000 snapshot and returns to checkout; and
- re-entry restores the same active reservation/payment screen rather than a
  new preview.

Focused result: **PASS**.

### R7-P2-01 — semantic stepper status

Confirmed checkout exposes the `Pembayaran` list item with
`aria-current="step"`. The obsolete “Kembali ke pratinjau untuk mengubah” copy
is absent.

Focused result: **PASS**.

## Limitations

- No new axe scan was run in Round 8; earlier axe evidence remains historical.
- No independent assessment agent produced evidence because the same account
  usage limit that degraded Round 7 remains in effect.
- This pass did not execute a human session.
- Provider, backend, API, persistence, authorization, and production behavior
  remain outside the prototype.

## Result and next gate

All five Round 7 findings are **closed for focused source/browser
revalidation**. The moderated-session gate remains **NOT READY TO RUN** because
the required full expert critique with restored independent assessment evidence
has not run.

Next gate:

1. run a full formal expert critique with Assessment A and Assessment B in
   independent contexts;
2. require zero open P0/P1 and reconcile any new finding;
3. only then change the moderated plan to `READY TO RUN`;
4. retain `INSUFFICIENT_EVIDENCE` for every candidate route until real customer
   and operator sessions are complete.
