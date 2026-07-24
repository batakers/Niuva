"""Seed content_blocks from the hardcoded profileContent data (About, Capabilities,
CTA, Contact), then publish each one so GET /content immediately returns the
existing live copy. Idempotent: skips content types/slugs that already exist.

Usage:
    python migrations/004_content_blocks_seed.py            # dry-run (default)
    python migrations/004_content_blocks_seed.py --apply     # write
"""
import argparse
import asyncio
import json
import os

from content_service import ContentService

SYSTEM_ACTOR = {"id": "system-seed", "email": "system@niuva.internal"}
SEED_REASON = "Initial seed from hardcoded profileContent"

ABOUT_FIELDS = {
    "intro": "Niuva Inovasi Utama hadir sebagai mitra strategis dalam bidang inovasi dan pengembangan produk, berfokus pada solusi kreatif terintegrasi berbasis ekosistem Bandung Techno Park.",
    "dossierItems": [
        {
            "label": "Positioning",
            "title": "Mitra strategis inovasi dan pengembangan produk",
            "body": "Niuva membantu organisasi merumuskan kebutuhan, menilai peluang, lalu mengubah ide menjadi desain, prototipe, atau program yang dapat diuji.",
        },
        {
            "label": "Basis kerja",
            "title": "Riset mendalam dan konsultasi ahli",
            "body": "Keputusan proyek dibangun dari konteks pengguna, arah teknologi, batasan bisnis, dan masukan ahli agar proses pengembangan lebih terarah.",
        },
        {
            "label": "Output",
            "title": "Solusi kreatif yang bisa direalisasikan",
            "body": "Riset, design engineering, teknologi, workshop, apparel, dan merchandise dirangkai sebagai layanan terintegrasi sesuai kebutuhan proyek.",
        },
    ],
    "approachSteps": [
        {"label": "Discover", "title": "Memahami konteks", "body": "Menggali tujuan, pengguna, batasan teknis, peluang pasar, dan kebutuhan pemangku kepentingan."},
        {"label": "Define", "title": "Merumuskan arah", "body": "Menyusun prioritas pengembangan, ruang lingkup, dan bentuk output yang paling relevan."},
        {"label": "Develop", "title": "Membangun solusi", "body": "Mengembangkan desain, teknologi, prototipe, materi workshop, atau produk kreatif sesuai brief."},
        {"label": "Validate", "title": "Menguji keputusan", "body": "Mengevaluasi hasil bersama mitra sebelum masuk ke iterasi, produksi, atau implementasi lanjutan."},
    ],
    "values": [
        "Berbasis riset dan konteks nyata.",
        "Presisi dalam merumuskan masalah dan output.",
        "Kolaboratif dengan mitra, ahli, dan pemangku kepentingan.",
        "Praktis dalam menghubungkan ide dengan realisasi.",
        "Adaptif terhadap kebutuhan teknologi, produk, dan bisnis.",
    ],
}

CAPABILITY_SEEDS = [
    {
        "slug": "research-development",
        "fields": {
            "title": "Research & Development", "priority": "primary",
            "body": "Riset untuk memetakan kebutuhan, peluang pasar, arah teknologi, dan kelayakan konsep sebelum masuk ke tahap pengembangan.",
            "output": "Peta kebutuhan, validasi konsep, rekomendasi pengembangan.",
            "targetUsers": "Perusahaan, instansi, tim inovasi, kampus, dan lembaga riset.",
            "cta": "Diskusikan Kebutuhan R&D",
        },
    },
    {
        "slug": "design-prototyping",
        "fields": {
            "title": "Design & Prototyping", "priority": "primary",
            "body": "Perancangan produk, visual, model 3D, dan prototipe agar ide dapat diuji dari sisi bentuk, fungsi, dan arah implementasi.",
            "output": "Konsep desain, model 3D, mockup, dan prototipe sesuai kebutuhan proyek.",
            "targetUsers": "Industri, startup hardware, tim produk, komunitas maker, dan institusi pelatihan.",
            "cta": "Buat Prototype Produk",
        },
    },
    {
        "slug": "consultant-workshop",
        "fields": {
            "title": "Consultant & Workshop", "priority": "supporting",
            "body": "Konsultasi ahli dan workshop praktis untuk membantu tim merumuskan strategi, mengambil keputusan, dan membangun kemampuan internal.",
            "output": "Sesi konsultasi, modul workshop, rangkuman arahan, dan rencana tindak lanjut.",
            "targetUsers": "Kampus, komunitas inovasi, training organization, startup, dan corporate innovation team.",
            "cta": "Rancang Workshop",
        },
    },
    {
        "slug": "apparel-merchandise",
        "fields": {
            "title": "Apparel & Merchandise", "priority": "supporting",
            "body": "Pengembangan apparel dan merchandise untuk kebutuhan brand, komunitas, event, dan program yang membutuhkan identitas visual konsisten.",
            "output": "Arah visual, desain apparel, desain merchandise, dan panduan produksi awal.",
            "targetUsers": "Brand, komunitas, event organizer, kampus, dan tim marketing perusahaan.",
            "cta": "Buat Merchandise Brand",
        },
    },
]

CTA_FIELDS = {
    "label": "Kolaborasi",
    "title": "Diskusikan kebutuhan riset, desain, atau prototyping bersama Niuva.",
    "body": "Sampaikan konteks proyek, target hasil, batasan teknis, dan bentuk output yang dibutuhkan. Tim Niuva akan membantu menentukan titik mulai yang paling relevan.",
    "primaryActionLabel": "Diskusikan Project",
    "primaryActionTarget": "/contact",
}

CONTACT_FIELDS = {
    "location": "Bandung Techno Park - Gedung D Lt.1, Ruang Makerspace, Jl. Telekomunikasi No.1, Sukapura",
    "email": "niuvamakerspace@gmail.com",
    "whatsapp": "0851-1767-8901",
    "whatsappHref": "https://wa.me/6285117678901",
}


async def _seed_one(service: ContentService, *, content_type: str, slug: str, fields: dict, dry_run: bool) -> dict:
    existing = await service.db.content_blocks.find_one({"content_type": content_type, "slug": slug}, {"_id": 0})
    if existing:
        return {"content_type": content_type, "slug": slug, "action": "skipped_existing"}
    if dry_run:
        return {"content_type": content_type, "slug": slug, "action": "would_create_and_publish"}
    block = await service.create_block(content_type=content_type, slug=slug, fields=fields, actor=SYSTEM_ACTOR)
    await service.publish_block(block["id"], actor=SYSTEM_ACTOR, reason=SEED_REASON)
    return {"content_type": content_type, "slug": slug, "action": "created_and_published", "id": block["id"]}


async def seed(db, client, capabilities, *, dry_run: bool) -> dict:
    service = ContentService(db, client, capabilities)
    results = []
    results.append(await _seed_one(service, content_type="about", slug="company-profile", fields=ABOUT_FIELDS, dry_run=dry_run))
    for item in CAPABILITY_SEEDS:
        results.append(await _seed_one(service, content_type="capability", slug=item["slug"], fields=item["fields"], dry_run=dry_run))
    results.append(await _seed_one(service, content_type="cta", slug="default", fields=CTA_FIELDS, dry_run=dry_run))
    results.append(await _seed_one(service, content_type="contact", slug="primary", fields=CONTACT_FIELDS, dry_run=dry_run))
    return {"dry_run": dry_run, "results": results}


async def _run_cli(apply: bool) -> int:
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    from database_capabilities import probe_database_capabilities

    load_dotenv()
    database_name = os.environ["DB_NAME"]
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    try:
        capabilities = await probe_database_capabilities(client, database_name)
        report = await seed(client[database_name], client, capabilities, dry_run=not apply)
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0
    finally:
        client.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed CMS content_blocks from hardcoded profileContent.")
    parser.add_argument("--apply", action="store_true", help="Apply writes. Without this flag the migration is dry-run only.")
    args = parser.parse_args()
    return asyncio.run(_run_cli(args.apply))


if __name__ == "__main__":
    raise SystemExit(main())
