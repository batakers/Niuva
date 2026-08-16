import React, { useEffect, useId, useRef } from "react";

const contourPaths = [
  "M-90 226 C145 120 325 345 555 237 S945 91 1188 220 S1468 331 1692 184",
  "M-90 242 C145 136 325 361 555 253 S945 107 1188 236 S1468 347 1692 200",
  "M-90 258 C145 152 325 377 555 269 S945 123 1188 252 S1468 363 1692 216",
  "M-90 274 C145 168 325 393 555 285 S945 139 1188 268 S1468 379 1692 232",
  "M-90 290 C145 184 325 409 555 301 S945 155 1188 284 S1468 395 1692 248",
  "M-90 306 C145 200 325 425 555 317 S945 171 1188 300 S1468 411 1692 264",
  "M-90 322 C145 216 325 441 555 333 S945 187 1188 316 S1468 427 1692 280",
  "M-90 338 C145 232 325 457 555 349 S945 203 1188 332 S1468 443 1692 296",
  "M-90 354 C145 248 325 473 555 365 S945 219 1188 348 S1468 459 1692 312",
  "M-90 370 C145 264 325 489 555 381 S945 235 1188 364 S1468 475 1692 328",
  "M-90 386 C145 280 325 505 555 397 S945 251 1188 380 S1468 491 1692 344",
];

export function HomeFdmContour({ variant = "light", className = "" }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof window === "undefined") return undefined;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)");
    let visible = true;
    let frame = 0;

    const syncMotion = () => {
      const active = visible && !document.hidden && !reducedMotion?.matches;
      node.dataset.motionActive = active ? "true" : "false";
    };
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            ([entry]) => {
              visible = Boolean(entry?.isIntersecting);
              syncMotion();
            },
            { rootMargin: "120px 0px", threshold: 0.01 },
          )
        : null;

    const resetPointer = () => {
      window.cancelAnimationFrame?.(frame);
      node.style.setProperty("--fdm-pointer-x", "0px");
      node.style.setProperty("--fdm-pointer-y", "0px");
    };
    const handlePointerMove = (event) => {
      if (!finePointer?.matches || reducedMotion?.matches) return;
      window.cancelAnimationFrame?.(frame);
      frame = window.requestAnimationFrame?.(() => {
        const bounds = node.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 10;
        const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 6;
        node.style.setProperty("--fdm-pointer-x", `${x.toFixed(2)}px`);
        node.style.setProperty("--fdm-pointer-y", `${y.toFixed(2)}px`);
      });
    };

    observer?.observe(node);
    document.addEventListener("visibilitychange", syncMotion);
    reducedMotion?.addEventListener?.("change", syncMotion);
    node.addEventListener("pointermove", handlePointerMove, { passive: true });
    node.addEventListener("pointerleave", resetPointer);
    syncMotion();

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      reducedMotion?.removeEventListener?.("change", syncMotion);
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerleave", resetPointer);
      window.cancelAnimationFrame?.(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`home-r4-contour home-r4-contour-${variant} ${className}`.trim()}
      aria-hidden="true"
      data-motion-active="false"
      data-testid={`home-fdm-contour-${variant}`}
    >
      <svg viewBox="0 0 1600 430" preserveAspectRatio="none">
        <g className="home-r4-contour-lines">
          {contourPaths.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>
      </svg>
    </div>
  );
}

const illustrationCopy = {
  understand: {
    title: "Kebutuhan dan batas keputusan menuju satu pertanyaan uji",
    description:
      "Empat jalur kebutuhan dan batas keputusan berkumpul menjadi satu fokus pengujian.",
  },
  shape: {
    title: "Lapisan keputusan membentuk objek yang dapat diuji",
    description:
      "Serangkaian lapisan bergerak dari garis awal menuju bentuk fisik dengan titik sambungan.",
  },
  prove: {
    title: "Objek melewati pengujian dan kembali membawa bukti",
    description:
      "Sebuah objek uji melewati tiga checkpoint lalu mengembalikan bukti untuk keputusan berikutnya.",
  },
};

export function HomeChapterIllustration({ type }) {
  const titleId = useId();
  const descriptionId = useId();
  const copy = illustrationCopy[type];

  if (!copy) return null;

  return (
    <svg
      className={`home-r4-chapter-visual home-r4-chapter-visual-${type}`}
      viewBox="0 0 640 480"
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
    >
      <title id={titleId}>{copy.title}</title>
      <desc id={descriptionId}>{copy.description}</desc>
      <rect className="home-r4-illustration-ground" x="1" y="1" width="638" height="478" rx="18" />

      {type === "understand" && (
        <>
          <g className="home-r4-illustration-inputs">
            {[106, 198, 290, 382].map((y) => (
              <React.Fragment key={y}>
                <circle cx="92" cy={y} r="17" />
                <path d={`M122 ${y} H212`} />
              </React.Fragment>
            ))}
          </g>
          <g className="home-r4-illustration-convergence">
            <path d="M212 106 C286 106 278 206 350 224" />
            <path d="M212 198 C284 198 288 218 350 232" />
            <path d="M212 290 C284 290 288 254 350 244" />
            <path d="M212 382 C286 382 278 274 350 252" />
            <circle className="home-r4-focus-ring" cx="390" cy="238" r="46" />
            <circle className="home-r4-focus-core" cx="390" cy="238" r="15" />
            <path className="home-r4-output-line" d="M436 238 H526 M526 205 V271" />
            <circle className="home-r4-output-point" cx="526" cy="238" r="22" />
          </g>
        </>
      )}

      {type === "shape" && (
        <>
          <g className="home-r4-illustration-layers">
            {[348, 326, 304, 282, 260].map((y) => (
              <path key={y} d={`M86 ${y} C170 ${y - 46} 230 ${y + 8} 314 ${y - 38} S462 ${y - 80} 554 ${y - 34}`} />
            ))}
          </g>
          <path className="home-r4-illustration-form" d="M222 286 C236 232 276 188 332 176 C390 164 442 190 466 236 L448 286 C420 312 386 326 340 326 C292 326 252 314 222 286 Z" />
          <path className="home-r4-illustration-cut" d="M306 251 C322 228 350 218 376 225 C400 232 414 250 412 270 C382 284 342 286 310 274 Z" />
          <g className="home-r4-illustration-joints">
            <circle cx="246" cy="286" r="12" />
            <circle cx="444" cy="278" r="12" />
            <path d="M246 298 V354 M444 290 V346" />
          </g>
        </>
      )}

      {type === "prove" && (
        <>
          <g className="home-r4-checkpoints">
            <path d="M104 122 V356 M320 84 V394 M536 122 V356" />
            <circle cx="104" cy="238" r="17" />
            <circle cx="320" cy="238" r="17" />
            <circle cx="536" cy="238" r="17" />
          </g>
          <path className="home-r4-test-path" d="M104 238 C168 154 244 154 320 238 S472 322 536 238" />
          <path className="home-r4-feedback-path" d="M536 286 C462 398 196 398 104 286" />
          <path className="home-r4-feedback-arrow" d="M118 274 L104 286 L124 292" />
          <g className="home-r4-specimen">
            <path d="M272 206 H366 L392 238 L366 270 H272 L248 238 Z" />
            <circle cx="286" cy="238" r="10" />
            <circle cx="354" cy="238" r="10" />
          </g>
        </>
      )}
    </svg>
  );
}
