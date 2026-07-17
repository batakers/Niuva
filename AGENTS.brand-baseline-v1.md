# AGENTS.md — Niuva Inovasi Utama Website

This file gives coding agents the fixed product, business, brand, UX, and implementation rules for the Niuva Inovasi Utama website.

## 1. Project Mission

Build and maintain the official public website for **PT Niuva Inovasi Utama**.

The website is not just a visual company profile. It is a **B2B company profile + portfolio + lead-generation website** that must:

- Build credibility for Niuva as a strategic partner in **Research & Development, design engineering, prototyping, EV/product development, simulators, and custom technical products**.
- Help visitors quickly understand Niuva’s capabilities.
- Show real project evidence through mini case studies.
- Guide visitors toward business inquiries through WhatsApp, email, form consultation, and project discussion CTAs.
- Support sales, proposals, pitching, networking, and business development conversations.

Primary conversion goal: **Diskusikan Project**.

Status: Active Implementation Guardrail
Stakeholder approval evidence: Not separately recorded
Authority: Subordinate to approved v2.1 requirements

---

## 2. Source of Truth Hierarchy

When requirements conflict, follow this order:

1. **BRD** — business goals, business requirements, KPI, risks, scope boundaries.
2. **PRS** — product goals, target users, page structure, page scope, user flow, CTA logic.
3. **PRODUCT.md** — product purpose, brand personality, anti-references, design principles, accessibility, implementation context.
4. **Company Profile PDF** — visual identity, brand motifs, base content, services, projects, contact details.
5. Current implementation — reuse what is useful, but refactor anything that conflicts with the documents above.

Do not invent a new business direction, page structure, service hierarchy, or visual identity.

---

## 3. Target Users

### Primary Users

Companies, institutions, and industry teams looking for partners in:

- R&D
- Design engineering
- Prototyping
- EV/product development
- Simulators
- Custom technical products
- Engineering support
- Product validation

Examples:

- Manufacturing companies
- Automotive companies
- BUMN
- Government institutions
- Defense institutions
- Technology companies
- Corporate innovation teams
- Industrial training organizations

They need fast evidence that Niuva is credible, experienced, technically capable, and easy to contact.

### Secondary Users

- Startups
- Universities
- Research institutions
- Innovation communities
- Makers
- Training organizations
- Incubators

They usually need idea validation, early prototypes, workshops, consulting, research collaboration, or team capability development.

### Tertiary Users

- Brands
- Communities
- Event organizers
- Marketing teams
- Organizations needing apparel, merchandise, brand identity products, or event-related creative production

Tertiary users are valid, but they must not overpower the R&D/prototyping positioning.

---

## 4. Product Scope

### Public Website Scope

The public website must include exactly these core pages for MVP:

- Home
- About
- Capabilities
- Projects
- Contact

Main navigation:

```txt
Home | About | Capabilities | Projects | Contact | Diskusikan Project
```

This exact five-page navigation remains the protected v1 public baseline until an approved Retail/B2B information-architecture decision replaces it. Deferred Retail/B2B navigation visuals must not be treated as approval to silently change this v1 navigation.

If the current implementation uses `Services`, rename or reposition it as **Capabilities**.

If the current implementation uses `Portfolio`, rename or reposition it as **Projects**.

### In Scope

- Public company profile website
- Lead generation
- Main navigation
- CTA “Diskusikan Project”
- Home page
- About page
- Capabilities page
- Projects page
- Contact page
- Contact form
- WhatsApp link
- Email link
- Google Maps embed
- Responsive design for desktop, tablet, and mobile
- Basic SEO
- Project cards
- Mini case studies

### Out of Scope for Public MVP

Do not add these to the public MVP unless explicitly requested later:

- E-commerce merchandise flow
- Payment gateway
- Automatic booking
- Full blog
- Public API
- Full multilingual website
- Project detail pages unless already implemented cleanly
- Client portal as a primary public flow
- Complex admin dashboard as a public-facing feature

---

## 5. Important Implementation Boundary

The current product may include authenticated client/admin surfaces for a 3D printing order platform.

Keep this separation clear:

### Public Marketing Website

Prioritize:

- Brand credibility
- Business clarity
- Lead generation
- Portfolio proof
- CTA flow
- Polished visual identity

### Client/Admin/Operational Surfaces

Prioritize:

- Task completion
- Order creation
- Order tracking
- Estimation
- Payment-proof handling
- Fulfillment
- Materials
- Portfolio management
- Users
- Contacts
- Internships
- Settings
- Data clarity
- Status clarity

Do **not** let public website visuals create unnecessary friction inside operational dashboards. Operational pages should be clearer, denser, and more task-focused than the public marketing pages.

---

## 6. Positioning

Niuva must be positioned as:

> A strategic innovation partner for R&D, design engineering, prototyping, and integrated creative solutions.

Preferred positioning lines:

- “Dari Ide Menjadi Produk Nyata”
- “Mitra R&D, Design Engineering, dan Prototyping untuk Pengembangan Produk Inovatif”

The website must make it clear that Niuva is **not just a production vendor**.

Niuva’s process should feel like:

```txt
Riset → Desain → Engineering → Prototyping → Testing → Implementasi
```

---

## 7. Service Hierarchy

The website must show four services:

1. Research & Development
2. Design & Prototyping
3. Consultant & Workshop
4. Apparel & Merchandise

But do **not** give all services equal weight.

### Primary Capabilities

These are the face of the business and must receive stronger visual hierarchy:

- Research & Development
- Design & Prototyping

### Supporting Capabilities

These are supporting services in Niuva’s wider innovation ecosystem:

- Consultant & Workshop
- Apparel & Merchandise

Avoid making merchandise look like the main business. Merchandise should support brand, event, community, and corporate needs, but it must not weaken Niuva’s R&D/prototyping positioning.

---

## 8. Required Page Requirements

## Home

Home is the main lead-generation entry point.

Must include:

1. Hero Section
   - Clear headline about R&D, design engineering, prototyping, and turning ideas into real products.
   - Subheadline explaining Niuva helps organizations clarify needs, develop concepts, build prototypes, and prepare solutions for implementation.
   - Primary CTA: `Diskusikan Project`
   - Secondary CTA: `Lihat Projects` or `Lihat Capabilities`

2. About Preview
   - Short explanation of Niuva as a strategic innovation and product development partner.

3. Core Capabilities
   - Four services, with R&D and Design & Prototyping visually dominant.

4. Featured Projects
   - Three to four projects as proof of capability.

5. How We Work
   - Need discovery, research, design, prototyping, validation, implementation.

6. Why Niuva
   - Research-based approach
   - Engineering mindset
   - Prototyping capability
   - Practical execution
   - Bandung Techno Park ecosystem

7. Final CTA
   - Strong invitation to discuss a project.

## About

About builds credibility.

Must include:

- Short company profile
- Background of Niuva
- Vision and mission
- Work approach
- Company values
- Bandung Techno Park ecosystem

Tone should be credible, concise, and business-oriented.

## Capabilities

Capabilities explains the services.

For each capability, include:

- Service name
- Short description
- Target users
- Example client needs
- Specific CTA

Required capability CTAs:

| Capability | CTA |
|---|---|
| Research & Development | Diskusikan Kebutuhan R&D |
| Design & Prototyping | Buat Prototype Produk |
| Consultant & Workshop | Rancang Workshop |
| Apparel & Merchandise | Buat Merchandise Brand |

R&D and Design & Prototyping must look more important than the supporting capabilities.

## Projects

Projects are proof of credibility. They must not be simple image cards.

Required projects:

- Redesain Motor Xeon
- Pengembangan Motor EV PT Pindad
- Bicycle Arcade Agate
- Motorcycle Simulator Agate

Each project must be presented as a mini case study with:

- Project name
- Category
- Short summary
- Challenge
- Solution
- Output
- CTA

Do not invent fake metrics, fake clients, fake awards, or exaggerated outcomes.

## Contact

Contact is a conversion page.

Must include:

- Contact headline
- Short invitation to discuss project needs
- WhatsApp button
- Email link
- Office location
- Google Maps embed
- Consultation form

Required contact details:

- WhatsApp: `0851-1767-8901`
- Email: `niuvamakerspace@gmail.com`
- Location: `Bandung Techno Park – Gedung D Lt.1, Ruang Makerspace`

Required consultation form fields:

- Nama
- Perusahaan / Instansi
- Email
- Nomor WhatsApp
- Jenis kebutuhan
- Estimasi timeline
- Pesan tambahan

---

## 9. Brand Personality and Voice

Niuva should feel:

- Professional
- Innovative
- Clean
- Technical
- Trustworthy
- Collaborative
- Precise

Copywriting rules:

- Use Indonesian as the primary language.
- English technical terms are allowed when useful: Research & Development, Design & Prototyping, Workshop, Engineering, Prototype, Capabilities, Project.
- Be confident and clear, but not overly promotional.
- Make technical capability understandable for business and institutional decision makers.
- Communicate strategic partnership, not commodity production.
- Avoid generic AI marketing phrases.
- Avoid “best and cheapest” vendor language.
- Avoid exaggerated claims.
- Avoid fake metrics.

---

## 10. Visual Identity

Follow the official Niuva company profile visual language.

Use:

- Soft/desaturated blue and white palette
- Rounded typography
- Clean corporate-tech layout
- Generous but controlled whitespace
- Rounded cards
- Rounded image frames
- U-shaped rounded line motifs
- Solid circle accents
- Dot accents
- Calm, precise, research-driven visual tone

Approximate color tokens:

```txt
Niuva Blue: #6390BB
Sky Blue: #8AAECF
Blue Dark: #4A72A0
Midnight: #1C2B3A
Steel: #3D5266
Smoke: #6B7A8D
Silver: #E2E8EE
Frost: #EBF1F7
Cloud: #F8F9FB
Pure White: #FFFFFF
```

Do not introduce unrelated palettes.

---

## 11. Anti-References

Do not make the website look like:

- Generic AI-generated landing page
- Generic SaaS template
- Purple/indigo startup website
- Cheap vendor marketplace
- E-commerce-first merchandise store
- Blog-first content site
- Static PDF simply converted into a web page
- Overly decorative portfolio with weak business context

Avoid:

- Random gradients
- Neon colors
- Glassmorphism
- Fake dashboard illustrations on public pages
- Emoji feature cards
- Stock SaaS illustrations
- Overly tiny text
- Excessive top padding that pushes content too far down
- Project cards without challenge/solution/output
- Equal service weighting that hides R&D and prototyping
- CTAs that are hard to find

---

## 12. UX and Layout Principles

- Make the path to contact obvious.
- Repeat the CTA “Diskusikan Project” in strategic sections.
- Keep the first screen clear and not overly empty.
- Avoid using `min-h-screen` or `h-screen` if it creates excessive vertical gaps.
- Do not push page content too far below the navbar.
- Use controlled whitespace, not empty whitespace.
- Keep typography readable on desktop, tablet, and mobile.
- Use consistent spacing across all pages.
- Use consistent page heroes, cards, buttons, CTAs, navbar, and footer.
- Decorative motifs must be absolutely positioned and must not create extra layout height.

Suggested spacing direction:

```txt
Navbar to first content on desktop: 96px–140px
Page hero vertical padding desktop: 96px top / 96px bottom
Normal section padding desktop: 96px–120px
Mobile page hero padding: 72px top / 64px bottom
Mobile section padding: 64px–80px
```

Avoid full 100vh hero heights unless there is a strong reason.

---

## 13. Shared Components to Prefer

Use or create shared reusable components instead of page-specific one-off styling:

- PageContainer
- SectionContainer
- PageHero
- SectionHeader
- CapabilityCard
- ProjectCaseStudyCard
- CTASection
- DecorativeMotif
- Navbar
- Footer
- ContactForm

All public pages should feel like one cohesive website, not separate templates.

---

## 14. Accessibility and Responsiveness

- Text must be easy to read.
- Contrast must be sufficient.
- Buttons and CTAs must be visually clear.
- The website must work comfortably on desktop, tablet, and mobile.
- Forms must be understandable without relying only on color, animation, or icons.
- Motion must respect reduced-motion preferences.
- Use semantic HTML where practical.
- Images should have meaningful alt text.
- Navigation must be usable on mobile.

---

## 15. SEO Basics

Each public page should have clear metadata where the stack supports it:

- Title
- Description
- Open Graph title/description
- Structured headings
- Descriptive link text

Use page content that reflects the business focus:

- R&D
- Design engineering
- Prototyping
- Product development
- EV development
- Simulator
- Workshop
- Product innovation

Do not keyword-stuff.

---

## 16. Development Workflow for Agents

Before editing code:

1. Inspect the project structure.
2. Identify the framework and styling system.
3. Identify public routes and operational/auth routes.
4. Identify shared layout components.
5. Identify duplicated or conflicting styles.
6. Compare implementation against this AGENTS.md.
7. Make a short plan before modifying files.

While editing:

- Reuse the current stack and conventions.
- Prefer shared components and tokens.
- Keep changes focused.
- Do not redesign randomly.
- Do not introduce unnecessary dependencies.
- Do not remove operational features unless explicitly instructed.
- Do not let dashboard/auth surfaces inherit heavy public marketing decoration.

After editing:

- Run the available checks if commands exist.
- If commands are unknown, inspect `package.json` or project scripts first.
- Check responsive behavior.
- Check navigation links.
- Check CTA links.
- Check contact form behavior.
- Check WhatsApp and email links.
- Check that all public pages remain visually consistent.

---

## 17. Acceptance Checklist

A change is only acceptable if:

- Public website clearly communicates Niuva as a partner for R&D, design engineering, and prototyping.
- Navigation is Home, About, Capabilities, Projects, Contact, Diskusikan Project.
- R&D and Design & Prototyping are visually dominant.
- Consultant & Workshop and Apparel & Merchandise remain supporting capabilities.
- Projects are shown as mini case studies, not just image cards.
- Contact paths are obvious: WhatsApp, email, form, location, Google Maps.
- CTA “Diskusikan Project” is consistent.
- Website supports sales, pitching, proposals, and business development.
- Visual identity follows the Niuva company profile.
- Website does not feel generic, AI-generated, or vendor-marketplace-like.
- Public pages and operational dashboard surfaces are clearly separated.
- Layout is responsive and readable.
- No placeholder text, TODO comments, fake claims, fake metrics, or unfinished sections remain.
