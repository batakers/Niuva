# PRD — NIUVA Company Profile & 3D Printing Order Platform

## Original Problem Statement
Bilingual (ID default + EN) company profile website for PT Niuva Inovasi Utama (indie R&D studio, Bandung) integrated with a 3D printing service ordering system. Public profile + client order system + admin dashboard. Tech: React + FastAPI + MongoDB, JWT auth, Emergent object storage, Resend email.

## User Personas
- **Admin NIUVA**: manage content, orders, materials, internship applicants, clients, payment verification.
- **Klien**: register/login, create 3D printing orders (upload STL/OBJ, pick material), track status, upload payment proof.
- **Pengunjung/Pelamar Magang**: view profile, submit internship & contact forms (no account).

## Architecture
- Backend FastAPI single app (`server.py`), helpers `storage.py` (Emergent S3), `emailer.py` (Resend + in-app notification fallback).
- MongoDB **standalone** (config read-only) → atomicity via **single-document embedded** estimate/payment inside order doc (no multi-doc transactions).
- JWT Bearer auth (localStorage `niuva_token`), role-based (admin/client). Admin seeded on startup.
- Frontend React + custom lightweight i18n context (react-i18next install blocked by env integrity check), dark industrial theme.
- Files: UUID-named paths `niuva/orders/{user_id}/{uuid}.stl`; original filename stored as metadata. 50MB limit, ext validation, in-memory rate limiting. Auto-delete loop for awaiting_payment orders >14 days.

## Core Requirements (static)
Company profile (Home, About, Services, Portfolio + lightbox, Ecosystem, Internship, Contact), bilingual ID/EN toggle, 3D printing order wizard, status tracking with SLA messaging, manual transfer payment + proof upload, admin CMS (orders, materials CRUD, portfolio CRUD, internships, contacts, users, bank settings).

## Implemented (2026-06-28) — MVP COMPLETE
- ✅ JWT auth (register/login/me), admin seed, role-based routes.
- ✅ Full order lifecycle: create (file upload + material) → admin estimate → awaiting_payment → client proof upload → admin verify → in_process → completed. Status stepper + history + SLA banner.
- ✅ Materials CRUD, Portfolio CRUD (bilingual), Settings (bank details), Users list, Stats overview.
- ✅ Public internship form (→ HRD email mock + DB), contact form (→ email mock + DB).
- ✅ Emergent object storage for design files & payment proofs; secured download endpoint.
- ✅ Bilingual ID/EN across all pages. Dark industrial UI per design guidelines.
- ✅ Tested: 31/31 backend pass, frontend E2E flows verified.

## MOCKED
- **Resend email**: no API key provided → emails are logged + stored in `notifications` collection. Add `RESEND_API_KEY` in backend/.env to activate.

## Backlog / Next
- P1: Activate Resend (user to provide `re_...` key) + day-3 payment reminder cron.
- P1: 3D STL preview (three.js) before submit; auto-pricing via numpy-stl/trimesh.
- P2: Payment gateway (Midtrans), granular tracking, analytics dashboard, WhatsApp/Twilio chat.
- P2: Content CMS for static homepage/about text (currently i18n-driven).

## Credentials
Admin: admin@niuva.com / NiuvaAdmin2026 (see /app/memory/test_credentials.md)
