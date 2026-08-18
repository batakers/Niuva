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
  // Forces the settings/content hooks down their real fetch path regardless
  // of whether a local .env sets REACT_APP_BACKEND_URL, so this suite's
  // behavior does not depend on an untracked, developer-local file.
  HAS_CONFIGURED_BACKEND: true,
  api: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { response: { use: jest.fn(), eject: jest.fn() } },
  },
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("@/context/AuthContext", () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => ({ user: null, logout: jest.fn() }),
}));

const { toast } = require("sonner");

function fillBrief({ message, consent = true } = {}) {
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
  if (consent) {
    fireEvent.click(screen.getByTestId("contact-consent"));
  }
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
  window.history.replaceState({}, "", "/");
  window.localStorage.clear();
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
      consent: true,
    });
  });

  test("shows a focused acknowledgement with the inquiry reference after submission", async () => {
    renderPage();
    fillBrief();
    submitForm();

    const acknowledgement = await screen.findByRole("status", {
      name: /brief Anda sudah diterima/i,
    });

    expect(acknowledgement).toHaveTextContent("Nomor referensi inquiry");
    expect(acknowledgement).toHaveTextContent("Inquiry Anda sudah tersimpan");
    expect(acknowledgement).toHaveTextContent("inq-1");
    expect(screen.queryByTestId("contact-form")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(acknowledgement);
  });

  test("restores the form and focus when the visitor starts another brief", async () => {
    renderPage();
    fillBrief();
    submitForm();

    await screen.findByTestId("contact-success");
    fireEvent.click(screen.getByTestId("contact-new-submission"));

    await waitFor(() => expect(screen.getByTestId("contact-form")).toBeInTheDocument());
    expect(document.activeElement).toBe(screen.getByTestId("contact-name"));
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

  test("holds an unconsented brief at the checkbox instead of sending it", async () => {
    renderPage();
    fillBrief({ consent: false });
    submitForm();

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(api.post).not.toHaveBeenCalled();
  });

  test("sends the granted consent with the inquiry", async () => {
    renderPage();
    fillBrief();
    submitForm();

    await waitFor(() => expect(api.post).toHaveBeenCalled());
    const [, payload] = api.post.mock.calls[0];
    expect(payload.consent).toBe(true);
  });

  test("does not create a duplicate Inquiry while the first request is pending", async () => {
    let resolvePost;
    api.post.mockReturnValue(
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
    );

    renderPage();
    fillBrief();
    submitForm();
    submitForm();

    expect(api.post).toHaveBeenCalledTimes(1);
    resolvePost({ data: { id: "inq-pending" } });
    await screen.findByTestId("contact-success");
  });

  test("keeps a dependency failure on screen instead of in a toast", async () => {
    api.post.mockRejectedValue({
      response: { status: 429, data: { detail: "Terlalu banyak permintaan." } },
    });

    renderPage();
    fillBrief();
    submitForm();

    const failure = await screen.findByTestId("contact-dependency-error");
    expect(failure).toHaveTextContent("Terlalu banyak permintaan.");
    // The brief is intact, so the form must not be cleared or blamed.
    expect(screen.getByTestId("contact-message")).toHaveValue(
      "  Membutuhkan validasi desain dan prototype fungsional.  "
    );
    expect(screen.queryByTestId("contact-success")).not.toBeInTheDocument();
  });

  test("keeps dependency-error framing localized in English", async () => {
    window.history.replaceState({}, "", "/en/contact");
    api.post.mockRejectedValue({
      response: { status: 503, data: { detail: "Service unavailable." } },
    });

    renderPage();
    fillBrief();
    submitForm();

    const failure = await screen.findByTestId("contact-dependency-error");
    expect(failure).toHaveTextContent("We could not store your brief right now.");
    expect(failure).toHaveTextContent("Select Send project brief once more to try again.");
    expect(failure).not.toHaveTextContent("Brief belum tersimpan");
  });

  test("moves focus to the dependency failure so it cannot be missed", async () => {
    api.post.mockRejectedValue({
      response: { status: 500, data: { detail: "Layanan sedang bermasalah." } },
    });

    renderPage();
    fillBrief();
    submitForm();

    const failure = await screen.findByTestId("contact-dependency-error");
    await waitFor(() => expect(failure).toHaveFocus());
  });

  test("offers the WhatsApp continuation only after the brief is stored", async () => {
    // Published settings own the WhatsApp destination, so the continuation can
    // only be asserted when one is actually configured.
    api.get.mockImplementation((url) =>
      url === "/settings"
        ? Promise.resolve({ data: { whatsapp: "0851-1767-8901" } })
        : Promise.resolve({ data: [] })
    );

    renderPage();
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(screen.queryByTestId("contact-success-whatsapp")).not.toBeInTheDocument();

    fillBrief();
    submitForm();

    await screen.findByTestId("contact-success");
    expect(screen.getByTestId("contact-success-whatsapp")).toBeInTheDocument();
  });

  test("renders mandatory Contact form, error, and CTA copy in English", () => {
    window.history.replaceState({}, "", "/en/contact");
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Start a project discussion with a useful brief." }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/)).toBeRequired();
    expect(screen.getByLabelText(/^Company \/ Institution/)).toBeRequired();
    expect(screen.getByLabelText(/^WhatsApp number/)).toBeRequired();
    expect(screen.getByLabelText(/I agree that Niuva may use this data/)).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Other collaboration" })).toHaveValue(
      "Kolaborasi lainnya",
    );
    expect(screen.getByRole("button", { name: "Send project brief" })).toBeEnabled();
    expect(screen.queryByText("Kirim brief project")).not.toBeInTheDocument();
  });

  test("localizes the consent validation message in English", async () => {
    window.history.replaceState({}, "", "/en/contact");
    renderPage();
    fillBrief({ consent: false });
    submitForm();

    await waitFor(() => expect(screen.getByText("Accept the data-use consent before sending your brief.")).toBeInTheDocument());
    expect(screen.getByText("Accept the data-use consent before sending your brief.")).toHaveAttribute(
      "id",
      "contact-consent-error",
    );
  });
});
