import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ContactPage from "./ContactPage";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/i18n";
import { api } from "@/lib/api";

// gsap ships ESM that CRA's Jest does not transform, and scroll animation has
// no meaning in jsdom. Stub it so the form itself is what gets exercised.
jest.mock("gsap", () => ({
  __esModule: true,
  default: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
    utils: { toArray: () => [] },
  },
}));
jest.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));
jest.mock("@gsap/react", () => ({ useGSAP: jest.fn() }));

// Only the transport is replaced; token helpers and error formatting stay real
// so the page is exercised against the same contract it ships with.
jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  api: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { response: { use: jest.fn(), eject: jest.fn() } },
  },
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const { toast } = require("sonner");

function fillBrief({ message } = {}) {
  fireEvent.change(screen.getByTestId("contact-name"), {
    target: { value: "Ayu Pratiwi" },
  });
  fireEvent.change(screen.getByTestId("contact-company"), {
    target: { value: "  PT Contoh Industri  " },
  });
  fireEvent.change(screen.getByTestId("contact-email"), {
    target: { value: "ayu@example.com" },
  });
  fireEvent.change(screen.getByTestId("contact-phone"), {
    target: { value: "081234567890" },
  });
  fireEvent.change(screen.getByTestId("contact-need"), {
    target: { value: "Design & Prototyping" },
  });
  fireEvent.change(screen.getByTestId("contact-timeline"), {
    target: { value: "1-3 bulan" },
  });
  fireEvent.change(screen.getByTestId("contact-message"), {
    target: {
      value: message ?? "  Membutuhkan validasi desain dan prototype fungsional.  ",
    },
  });
}

function submitForm() {
  fireEvent.submit(screen.getByTestId("contact-form"));
}

// MarketingLayout scrolls to top on navigation; jsdom has no such method.
beforeAll(() => {
  window.scrollTo = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValue({ data: [] });
  api.post.mockResolvedValue({ data: { id: "inq-1", status: "new" } });
});

function renderPage() {
  render(
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <ContactPage />
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  );
}

describe("Public project intake", () => {
  test("submits each field to its own canonical Inquiry attribute", async () => {
    renderPage();
    fillBrief();
    submitForm();

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));

    expect(api.post).toHaveBeenCalledWith("/inquiries", {
      company: "PT Contoh Industri",
      pic_name: "Ayu Pratiwi",
      pic_email: "ayu@example.com",
      pic_phone: "081234567890",
      need: "Design & Prototyping",
      timeline: "1-3 bulan",
      brief: "Membutuhkan validasi desain dan prototype fungsional.",
    });
  });

  test("never flattens the brief into the legacy contact blob", async () => {
    renderPage();
    fillBrief();
    submitForm();

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));

    const [path, payload] = api.post.mock.calls[0];
    expect(path).not.toBe("/contact");
    expect(payload).not.toHaveProperty("subject");
    expect(payload).not.toHaveProperty("message");
  });

  test("holds a too-short brief at the form instead of sending a 422", async () => {
    renderPage();
    fillBrief({ message: "halo" });
    submitForm();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(api.post).not.toHaveBeenCalled();
  });

  test("surfaces a throttled submission to the visitor", async () => {
    api.post.mockRejectedValue({
      response: { status: 429, data: { detail: "Terlalu banyak permintaan." } },
    });

    renderPage();
    fillBrief();
    submitForm();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Terlalu banyak permintaan.")
    );
  });
});
