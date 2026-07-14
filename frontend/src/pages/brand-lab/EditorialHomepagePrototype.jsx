import React from "react";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import {
  BrandPrototypeShell,
  PrototypeImage,
  PrototypeLink,
} from "./BrandPrototypeShell";
import {
  prototypeContent,
  transformationStages,
  whyNiuvaItems,
} from "./prototypeContent";

function EditorialHeader() {
  return (
    <header className="bp-masthead bp-container">
      <BrandIdentity />
      <p>Editorial Product Studio</p>
    </header>
  );
}

function EditorialHero() {
  const { flagshipProject } = prototypeContent;
  return (
    <section id="editorial-hero" className="bp-editorial-hero bp-section" data-review-section="hero">
      <div className="bp-container bp-editorial-hero__grid">
        <div className="bp-editorial-hero__copy">
          <p className="bp-kicker">{prototypeContent.companyName}</p>
          <h1>{prototypeContent.headline}</h1>
          <p className="bp-lead">{prototypeContent.introduction}</p>
          <div className="bp-actions">
            <PrototypeLink to={prototypeContent.primaryCta.to}>{prototypeContent.primaryCta.label}</PrototypeLink>
            <PrototypeLink to={prototypeContent.secondaryCta.to} variant="outline">{prototypeContent.secondaryCta.label}</PrototypeLink>
          </div>
        </div>
        <figure className="bp-editorial-hero__media bp-media-frame">
          <div className="bp-editorial-curve" aria-hidden="true" />
          <PrototypeImage
            project={flagshipProject}
            eager
            sizes="(max-width: 767px) 100vw, 42vw"
          />
          <figcaption>
            <span>{flagshipProject.title}</span>
            <span>{flagshipProject.category}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function EditorialFlagship() {
  const project = prototypeContent.flagshipProject;
  return (
    <section id="editorial-flagship" className="bp-section bp-section--white" data-review-section="flagship">
      <div className="bp-container bp-editorial-feature">
        <div className="bp-section-intro">
          <p className="bp-kicker">Flagship project proof</p>
          <h2>Produk nyata menjadi bukti cara kerja.</h2>
        </div>
        <div className="bp-editorial-feature__media bp-media-frame">
          <PrototypeImage project={project} sizes="(max-width: 767px) 100vw, 62vw" />
        </div>
        <div className="bp-editorial-feature__story">
          <p className="bp-project-category">{project.category}</p>
          <h3>{project.title}</h3>
          <p>{project.body}</p>
          <dl className="bp-proof-list">
            <div><dt>Konteks</dt><dd>{project.challenge}</dd></div>
            <div><dt>Metode</dt><dd>{project.solution}</dd></div>
            <div><dt>Output</dt><dd>{project.output}</dd></div>
          </dl>
          <PrototypeLink to="/contact" variant="text">Diskusikan Project</PrototypeLink>
        </div>
      </div>
    </section>
  );
}

function EditorialCapabilities() {
  return (
    <section id="editorial-capabilities" className="bp-section" data-review-section="capabilities">
      <div className="bp-container">
        <div className="bp-section-intro bp-section-intro--wide">
          <p className="bp-kicker">Primary capabilities</p>
          <h2>Dua cara masuk menuju keputusan produk yang lebih jelas.</h2>
        </div>
        <div className="bp-editorial-capabilities">
          {prototypeContent.primaryCapabilities.map((service, index) => (
            <article key={service.title} className={`bp-editorial-chapter bp-editorial-chapter--${index + 1}`}>
              <p className="bp-chapter-index">0{index + 1}</p>
              <div>
                <h3>{service.title}</h3>
                <p>{service.body}</p>
              </div>
              <dl>
                <div><dt>Peran</dt><dd>{service.role}</dd></div>
                <div><dt>Output</dt><dd>{service.output}</dd></div>
              </dl>
              <PrototypeLink to="/contact" variant="text">{service.cta}</PrototypeLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialProcess() {
  return (
    <section id="editorial-process" className="bp-section bp-section--frost" data-review-section="process">
      <div className="bp-container">
        <div className="bp-section-intro">
          <p className="bp-kicker">Process narrative</p>
          <h2>Dari kebutuhan menuju output yang dapat dibahas.</h2>
          <p>Setiap tahap memperkecil asumsi dan menjaga keputusan tetap dapat ditelusuri.</p>
        </div>
        <ol className="bp-editorial-process">
          {transformationStages.map((stage, index) => (
            <li key={stage.name}>
              <span>0{index + 1}</span>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function EditorialSupporting() {
  return (
    <section id="editorial-supporting" className="bp-section bp-section--white">
      <div className="bp-container bp-editorial-supporting">
        <div className="bp-section-intro">
          <p className="bp-kicker">Supporting capabilities</p>
          <h2>Penguat kolaborasi dan eksekusi.</h2>
        </div>
        <div className="bp-editorial-supporting__list">
          {prototypeContent.supportingCapabilities.map((service) => (
            <article key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.body}</p>
              <PrototypeLink to="/capabilities" variant="text">Lihat capability</PrototypeLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialProjects() {
  return (
    <section id="editorial-projects" className="bp-section" data-review-section="projects">
      <div className="bp-container">
        <div className="bp-section-intro bp-section-intro--wide">
          <p className="bp-kicker">Selected projects</p>
          <h2>Bukti lain dari mobilitas dan produk interaktif.</h2>
        </div>
        <div className="bp-editorial-projects">
          {prototypeContent.selectedProjects.map((project, index) => (
            <article key={project.title}>
              <figure className="bp-media-frame">
                <PrototypeImage
                  project={project}
                  sizes="(max-width: 767px) 100vw, 50vw"
                />
              </figure>
              <div>
                <p className="bp-project-category">{project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.body}</p>
                <p className="bp-project-output"><strong>Output:</strong> {project.output}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="bp-project-roster" aria-label="Approved project roster">
          {prototypeContent.projectNames.join(" / ")}
        </p>
      </div>
    </section>
  );
}

function EditorialWhy() {
  return (
    <section id="editorial-why" className="bp-section bp-section--midnight">
      <div className="bp-container bp-editorial-why">
        <div className="bp-section-intro">
          <p className="bp-kicker">Why Niuva</p>
          <h2>Cukup strategis untuk bisnis, cukup teknis untuk eksekusi.</h2>
        </div>
        <div className="bp-editorial-why__list">
          {whyNiuvaItems.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialCta() {
  return (
    <footer id="editorial-cta" className="bp-section bp-editorial-cta" data-review-section="cta">
      <div className="bp-container">
        <p className="bp-kicker">Mulai dari konteks yang nyata</p>
        <h2>Diskusikan kebutuhan riset, desain, atau prototyping bersama Niuva.</h2>
        <p>Sampaikan konteks proyek, target hasil, batasan teknis, dan bentuk output yang dibutuhkan.</p>
        <div className="bp-actions">
          <PrototypeLink to="/contact">Diskusikan Project</PrototypeLink>
          <a className="bp-button bp-button--outline" href={prototypeContent.contact.whatsappHref}>Hubungi Niuva</a>
        </div>
      </div>
    </footer>
  );
}

export default function EditorialHomepagePrototype() {
  return (
    <BrandPrototypeShell concept="Editorial">
      <div className="brand-prototype brand-prototype-editorial">
        <EditorialHeader />
        <EditorialHero />
        <EditorialFlagship />
        <EditorialCapabilities />
        <EditorialProcess />
        <EditorialSupporting />
        <EditorialProjects />
        <EditorialWhy />
        <EditorialCta />
      </div>
    </BrandPrototypeShell>
  );
}

