# Homepage R4 Asset Manifest

Status: prototype-only provenance record. Inclusion here does not grant a new
production, marketing, redistribution, or CMS publication right.

## Official mark

| Prototype path | Repository source | Use |
| --- | --- | --- |
| `assets/niuva-mark.svg` | `frontend/public/niuva-mark.svg` | Header and footer identity |

## Existing project assets

These files were copied from the current repository baseline for isolated
prototype rendering. Their captions describe only what is visible or what the
Company Profile identifies.

| Prototype path | Repository source | R4 use |
| --- | --- | --- |
| `assets/projects/pindad-ev-motor.webp` | `frontend/src/assets/projects/pindad-ev-motor.webp` | Pindad EV Motor project evidence |
| `assets/projects/xeon-redesign.webp` | `frontend/src/assets/projects/xeon-redesign.webp` | Xeon Redesign project evidence |
| `assets/projects/agate-motorcycle-simulator.webp` | `frontend/src/assets/projects/agate-motorcycle-simulator.webp` | Motorcycle Simulator project evidence |

The local worktree also contains `assets/projects/agate-bicycle-arcade.webp`
as an R2/R3 carryover. R4 does not render it, so it is excluded from the
candidate publication scope.

## Company Profile extraction disposition

Source document:
`docs/references/company/Company profile PT Niuva_compressed.pdf`.

The owner previously authorized extracting embedded images for the bounded R2
exploration. R4 deliberately replaces the three macro-chapter photographs with
conceptual inline SVG illustrations and reserves real media for Projects.
Therefore, none of the eight local Company Profile extractions below is needed
by R4 or eligible for its candidate publication scope.

| Local carryover path | PDF page | Xref | Dimensions | R4 disposition |
| --- | ---: | ---: | ---: | --- |
| `assets/company-profile/xeon-process-a.jpeg` | 9 | 176 | 553×383 | Exclude from R4 publication |
| `assets/company-profile/xeon-process-b.jpeg` | 9 | 179 | 554×413 | Exclude from R4 publication |
| `assets/company-profile/pindad-ev-a.jpeg` | 10 | 184 | 555×414 | Exclude from R4 publication |
| `assets/company-profile/pindad-ev-b.jpeg` | 10 | 187 | 634×385 | Exclude from R4 publication |
| `assets/company-profile/bicycle-arcade-a.jpeg` | 11 | 195 | 385×546 | Exclude from R4 publication |
| `assets/company-profile/bicycle-arcade-b.jpeg` | 11 | 198 | 394×572 | Exclude from R4 publication |
| `assets/company-profile/motorcycle-simulator-a.jpeg` | 12 | 207 | 387×553 | Exclude from R4 publication |
| `assets/company-profile/motorcycle-simulator-b.jpeg` | 12 | 215 | 401×572 | Exclude from R4 publication |

R4 deliberately reserves real photographic media for the Projects evidence
section. The three macro chapters use crisp inline SVG geometry authored for
this prototype and labelled as conceptual illustrations. They do not claim to
be research artefacts, CAD evidence, testing records, or photographs.

No generated image, fabricated research artefact, partner logo, stock photo,
external URL, or runtime image request is used by Homepage R4.

## Candidate fonts

| Prototype path | Provenance | License | Scope |
| --- | --- | --- | --- |
| `fonts/MonaSansVF.woff2` | `github/mona-sans`, `main` | OFL 1.1 in `fonts/OFL-Mona-Sans.txt` | Candidate sans with owner-approved airier display treatment for isolated R4 |
| `fonts/BonaNova-Italic.woff2` | `kosmynkab/Bona-Nova`, `main` | OFL 1.1 in `fonts/OFL-Bona-Nova.txt` | Restrained italic accent for isolated R4 |

These candidate fonts do not amend `DESIGN.md`, production tokens, or source
dependencies.
