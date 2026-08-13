# Niuva Digital Font Provenance

Status: **NDS 2.0 foundation asset record**

These local files implement the digital typography target approved by
`DEC-UX-004` and `DESIGN.md`. They do not change the permanent print identity
or authorize a route redesign.

| File | Source | License | SHA-256 | Supported style / axes | NDS role |
| --- | --- | --- | --- | --- | --- |
| `MonaSansVF.woff2` | [`github/mona-sans`](https://github.com/github/mona-sans), `main`; first introduced through the merged Homepage R4 prototype provenance | SIL Open Font License 1.1 in `OFL-Mona-Sans.txt` | `FD40288D051171B51E3D01F36790604470DBB4D4FC5B36EE5A8119F4F4C6B3E1` | Variable `wdth` 75–125, `wght` 200–900, `opsz` 0–100, `ital` 0–1 | Display, body, and UI target |
| `BonaNova-Italic.woff2` | [`kosmynkab/Bona-Nova`](https://github.com/kosmynkab/Bona-Nova), `main`; first introduced through the merged Homepage R4 prototype provenance | SIL Open Font License 1.1 in `OFL-Bona-Nova.txt` | `8559973F32B6B84F226AF7589016056F7841BC48D12A3024A3F3C5AFBDA27164` | Static italic | At most one short Public-only expressive interruption |

Font ownership belongs to the NDS foundation maintainer. Surface owners may
consume the roles but may not replace the files, expand Bona Nova into task
surfaces, or remove compatibility fonts without the migration and
zero-consumer gates in `DESIGN.md`.

Both faces use `font-display: swap`. Mona Sans is preloaded only when a
separately approved first-viewport surface actually adopts it. Bona Nova is
not a global first-viewport requirement and must not be preloaded globally.

The content hashes above are the binary identity. Upstream `main` is recorded
as source provenance rather than represented as a pinned upstream revision.
