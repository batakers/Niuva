const fs = require("node:fs");
const path = require("node:path");

const worktreeRoot = path.resolve(__dirname, "..", "..", "..", "..");
const playwrightRoots = [
  process.env.NIUVA_HOMEPAGE_R4_PLAYWRIGHT_ROOT,
  path.join(worktreeRoot, "frontend")
].filter(Boolean);
const playwrightPath = require.resolve("playwright", {
  paths: playwrightRoots
});
const { chromium } = require(playwrightPath);

const base = process.env.NIUVA_HOMEPAGE_R4_URL || "http://127.0.0.1:4198";
const baseHostname = new URL(base).hostname;
const evidenceRoot = path.join(__dirname, "evidence");
const screenshotRoot = path.join(evidenceRoot, "screenshots");
fs.mkdirSync(screenshotRoot, { recursive: true });

const variants = [
  { language: "id", route: "/", heading: "Dari ide menuju" },
  { language: "en", route: "/en", heading: "From an idea to" }
];
const widths = [320, 390, 768, 1024, 1440];
const expectedSections = [
  ".hero",
  ".orientation",
  ".process-section",
  ".chapters",
  ".projects",
  ".services",
  ".retail",
  ".partnership",
  ".faq",
  ".closing"
];

function routeWithCapture(route) {
  return `${route}${route.includes("?") ? "&" : "?"}capture=1`;
}

async function openPage(browser, options) {
  const context = await browser.newContext({
    viewport: { width: options.width, height: options.height },
    reducedMotion: options.reducedMotion || "no-preference",
    hasTouch: Boolean(options.hasTouch),
    isMobile: Boolean(options.hasTouch)
  });
  const page = await context.newPage();
  const consoleEvents = [];
  const pageErrors = [];
  const externalRequests = [];
  const failedResponses = [];
  page.on("console", (message) => {
    if (["warning", "error"].includes(message.type())) consoleEvents.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    const target = new URL(request.url());
    if (target.hostname !== baseHostname) externalRequests.push(request.url());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
  });
  return { context, page, consoleEvents, pageErrors, externalRequests, failedResponses };
}

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const records = [];
    const interactions = {};
    let failed = false;

  for (const variant of variants) {
    for (const width of widths) {
      const height = width <= 390 ? 844 : 900;
      const session = await openPage(browser, { width, height });
      const response = await session.page.goto(`${base}${routeWithCapture(variant.route)}`, {
        waitUntil: "load",
        timeout: 15000
      });
      await session.page.evaluate(() => document.fonts.ready);
      await session.page.evaluate(() => window.scrollTo(0, 0));

      const evidence = await session.page.evaluate(({ expectedLanguage, expectedHeading, viewportWidth, sectionSelectors }) => {
        const visible = (element) => {
          if (!element) return false;
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const controls = [...document.querySelectorAll("a,button,input,select,textarea,summary")].filter(visible);
        const smallTargets = controls
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              text: (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 80),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            };
          })
          .filter((entry) => entry.width < 44 || entry.height < 44);
        const brokenImages = [...document.images].filter((image) => visible(image) && image.naturalWidth === 0).map((image) => image.src);
        const missingAlt = [...document.images].filter((image) => !image.hasAttribute("alt")).map((image) => image.src);
        const heroHeading = document.querySelector(".hero h1");
        const heroRect = heroHeading.getBoundingClientRect();
        const contour = document.querySelector(".contour-stage").getBoundingClientRect();
        const contourField = document.querySelector(".contour-field").getBoundingClientRect();
        const contourLines = document.querySelector(".contour-lines").getBoundingClientRect();
        const orientation = document.querySelector(".orientation").getBoundingClientRect();
        const orientationCopy = document.querySelector(".orientation-copy").getBoundingClientRect();
        const process = document.querySelector(".process-section").getBoundingClientRect();
        const heroStyle = getComputedStyle(heroHeading);
        const closingContour = document.querySelector(".closing-contour g").getBoundingClientRect();
        const closingActions = document.querySelector(".closing-inner > div").getBoundingClientRect();
        const retailClosingButton = document.querySelector(".button-dark-text");
        const serviceArticles = [...document.querySelectorAll(".service-grid article")];
        const serviceLinks = serviceArticles.map((article) => article.querySelector("a"));
        const partnershipChildren = [...document.querySelectorAll(".partnership > *")].map((element) => element.getBoundingClientRect());
        const footerChildren = [...document.querySelectorAll(".footer-row > *")].map((element) => element.getBoundingClientRect());
        const footerRowTops = footerChildren.map((rect) => rect.top).sort((a, b) => a - b);
        const footerRowCount = footerRowTops.reduce((rows, top) => {
          if (!rows.length || top - rows[rows.length - 1] > 8) rows.push(top);
          return rows;
        }, []).length;
        const terminalCanvas = document.querySelector(".terminal-canvas").getBoundingClientRect();
        const terminalContour = document.querySelector(".closing-contour").getBoundingClientRect();
        const visibleWideRules = [...document.querySelectorAll("body *")].filter((element) => {
          if (!visible(element)) return false;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width >= viewportWidth * 0.7
            && Number.parseFloat(style.borderLeftWidth) === 0
            && Number.parseFloat(style.borderRightWidth) === 0
            && (Number.parseFloat(style.borderTopWidth) > 0 || Number.parseFloat(style.borderBottomWidth) > 0);
        }).length;
        const illustrationFigures = [...document.querySelectorAll(".chapter-illustration")];
        const processItems = [...document.querySelectorAll(".process-rail li")].map((item) => {
          const rect = item.getBoundingClientRect();
          return { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width) };
        });
        const sectionTops = sectionSelectors.map((selector) => Math.round(document.querySelector(selector).getBoundingClientRect().top + window.scrollY));
        const activeLanguage = document.querySelector(`[data-language-link="${expectedLanguage}"][aria-current="page"]`);
        const canonical = document.getElementById("canonical-link");
        return {
          language: document.documentElement.lang,
          title: document.title,
          heading: heroHeading.textContent.replace(/\s+/g, " ").trim(),
          headingMatch: heroHeading.textContent.includes(expectedHeading),
          heroCenterDelta: Math.abs((heroRect.left + (heroRect.width / 2)) - (viewportWidth / 2)),
          heroTrackingRatio: Number.parseFloat(heroStyle.letterSpacing) / Number.parseFloat(heroStyle.fontSize),
          bodyFont: getComputedStyle(document.body).fontFamily,
          accentFont: getComputedStyle(document.querySelector(".hero h1 em")).fontFamily,
          bodyFontSize: Number.parseFloat(getComputedStyle(document.body).fontSize),
          loadedMona: document.fonts.check("16px 'Mona Sans Candidate'"),
          loadedBona: document.fonts.check("16px 'Bona Nova Candidate'"),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          smallTargets,
          brokenImages,
          missingAlt,
          landmarks: {
            siteHeader: [...document.querySelectorAll(".site-header")].filter(visible).length,
            main: [...document.querySelectorAll("main")].filter(visible).length,
            footer: [...document.querySelectorAll("footer")].filter(visible).length,
            desktopNavVisible: visible(document.querySelector(".desktop-nav")),
            mobileToggleVisible: visible(document.querySelector("#mobile-menu-toggle"))
          },
          skipTarget: document.querySelector(".skip-link")?.getAttribute("href") || null,
          liveRegion: document.querySelector("#prototype-status")?.getAttribute("aria-live") || null,
          politeLiveRegionCount: document.querySelectorAll('[aria-live="polite"]').length,
          brandLabel: document.querySelector("[data-brand-link]")?.getAttribute("aria-label") || null,
          canonicalPath: canonical ? new URL(canonical.href).pathname : null,
          activeLanguage: activeLanguage?.textContent.trim() || null,
          sectionTops,
          processSeparated: process.top > contour.bottom + 40,
          contourBridgeContinues: contourLines.bottom > orientation.top + 24,
          contourBridgeEndsBeforeContent: contourLines.bottom < orientationCopy.top - 12,
          contourOverscan: contourField.left < -20 && contourField.right > viewportWidth + 20,
          heroFootnoteCount: document.querySelectorAll(".hero-footnote").length,
          processItems,
          processLayout: getComputedStyle(document.querySelector(".process-rail")).gridTemplateColumns,
          processLastConnector: getComputedStyle(document.querySelector(".process-rail li:last-child"), "::after").content,
          boundaryVisible: visible(document.querySelector(".prototype-boundary")),
          illustrationCount: illustrationFigures.length,
          illustrationCaptionCount: illustrationFigures.filter((figure) => visible(figure.querySelector("figcaption"))).length,
          chapterPhotoCount: document.querySelectorAll(".chapters img").length,
          serviceCount: serviceArticles.length,
          serviceBackgrounds: [...new Set(serviceArticles.map((article) => getComputedStyle(article).backgroundColor))],
          serviceLinkLabels: [...new Set(serviceLinks.map((link) => link.textContent.trim()))],
          serviceHighlightCount: document.querySelectorAll(".service-support").length,
          retailHeadingColumns: getComputedStyle(document.querySelector(".retail-heading")).gridTemplateColumns.split(" ").length,
          partnershipTopDelta: partnershipChildren.length === 2 ? Math.abs(partnershipChildren[0].top - partnershipChildren[1].top) : null,
          partnershipDetailsAfterCopy: partnershipChildren.length === 2
            ? partnershipChildren[1].top > partnershipChildren[0].bottom + 30
            : false,
          contactDetailRows: document.querySelectorAll(".partnership-details dl > div").length,
          faqAnswerSurfaceCount: document.querySelectorAll(".faq-list details > p").length,
          closingContourBelowActions: closingContour.top >= closingActions.bottom - 8,
          terminalContourContinues: terminalContour.top < document.querySelector(".site-footer").getBoundingClientRect().top
            && terminalContour.bottom >= terminalCanvas.bottom - 40,
          closingRetailBackground: getComputedStyle(retailClosingButton).backgroundColor,
          footerRowCount,
          officialMarkCount: [...document.querySelectorAll('img[src="/assets/niuva-mark.svg"]')].filter(visible).length,
          visibleWideRules,
          participantLeaks: (document.body.innerText.match(/CVR-|VRA-|fixture harness|Review Mode|evaluator|OPEN GATES/gi) || []).length
        };
      }, {
        expectedLanguage: variant.language,
        expectedHeading: variant.heading,
        viewportWidth: width,
        sectionSelectors: expectedSections
      });

      const sectionOrderValid = evidence.sectionTops.every((top, index, all) => index === 0 || top > all[index - 1]);
      const mobileProcessVertical = width <= 900
        ? evidence.processItems.every((item, index, all) => index === 0 || item.top > all[index - 1].top)
        : true;
      const desktopProcessHorizontal = width > 900
        ? new Set(evidence.processItems.map((item) => item.top)).size === 1
        : true;
      const expectedCanonical = variant.language === "en" ? "/en" : "/";
      const expectedBrandLabel = variant.language === "en" ? "Niuva, back to the top" : "Niuva, kembali ke awal";
      const recordFailed = !response || response.status() !== 200
        || session.consoleEvents.length > 0
        || session.pageErrors.length > 0
        || session.externalRequests.length > 0
        || session.failedResponses.length > 0
        || evidence.language !== variant.language
        || !evidence.headingMatch
        || evidence.heroCenterDelta > 2
        || evidence.heroTrackingRatio < -0.04
        || evidence.bodyFontSize < 16
        || !evidence.loadedMona
        || !evidence.loadedBona
        || evidence.scrollWidth > evidence.clientWidth + 1
        || evidence.smallTargets.length > 0
        || evidence.brokenImages.length > 0
        || evidence.missingAlt.length > 0
        || evidence.landmarks.siteHeader !== 1
        || evidence.landmarks.main !== 1
        || evidence.landmarks.footer !== 1
        || (width > 900 ? !evidence.landmarks.desktopNavVisible : !evidence.landmarks.mobileToggleVisible)
        || evidence.skipTarget !== "#main-content"
        || evidence.liveRegion !== "polite"
        || evidence.politeLiveRegionCount !== 1
        || evidence.brandLabel !== expectedBrandLabel
        || evidence.canonicalPath !== expectedCanonical
        || !evidence.activeLanguage
        || !sectionOrderValid
        || !evidence.processSeparated
        || !evidence.contourBridgeContinues
        || !evidence.contourBridgeEndsBeforeContent
        || !evidence.contourOverscan
        || evidence.heroFootnoteCount !== 0
        || !mobileProcessVertical
        || !desktopProcessHorizontal
        || evidence.processLastConnector !== "none"
        || !evidence.boundaryVisible
        || evidence.illustrationCount !== 3
        || evidence.illustrationCaptionCount !== 3
        || evidence.chapterPhotoCount !== 0
        || evidence.serviceCount !== 4
        || evidence.serviceBackgrounds.length !== 1
        || evidence.serviceLinkLabels.length !== 1
        || evidence.serviceHighlightCount !== 0
        || evidence.retailHeadingColumns !== (width > 900 ? 2 : 1)
        || evidence.partnershipTopDelta === null
        || (width > 900 ? evidence.partnershipTopDelta > 2 : !evidence.partnershipDetailsAfterCopy)
        || evidence.contactDetailRows !== 3
        || evidence.faqAnswerSurfaceCount !== 3
        || !evidence.closingContourBelowActions
        || !evidence.terminalContourContinues
        || evidence.closingRetailBackground === "rgba(0, 0, 0, 0)"
        || evidence.footerRowCount !== (width > 900 ? 1 : 2)
        || evidence.officialMarkCount !== 2
        || evidence.visibleWideRules > 4
        || evidence.participantLeaks > 0;
      failed ||= recordFailed;

      const viewportScreenshot = `homepage-r4-${variant.language}-${width}-viewport.png`;
      await session.page.screenshot({ path: path.join(screenshotRoot, viewportScreenshot), fullPage: false });
      let fullPageScreenshot = null;
      if ((width === 390 || width === 1440) && variant.language === "id") {
        fullPageScreenshot = `homepage-r4-${variant.language}-${width}-full.png`;
        await session.page.screenshot({ path: path.join(screenshotRoot, fullPageScreenshot), fullPage: true });
      }

      records.push({
        ...variant,
        width,
        height,
        status: response ? response.status() : null,
        consoleEvents: session.consoleEvents,
        pageErrors: session.pageErrors,
        externalRequests: session.externalRequests,
        failedResponses: session.failedResponses,
        sectionOrderValid,
        mobileProcessVertical,
        desktopProcessHorizontal,
        recordFailed,
        ...evidence,
        viewportScreenshot,
        fullPageScreenshot
      });
      await session.context.close();
    }
  }

  const desktop = await openPage(browser, { width: 1440, height: 900 });
  await desktop.page.goto(`${base}/?capture=1`, { waitUntil: "load", timeout: 15000 });
  await desktop.page.click("#services-toggle");
  interactions.servicesMenu = await desktop.page.evaluate(() => ({
    expanded: document.getElementById("services-toggle").getAttribute("aria-expanded"),
    hidden: document.getElementById("services-panel").hidden,
    columns: getComputedStyle(document.getElementById("services-panel")).gridTemplateColumns,
    groups: document.querySelectorAll("#services-panel .mega-main, #services-panel .mega-retail").length
  }));
  await desktop.page.keyboard.press("Escape");
  interactions.servicesEscape = await desktop.page.evaluate(() => ({
    expanded: document.getElementById("services-toggle").getAttribute("aria-expanded"),
    hidden: document.getElementById("services-panel").hidden,
    focus: document.activeElement?.id || null
  }));
  await desktop.page.click("#language-toggle");
  interactions.languageMenu = await desktop.page.evaluate(() => ({
    expanded: document.getElementById("language-toggle").getAttribute("aria-expanded"),
    hidden: document.getElementById("language-menu").hidden,
    links: [...document.querySelectorAll("#language-menu a")].map((link) => ({ text: link.textContent.trim(), href: new URL(link.href).pathname, current: link.getAttribute("aria-current") }))
  }));
  await desktop.page.keyboard.press("Escape");
  await desktop.page.locator('[data-prototype-action="project"]').first().click();
  interactions.projectBoundary = await desktop.page.evaluate(() => ({
    visible: !document.getElementById("prototype-toast").hidden,
    text: document.getElementById("prototype-toast-message").textContent
  }));
  await desktop.page.click("[data-dismiss-toast]");
  await desktop.page.locator('[data-prototype-action="retail"]').first().click();
  interactions.retailBoundary = await desktop.page.evaluate(() => ({
    visible: !document.getElementById("prototype-toast").hidden,
    text: document.getElementById("prototype-toast-message").textContent
  }));
  await desktop.page.click("[data-dismiss-toast]");
  await desktop.page.locator('[data-prototype-action="service"]').first().click();
  interactions.serviceBoundary = await desktop.page.evaluate(() => ({
    visible: !document.getElementById("prototype-toast").hidden,
    text: document.getElementById("prototype-toast-message").textContent
  }));
  await desktop.page.click("[data-dismiss-toast]");
  await desktop.page.locator('[data-prototype-action="privacy"]').click();
  interactions.privacyBoundary = await desktop.page.evaluate(() => ({
    visible: !document.getElementById("prototype-toast").hidden,
    text: document.getElementById("prototype-toast-message").textContent
  }));
  await desktop.context.close();

  const mobile = await openPage(browser, { width: 390, height: 844, hasTouch: true });
  await mobile.page.goto(`${base}/?capture=1`, { waitUntil: "load", timeout: 15000 });
  await mobile.page.click("#mobile-menu-toggle");
  interactions.mobileMenu = await mobile.page.evaluate(() => ({
    expanded: document.getElementById("mobile-menu-toggle").getAttribute("aria-expanded"),
    hidden: document.getElementById("mobile-menu").hidden,
    focusInside: document.getElementById("mobile-menu").contains(document.activeElement),
    visibleLanguageLinks: [...document.querySelectorAll("#mobile-menu [data-language-link]")].filter((link) => link.getBoundingClientRect().height >= 44).length
  }));
  await mobile.page.click("#mobile-services-toggle");
  interactions.mobileServices = await mobile.page.evaluate(() => ({
    expanded: document.getElementById("mobile-services-toggle").getAttribute("aria-expanded"),
    hidden: document.getElementById("mobile-services").hidden,
    groups: document.querySelectorAll("#mobile-services > strong").length
  }));
  await mobile.page.keyboard.press("Escape");
  interactions.mobileEscape = await mobile.page.evaluate(() => ({
    expanded: document.getElementById("mobile-menu-toggle").getAttribute("aria-expanded"),
    hidden: document.getElementById("mobile-menu").hidden,
    focus: document.activeElement?.id || null,
    bodyLocked: document.body.classList.contains("mobile-menu-open"),
    servicesExpanded: document.getElementById("mobile-services-toggle").getAttribute("aria-expanded"),
    servicesHidden: document.getElementById("mobile-services").hidden,
    servicesGlyph: document.querySelector("#mobile-services-toggle span:last-child").textContent
  }));
  await mobile.context.close();

  const faq = await openPage(browser, { width: 390, height: 844 });
  await faq.page.goto(`${base}/?capture=1`, { waitUntil: "load", timeout: 15000 });
  const summaries = faq.page.locator(".faq-list summary");
  await summaries.nth(0).click();
  await faq.page.waitForFunction(() => document.querySelectorAll(".faq-list details[open]").length === 1);
  await summaries.nth(1).click();
  await faq.page.waitForFunction(() => {
    const details = [...document.querySelectorAll(".faq-list details")];
    return details.filter((entry) => entry.open).length === 1 && details[1].open;
  });
  interactions.faq = await faq.page.evaluate(() => ({
    openCount: document.querySelectorAll(".faq-list details[open]").length,
    openIndex: [...document.querySelectorAll(".faq-list details")].findIndex((details) => details.open)
  }));
  await faq.context.close();

  const motion = await openPage(browser, { width: 1440, height: 900, reducedMotion: "reduce" });
  await motion.page.goto(`${base}/`, { waitUntil: "load", timeout: 15000 });
  interactions.reducedMotion = await motion.page.evaluate(() => ({
    duration: getComputedStyle(document.querySelector(".contour-lines")).animationDuration,
    iterations: getComputedStyle(document.querySelector(".contour-lines")).animationIterationCount,
    terminalDuration: getComputedStyle(document.querySelector(".closing-contour g")).animationDuration,
    fieldTransform: getComputedStyle(document.querySelector(".contour-field")).transform,
    revealOpacity: getComputedStyle(document.querySelector(".chapter")).opacity
  }));
  await motion.context.close();

  const pointer = await openPage(browser, { width: 1440, height: 900 });
  await pointer.page.goto(`${base}/`, { waitUntil: "load", timeout: 15000 });
  const ambientBefore = await pointer.page.evaluate(() => ({
    group: getComputedStyle(document.querySelector(".contour-lines")).transform,
    layer: getComputedStyle(document.querySelector(".contour-lines path")).transform
  }));
  await pointer.page.waitForTimeout(1000);
  const ambientAfter = await pointer.page.evaluate(() => ({
    group: getComputedStyle(document.querySelector(".contour-lines")).transform,
    layer: getComputedStyle(document.querySelector(".contour-lines path")).transform
  }));
  interactions.ambientMotion = {
    before: ambientBefore,
    after: ambientAfter,
    changed: ambientBefore.group !== ambientAfter.group || ambientBefore.layer !== ambientAfter.layer
  };
  const contourBox = await pointer.page.locator(".contour-stage").boundingBox();
  await pointer.page.mouse.move(contourBox.x + (contourBox.width * 0.82), contourBox.y + (contourBox.height * 0.34));
  interactions.pointer = await pointer.page.evaluate(() => ({
    x: document.querySelector(".contour-stage").style.getPropertyValue("--pointer-x"),
    y: document.querySelector(".contour-stage").style.getPropertyValue("--pointer-y")
  }));
  await pointer.context.close();

  const skip = await openPage(browser, { width: 390, height: 844 });
  await skip.page.goto(`${base}/?capture=1`, { waitUntil: "load", timeout: 15000 });
  await skip.page.keyboard.press("Tab");
  interactions.firstFocus = await skip.page.evaluate(() => document.activeElement?.className || null);
  await skip.page.keyboard.press("Enter");
  interactions.skipTarget = await skip.page.evaluate(() => document.activeElement?.id || null);
  await skip.context.close();

  const duration = interactions.reducedMotion.duration.endsWith("ms")
    ? Number.parseFloat(interactions.reducedMotion.duration) / 1000
    : Number.parseFloat(interactions.reducedMotion.duration);
  const interactionFailed = interactions.servicesMenu.expanded !== "true"
    || interactions.servicesMenu.hidden
    || interactions.servicesMenu.groups !== 2
    || interactions.servicesEscape.expanded !== "false"
    || !interactions.servicesEscape.hidden
    || interactions.servicesEscape.focus !== "services-toggle"
    || interactions.languageMenu.expanded !== "true"
    || interactions.languageMenu.hidden
    || interactions.languageMenu.links.length !== 2
    || !interactions.projectBoundary.visible
    || !interactions.retailBoundary.visible
    || !interactions.serviceBoundary.visible
    || !interactions.serviceBoundary.text.includes("Research & Development")
    || !interactions.privacyBoundary.visible
    || interactions.mobileMenu.expanded !== "true"
    || interactions.mobileMenu.hidden
    || !interactions.mobileMenu.focusInside
    || interactions.mobileMenu.visibleLanguageLinks !== 2
    || interactions.mobileServices.expanded !== "true"
    || interactions.mobileServices.hidden
    || interactions.mobileServices.groups !== 2
    || interactions.mobileEscape.expanded !== "false"
    || !interactions.mobileEscape.hidden
    || interactions.mobileEscape.focus !== "mobile-menu-toggle"
    || interactions.mobileEscape.bodyLocked
    || interactions.mobileEscape.servicesExpanded !== "false"
    || !interactions.mobileEscape.servicesHidden
    || interactions.mobileEscape.servicesGlyph !== "+"
    || interactions.faq.openCount !== 1
    || interactions.faq.openIndex !== 1
    || !Number.isFinite(duration)
    || duration > 0.00001
    || Number.parseFloat(interactions.reducedMotion.terminalDuration) > 0.00001
    || interactions.reducedMotion.iterations !== "1"
    || interactions.reducedMotion.revealOpacity !== "1"
    || !interactions.ambientMotion.changed
    || !interactions.pointer.x
    || !interactions.pointer.y
    || interactions.firstFocus !== "skip-link"
    || interactions.skipTarget !== "main-content";
  failed ||= interactionFailed;

  const output = {
    generatedAt: new Date().toISOString(),
    base,
    records,
    interactions,
    totals: {
      matrix: records.length,
      failedRecords: records.filter((record) => record.recordFailed).length,
      interactionFailed
    },
    failed
  };
  fs.writeFileSync(path.join(evidenceRoot, "browser-results.json"), JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ totals: output.totals, interactions, failed }, null, 2));

    process.exitCode = failed ? 1 : 0;
  } finally {
    if (browser) await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
