import { render, screen } from "@testing-library/react";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import { I18nProvider } from "@/i18n";

jest.mock("@/components/layout/Layout", () => ({
  MarketingLayout: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../components/brand/CompanyProfileBlocks", () => ({
  BrandButton: ({ children }) => <button type="button">{children}</button>,
}));

jest.mock("../../components/brand/BrandSystem", () => ({
  BrandPage: ({ children }) => <main>{children}</main>,
  MarketingSection: ({ children }) => <section>{children}</section>,
  PageContainer: ({ children }) => <div>{children}</div>,
  PageHero: ({ body }) => <header>{body}</header>,
  SectionHeader: ({ eyebrow, title, body }) => (
    <div>
      {eyebrow && <p>{eyebrow}</p>}
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  ),
}));

jest.mock("../../lib/publicSettings", () => ({
  usePublicSettings: () => ({
    contact: {
      email: "privacy@example.com",
      whatsapp: "+62 800",
      whatsappHref: "https://example.com/contact",
    },
  }),
}));

test("renders the approved current-scope and provider-neutral privacy copy", () => {
  render(<PrivacyPolicyPage />);

  expect(screen.getByText(/Terakhir diperbarui: 30 Juli 2026/)).toBeInTheDocument();
  expect(screen.queryByText(/magang|internship/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Resend/i)).not.toBeInTheDocument();
  expect(
    screen.getAllByText(/Jika layanan email dikonfigurasi secara eksternal/i)
  ).toHaveLength(2);
  expect(
    screen.getByText(/tidak ada penyedia tertentu yang dinyatakan aktif/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /Data pesan, akun, dan pesanan disimpan di sistem operasional Niuva\./,
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/token login.*localStorage/i)
  ).not.toBeInTheDocument();
  expect(
    screen.getByText(
      /kredensial akses dan refresh sesi.*cookie fungsional HttpOnly/i
    )
  ).toBeInTheDocument();
});

test("gives both privacy contact links a 44px touch target", () => {
  render(<PrivacyPolicyPage />);

  expect(screen.getByRole("link", { name: "privacy@example.com" })).toHaveClass(
    "min-h-11"
  );
  expect(screen.getByRole("link", { name: "+62 800" })).toHaveClass("min-h-11");
});

test("renders the complete English privacy and contact copy", () => {
  window.history.replaceState({}, "", "/en/privacy");
  render(
    <I18nProvider>
      <PrivacyPolicyPage />
    </I18nProvider>,
  );

  expect(screen.getByText(/Last updated: 30 July 2026/)).toBeInTheDocument();
  expect(
    screen.getByText(/Information is used only for relevant operational needs/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/does not claim that any specific provider is active/i),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Terakhir diperbarui/i)).not.toBeInTheDocument();

  window.history.replaceState({}, "", "/");
  window.localStorage.clear();
});
