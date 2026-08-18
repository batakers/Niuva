# PUB-03 Public B2B Inquiry Prototype

**Status:** Candidate — Context Only — reviewable state prototype; no API,
schema, storage, provider, route, or source implementation

**Baseline:** `origin/main` at `8555685c29a3fde9976ae6499336e2eb45a330ba`

**Routes:** `/kontak#form-konsultasi` and `/en/contact#form-konsultasi`

## 1. Contract

The visitor submits a structured inquiry without login. Client validation keeps
safe values. A persistence attempt creates an Inquiry with status `new`; only
after the existing Inquiry UUID is acknowledged may the visitor click an
optional WhatsApp continuation. Operations manually triages and follows up.

Required fields:

`company`, `pic_name`, `pic_email`, required `pic_phone`, `need`, `timeline`,
`brief`, and the exact consent:

> Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan
> menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan
> untuk marketing tanpa persetujuan terpisah.

No public raw-file upload exists in this prototype. A later private-storage
process requires separate approval.

## 2. Reviewable flow

```text
ready → client validation → submitting
  ├─ validation error: preserve values, focus summary/field
  ├─ dependency/system error: preserve safe context, bounded retry
  ├─ offline/uncertain: state whether persistence is known; reconcile before retry
  └─ persisted `new`: show existing UUID + response target
                                └─ optional user-clicked WhatsApp
```

The success copy names a persisted Inquiry and its UUID. A first human
response target is Monday–Friday 09.00–17.00 WIB within one working day,
excluding public holidays; it is not a quote, price, ETA, delivery, or
resolution guarantee.

## 3. Interaction and accessibility notes

- Form labels are visible; errors are associated with fields and a summary.
- `pic_phone` and consent are explicitly required; values are retained after
  client or dependency failure when safe.
- Submit prevents duplicate action while the persistence attempt is pending.
- Critical failure/success is visible in-page and available to assistive
  technology; a toast may reinforce but never replace it.
- WhatsApp is a secondary visitor-clicked link, never an Inquiry create/update,
  retry, or proof mechanism.
- ID/EN labels and long error copy reflow at 390px and 200% zoom; reduced
  motion keeps every state static and complete.

## 4. Self-review

Passed against DEC-UX-003, the Public B2B contract, DS-02/DS-03, and DS-05:

- UUID appears only after persistence authority;
- validation, dependency, offline/uncertain, recovery, and exact success are
  distinct;
- public upload, quote, price, ETA, delivery, and automatic WhatsApp are
  absent; and
- no source, API, provider, or lifecycle enum was changed.

The companion state matrix and static plate are candidate evidence only.
