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

function ExperimentalHeader() {
  return (
    <header className="bp-masthead bp-container">
      <BrandIdentity />
      <p>Experimental Engineering Studio</p>
    </header>
  );
}

function TransformationCurve({ compact = false }) {
  return (
    <div className={`bp-transformation-curve ${compact ? "is-compact" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1200 300" role="presentation" focusable="false">
        <path className="bp-transformation-curve__guide" d="M48 58 H745 C885 58 885 242 745 242 H1152" />
        <path className="bp-transformation-curve__progress" d="M48 58 H745 C885 58 885 242 745 242 H1152" />
        <circle cx="48" cy="58" r="10" />
        <circle cx="322" cy="58" r="7" />
        <circle cx="625" cy="58" r="7" />
        <circle cx="835" cy="242" r="7" />
        <circle cx="1152" cy="242" r="10" />
      </svg>
    </div>
  );
}

function ExperimentalHero() {
  const project = prototypeContent.flagshipProject;
  return (
    <section id="experimental-hero" className="bp-section bp-experimental-hero" data-review-section="hero">
      <div className="bp-container bp-experimental-hero__grid">
        <div className="bp-experimental-hero__copy">
          <p className="bp-technical-label">NEED / RESEARCH / PROTOTYPE / OUTPUT</p>
          <h1>{prototypeContent.headline}</h1>
          <p className="bp-lead">{prototypeContent.introduction}</p>
          <div className="bp-actions">
            <PrototypeLink to={prototypeContent.primaryCta.to}>{prototypeContent.primaryCta.label}</PrototypeLink>
            <PrototypeLink to={prototypeContent.secondaryCta.to} variant="outline">{prototypeContent.secondaryCta.label}</PrototypeLink>
          </div>
        </div>
        <figure className="bp-experimental-hero__media bp-media-frame">
          <PrototypeImage
            project={project}
            eager
            sizes="(max-width: 767px) 100vw, 50vw"
          />
          <figcaption>
            <span className="bp-technical-label">FLAGSHIP / EV MOBILITY</span>
            <strong>{project.title}</strong>
          </figcaption>
        </figure>
        <div className="bp-experimental-hero__path">
          <TransformationCurve compact />
          <div className="bp-experimental-hero__nodes">
            <span>Need</span>
            <span>Output</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperimentalFlagship() {
  const project = prototypeContent.flagshipProject;
  return (
    <section id="experimental-flagship" className="bp-section bp-section--white" data-review-section="flagship">
      <div className="bp-container bp-experimental-proof">
        <div className="bp-experimental-proof__heading">
          <p className="bp-technical-label">PROJECT PROOF / 01</p>
          <h2>Engineering terlihat saat keputusan dapat dibuktikan.</h2>
        </div>
        <figure className="bp-media-frame bp-experimental-proof__media">
          <PrototypeImage project={project} sizes="(max-width: 767px) 100vw, 58vw" />
        </figure>
        <div className="bp-experimental-proof__story">
          <p className="bp-technical-label">{project.category}</p>
          <h3>{project.title}</h3>
          <p>{project.body}</p>
          <dl className="bp-proof-list">
            <div><dt>Tantangan</dt><dd>{project.challenge}</dd></div>
            <div><dt>Metode</dt><dd>{project.solution}</dd></div>
            <div><dt>Output</dt><dd>{project.output}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function ExperimentalCapabilities() {
  const [research, prototyping] = prototypeContent.primaryCapabilities;
  return (
    <section id="experimental-capabilities" className="bp-section" data-review-section="capabilities">
      <div className="bp-container">
        <div className="bp-section-intro bp-section-intro--wide">
          <p className="bp-technical-label">PRIMARY CAPABILITIES</p>
          <h2>Dua kapabilitas, dua cara kerja yang berbeda.</h2>
        </div>
        <div className="bp-experimental-capabilities">
          <article className="bp-experimental-research">
            <p className="bp-technical-label">RESEARCH QUESTION</p>
            <h3>Apa yang perlu dibuktikan sebelum produk dikembangkan?</h3>
            <p>{research.body}</p>
            <blockquote>{research.role}</blockquote>
            <dl>
              <div><dt>Output</dt><dd>{research.output}</dd></div>
              <div><dt>Untuk</dt><dd>{research.targetUsers}</dd></div>
            </dl>
            <PrototypeLink to="/contact" variant="text">{research.cta}</PrototypeLink>
          </article>
          <article className="bp-experimental-prototype">
            <figure className="bp-media-frame">
              <PrototypeImage
                project={prototypeContent.selectedProjects[0]}
                sizes="(max-width: 767px) 100vw, 44vw"
              />
            </figure>
            <div>
              <p className="bp-technical-label">ARTIFACT / PROTOTYPE OUTPUT</p>
              <h3>{prototyping.title}</h3>
              <p>{prototyping.body}</p>
              <p><strong>Output:</strong> {prototyping.output}</p>
              <PrototypeLink to="/contact" variant="text">{prototyping.cta}</PrototypeLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function ExperimentalPath() {
  return (
    <section id="experimental-process" className="bp-section bp-section--midnight bp-experimental-path" data-review-section="process">
      <div className="bp-container">
        <div className="bp-section-intro bp-section-intro--wide">
          <p className="bp-technical-label">NEED TO OUTPUT</p>
          <h2>Satu jalur transformasi, lima keputusan yang dapat ditelusuri.</h2>
          <p className="bp-lead">Tidak ada informasi yang bergantung pada animasi. Jalur hanya memperjelas hubungan antar tahap.</p>
        </div>
        <TransformationCurve />
        <ol className="bp-experimental-stages">
          {transformationStages.map((stage, index) => (
            <li key={stage.name}>
              <span className="bp-technical-label">0{index + 1} / {stage.name}</span>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ExperimentalSupporting() {
  return (
    <section id="experimental-supporting" className="bp-section bp-section--frost">
      <div className="bp-container bp-experimental-supporting">
        <div className="bp-section-intro">
          <p className="bp-technical-label">SUPPORTING CAPABILITIES</p>
          <h2>Keahlian pendukung untuk menyelaraskan dan mengeksekusi.</h2>
        </div>
        <div>
          {prototypeContent.supportingCapabilities.map((service, index) => (
            <article key={service.title}>
              <span className="bp-technical-label">0{index + 3}</span>
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

function ExperimentalEvidence() {
  const xeon = prototypeContent.selectedProjects[0];
  return (
    <section id="experimental-evidence" className="bp-section bp-section--white">
      <div className="bp-container bp-experimental-evidence">
        <div className="bp-section-intro">
          <p className="bp-technical-label">PROCESS EVIDENCE / ASSET DEPENDENCY</p>
          <h2>Project nyata tersedia. Dokumentasi proses masih perlu dilengkapi.</h2>
          <p>Prototype menggunakan aset project yang telah disetujui tanpa menciptakan sketsa, CAD, atau foto workshop yang tidak tersedia.</p>
        </div>
        <figure className="bp-media-frame">
          <PrototypeImage project={xeon} sizes="(max-width: 767px) 100vw, 48vw" />
          <figcaption><span className="bp-technical-label">PROJECT EVIDENCE</span>{xeon.title}</figcaption>
        </figure>
        <aside aria-label="Future asset dependency">
          <p className="bp-technical-label">FUTURE ASSET REQUIREMENT</p>
          <p>Riset, kolaborasi tim, CAD, fabrikasi, pengujian, dan makerspace Bandung Techno Park.</p>
        </aside>
      </div>
    </section>
  );
}

function ExperimentalProjects() {
  return (
    <section id="experimental-projects" className="bp-section" data-review-section="projects">
      <div className="bp-container">
        <div className="bp-section-intro bp-section-intro--wide">
          <p className="bp-technical-label">SELECTED PROJECTS</p>
          <h2>Produk menjadi medium untuk membaca kapabilitas.</h2>
        </div>
        <div className="bp-experimental-projects">
          {prototypeContent.selectedProjects.map((project, index) => (
            <article key={project.title}>
              <figure className="bp-media-frame">
                <PrototypeImage project={project} sizes="(max-width: 767px) 100vw, 52vw" />
              </figure>
              <div>
                <p className="bp-technical-label">PROJECT / 0{index + 2} / {project.category}</p>
                <h3>{project.title}</h3>
                <p>{project.body}</p>
                <dl>
                  <div><dt>Output</dt><dd>{project.output}</dd></div>
                  <div><dt>Capability</dt><dd>{project.capability}</dd></div>
                </dl>
              </div>
            </article>
          ))}
        </div>
        <p className="bp-project-roster" aria-label="Approved project roster">{prototypeContent.projectNames.join(" / ")}</p>
      </div>
    </section>
  );
}

function ExperimentalWhy() {
  return (
    <section id="experimental-why" className="bp-section bp-section--frost">
      <div className="bp-container bp-experimental-why">
        <div className="bp-section-intro">
          <p className="bp-technical-label">WHY NIUVA</p>
          <h2>Keputusan yang lebih jelas, bukan dekorasi teknologi.</h2>
        </div>
        <div>
          {whyNiuvaItems.map((item, index) => (
            <article key={item.title}>
              <span className="bp-technical-label">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperimentalCta() {
  return (
    <footer id="experimental-cta" className="bp-section bp-experimental-cta" data-review-section="cta">
      <div className="bp-container">
        <p className="bp-technical-label">NEXT INPUT / PROJECT CONTEXT</p>
        <h2>Mulai dari kebutuhan yang perlu diuji.</h2>
        <p>Sampaikan konteks proyek, target hasil, batasan teknis, dan bentuk output yang dibutuhkan.</p>
        <div className="bp-actions">
          <PrototypeLink to="/contact">Diskusikan Project</PrototypeLink>
          <a className="bp-button bp-button--outline" href={prototypeContent.contact.whatsappHref}>Hubungi Niuva</a>
        </div>
      </div>
    </footer>
  );
}

export default function ExperimentalHomepagePrototype() {
  return (
    <BrandPrototypeShell concept="Experimental">
      <div className="brand-prototype brand-prototype-experimental">
        <ExperimentalHeader />
        <ExperimentalHero />
        <ExperimentalFlagship />
        <ExperimentalCapabilities />
        <ExperimentalPath />
        <ExperimentalSupporting />
        <ExperimentalEvidence />
        <ExperimentalProjects />
        <ExperimentalWhy />
        <ExperimentalCta />
      </div>
    </BrandPrototypeShell>
  );
}
