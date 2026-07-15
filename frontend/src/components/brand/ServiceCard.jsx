import React from "react";

function ServiceCard({ service, onCTA }) {
  return (
    <div className="group flex flex-col h-full rounded-panel bg-surface-elevated overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Header with Icon & Color */}
      <div
        className="w-full h-32 flex items-center justify-center text-5xl transition-all group-hover:scale-110"
        style={{ backgroundColor: service.bgColor }}
      >
        {service.icon}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Badge */}
        <span className="inline-block w-fit px-3 py-1 bg-action-primary text-text-inverse text-xs font-semibold rounded-control mb-3">
          {service.category}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {service.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-action-primary font-semibold mb-3">
          {service.subtitle}
        </p>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-4 line-clamp-3 flex-grow">
          {service.description}
        </p>

        {/* Benefits */}
        <div className="mb-6 space-y-2">
          {service.benefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="text-action-primary font-bold mt-1">✓</span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onCTA(service)}
          className="w-full min-h-11 rounded-control bg-action-primary text-text-inverse font-semibold text-sm hover:bg-action-primary-hover transition-colors mt-auto"
        >
          {service.ctaText}
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;
