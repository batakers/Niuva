import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import FaqPage from "./FaqPage";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/i18n";
import { api } from "@/lib/api";

// gsap ships ESM that CRA's Jest does not transform, and scroll animation has
// no meaning in jsdom.
jest.mock("gsap", () => ({
  __esModule: true,
  default: { registerPlugin: jest.fn(), fromTo: jest.fn(), utils: { toArray: () => [] } },
}));
jest.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { batch: jest.fn() } }));
jest.mock("@gsap/react", () => ({ useGSAP: jest.fn() }));

// The page only reaches its loading branch when a backend is configured, so the
// flag is forced on. Only the transport is replaced: `usePublicContent` closes
// over the module-local `contentApi`, so mocking that export would not be seen
// by the hook. `unwrap` stays real, hence the `{ data }` envelope below.
jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  HAS_CONFIGURED_BACKEND: true,
  api: { get: jest.fn(), post: jest.fn(), interceptors: { response: { use: jest.fn(), eject: jest.fn() } } },
}));

beforeAll(() => {
  window.scrollTo = jest.fn();
});

beforeEach(() => jest.clearAllMocks());

function renderPage() {
  render(
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <FaqPage />
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>
  );
}

describe("FAQ content states", () => {
  test("shows a skeleton while the request is in flight, not the empty state", () => {
    api.get.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent(/memuat/i);
    expect(
      screen.queryByText(/Pertanyaan yang sering diajukan akan tampil di sini/i)
    ).not.toBeInTheDocument();
  });

  test("shows the empty state only once the request has resolved empty", async () => {
    api.get.mockResolvedValue({ data: [] });
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByText(/Pertanyaan yang sering diajukan akan tampil di sini/i)
      ).toBeInTheDocument()
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("renders published questions as headings", async () => {
    api.get.mockResolvedValue({
      data: [
        { slug: "a", fields: { question: "Berapa lama tahap riset awal?", answer: "Bergantung ruang lingkup.", sort_order: 2 } },
        { slug: "b", fields: { question: "Apakah bisa mulai dari prototipe?", answer: "Bisa, jika brief sudah jelas.", sort_order: 1 } },
      ],
    });
    renderPage();

    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2));
    // sort_order drives the sequence, not response order
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual([
      "Apakah bisa mulai dari prototipe?",
      "Berapa lama tahap riset awal?",
    ]);
  });

  test("surfaces a failed load instead of pretending there are no questions", async () => {
    api.get.mockRejectedValue(new Error("network"));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/belum bisa dimuat/i)).toBeInTheDocument()
    );
  });
});
