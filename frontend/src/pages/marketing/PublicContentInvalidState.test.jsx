import { render, screen } from "@testing-library/react";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/components/layout/Layout", () => ({
  MarketingLayout: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../components/brand/CompanyProfileBlocks", () => ({
  BrandButton: ({ children }) => <button type="button">{children}</button>,
  ProcessTimeline: ({ items = [] }) => (
    <div>{items.map((item) => <span key={item.title}>{item.title}</span>)}</div>
  ),
  RoundedVisualFrame: ({ children }) => <div>{children}</div>,
  profileContent: {
    intro: "FALLBACK_ABOUT_INTRO",
    contact: {
      email: "fallback-contact@example.test",
      whatsapp: "FALLBACK_CONTACT_WHATSAPP",
      whatsappHref: "https://example.test/fallback-contact",
      mapsEmbed: "https://example.test/fallback-map",
    },
  },
}));

jest.mock("../../components/brand/BrandSystem", () => ({
  BrandPage: ({ children }) => <main>{children}</main>,
  ContactForm: () => null,
  ContactSummary: ({ contact }) => (
    <output data-testid="contact-summary">{contact.email}</output>
  ),
  CTASection: () => null,
  MarketingSection: ({ children }) => <section>{children}</section>,
  PageContainer: ({ children }) => <div>{children}</div>,
  PageHero: ({ visual, primaryAction, secondaryAction }) => (
    <header>
      {visual}
      {primaryAction}
      {secondaryAction}
    </header>
  ),
  SectionHeader: ({ title, body }) => (
    <div>
      {title && <h2>{title}</h2>}
      {body && <p>{body}</p>}
    </div>
  ),
}));

jest.mock("@/components/ui/error-state", () => ({
  ErrorState: ({ error }) => <p role="alert">{error}</p>,
}));

jest.mock("../../lib/api", () => ({
  api: {
    post: jest.fn(),
  },
  formatApiError: () => "Permintaan gagal.",
}));

jest.mock("../../lib/content", () => ({
  findBySlug: () => undefined,
  usePublicContent: () => ({ blocks: [], status: "invalid" }),
}));

jest.mock("../../lib/publicSettings", () => ({
  sanitizePublicContact: (contact) => contact,
  usePublicSettings: () => ({ contact: {}, status: "error" }),
}));

test("About does not render trusted-looking fallback blocks for malformed CMS data", () => {
  render(<AboutPage />);

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Konten About terbaru tidak dapat diverifikasi."
  );
  expect(screen.queryByText("FALLBACK_ABOUT_INTRO")).not.toBeInTheDocument();
  expect(
    screen.queryByText("Mitra strategis inovasi dan pengembangan produk")
  ).not.toBeInTheDocument();
});

test("Contact does not render fallback contact details for malformed CMS data", () => {
  render(<ContactPage />);

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Konten Contact terbaru tidak dapat diverifikasi."
  );
  expect(
    screen.queryByText("fallback-contact@example.test")
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText(/FALLBACK_CONTACT_WHATSAPP/)
  ).not.toBeInTheDocument();
});
