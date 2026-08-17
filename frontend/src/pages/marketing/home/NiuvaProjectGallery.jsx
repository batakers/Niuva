import React, { useId, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const clampIndex = (index, count) =>
  Math.min(Math.max(Number.isFinite(index) ? index : 0, 0), Math.max(count - 1, 0));

export function NiuvaProjectGallery({
  items,
  ariaLabel,
  actionLabel,
  selectLabel,
  defaultIndex = 0,
  expandRatio = 0.52,
}) {
  const galleryId = useId();
  const buttonRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(() =>
    clampIndex(defaultIndex, items.length),
  );
  const activeGrow = useMemo(() => {
    const ratio = Math.min(Math.max(expandRatio, 0.4), 0.72);
    return items.length > 1 ? (ratio * (items.length - 1)) / (1 - ratio) : 1;
  }, [expandRatio, items.length]);
  const mobileRows = useMemo(
    () =>
      items
        .map((_, index) => (index === activeIndex ? "min(31rem, 126vw)" : "8.5rem"))
        .join(" "),
    [activeIndex, items],
  );

  if (!items.length) return null;

  const activateFromKeyboard = (index, event) => {
    let nextIndex = index;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <ul
      className="home-r4-project-gallery"
      aria-label={ariaLabel}
      data-active-index={activeIndex}
      style={{
        "--home-r4-gallery-active-grow": activeGrow,
        "--home-r4-gallery-mobile-rows": mobileRows,
      }}
    >
      {items.map((item, index) => {
        const active = index === activeIndex;
        const detailsId = `${galleryId}-project-${index}`;

        return (
          <li
            className={`home-r4-project-panel${active ? " is-active" : ""}`}
            data-active={active ? "true" : "false"}
            key={item.title}
          >
            <img
              src={item.image}
              alt={item.imageAlt}
              width={item.imageWidth}
              height={item.imageHeight}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
            />
            <span className="home-r4-project-scrim" aria-hidden="true" />
            <button
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
              className="home-r4-project-trigger"
              aria-expanded={active}
              aria-controls={detailsId}
              aria-label={`${selectLabel}: ${item.title}`}
              onClick={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => activateFromKeyboard(index, event)}
            />
            <div className="home-r4-project-summary">
              <div
                className="home-r4-project-compact-label"
                aria-hidden={active}
              >
                {item.shortTitle || item.title}
              </div>
              <div className="home-r4-project-expanded" aria-hidden={!active}>
                <p className="home-r4-project-category">{item.category}</p>
                <h3>{item.title}</h3>
                <div id={detailsId} className="home-r4-project-details">
                  <div className="home-r4-project-details-inner">
                    <p>{item.preview || item.body}</p>
                    <Link to={item.to} tabIndex={active ? undefined : -1}>
                      {actionLabel}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
