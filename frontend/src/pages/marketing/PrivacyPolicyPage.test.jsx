import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import PrivacyPolicyPage from "./PrivacyPolicyPage";

jest.mock("../../components/brand/BrandSystem", () => ({
  BrandPage: ({ children }) => <div>{children}</div>,
  MarketingSection: ({ children }) => <section>{children}</section>,
  PageContainer: ({ children }) => <div>{children}</div>,
  PageHero: ({ eyebrow, title, body, primaryAction }) => (
    <header>
      <p>{eyebrow}</p>
      <h1>{title}</h1>
      <p>{body}</p>
      {primaryAction}
    </header>
  ),
  SectionHeader: ({ eyebrow, title, body }) => (
    <header>
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </header>
  ),
}));

jest.mock("../../components/layout/Navbar", () => ({
  Navbar: () => <nav aria-label="Primary navigation" />,
}));

jest.mock("../../components/layout/Footer", () => ({
  Footer: () => <footer />,
}));

function renderPrivacyPolicy() {
  return render(
    <MemoryRouter initialEntries={["/privacy"]}>
      <PrivacyPolicyPage />
    </MemoryRouter>,
  );
}

describe("PrivacyPolicyPage", () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
  });

  test("renders current factual privacy copy without removed internship references", () => {
    renderPrivacyPolicy();

    expect(
      screen.getByText(/Terakhir diperbarui: 30 Juli 2026\./),
    ).toBeInTheDocument();
    expect(screen.getByText("Data Akun")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Jika layanan email dikonfigurasi secara eksternal, mengirim notifikasi terkait aktivitas akun atau pesanan secara best-effort\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Data pesan, akun, dan pesanan disimpan di sistem operasional Niuva/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /kredensial akses dan refresh sesi dikirim melalui cookie fungsional HttpOnly dan tidak disimpan di localStorage; cookie CSRF yang diperlukan untuk perlindungan permintaan dapat dibaca JavaScript/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /tidak ada penyedia tertentu yang dinyatakan aktif oleh kebijakan ini/,
      ),
    ).toBeInTheDocument();

    expect(document.body).not.toHaveTextContent(/magang|internship/i);
  });

  test("sets privacy metadata without removed internship references", () => {
    renderPrivacyPolicy();

    const description = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    expect(document.title).toBe("Privacy Policy - PT Niuva Inovasi Utama");
    expect(description).toHaveAttribute(
      "content",
      "Kebijakan privasi Niuva menjelaskan data yang dikumpulkan melalui form contact dan pemesanan, serta hak pengguna terkait data tersebut.",
    );
    expect(description).not.toHaveAttribute(
      "content",
      expect.stringMatching(/magang|internship/i),
    );
    expect(canonical).toHaveAttribute(
      "href",
      expect.stringMatching(/\/privacy$/),
    );
  });
});
