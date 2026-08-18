# EXP-02 Bounded Motion Contracts

**Status:** Candidate — Context Only — static contract/specimen only; no runtime
source or dependency change

## 1. Motion grammar

| Token | Duration | Use | Reduced behavior |
| --- | ---: | --- | --- |
| `motion-instant` | 0ms | Semantic state change | Same |
| `motion-fast` | 120ms | Hover/press/icon/color/opacity | Direct color/opacity where useful |
| `motion-standard` | 180ms | Disclosure/form feedback/compact enter-exit | Direct state change |
| `motion-deliberate` | 280ms | Bounded panel/modal/page state | Direct state change |
| `motion-ambient` | 12–18s | Conflict-held FDM role only | Static; no new consumer |

## 2. Contracts

### Public arrival and evidence

Content exists before enhancement; one bounded arrival may use opacity/transform
within the Public LOCAL direction. It runs once, reserves layout space, and
does not delay captions/actions. Reduced motion removes spatial movement.

### Process connector

The five-stage ordered list may reveal one semantic connector cue. It is not
progress, printer telemetry, capacity, or an Order state. Static list is complete.

### Collection/media feedback

Filter/reset/load-more uses fast/standard feedback, preserves focus, and names
loading/error/end states. Media reveal never hides factual caption or action.

### Operational feedback

Account, Commerce, and Operations use short, functional feedback only. No
scroll-linked motion, bento decoration, bounce, magnetic CTA, autoplay,
typewriter delay, or decorative progress.

## 3. Interruption and lifecycle rules

- Any motion may be interrupted by keyboard focus, route change, reduced-motion
  preference, hidden/offscreen document, or error state.
- Ambient effects pause offscreen/document-hidden and never carry critical
  meaning.
- Loading keeps a contextual label; success maps to authoritative state.
- No animation claims persistence, price, stock, payment, production, or
  provider success.

## 4. Performance and specimen notes

The companion static HTML specimen uses CSS only, no package or runtime import.
It demonstrates normal/reduced state conceptually; it is not application
runtime evidence. A future source task must measure layout shift, bundle/runtime
impact, and browser behavior at 390/1440px.

## 5. Self-review

Passed against TOK-06, DS-03, DS-05, Public/Product registers, and donor
ledger. No scroll hijacking, universal reveal, hover-only meaning, bounce, or
new dependency was introduced.
