import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import CapabilitiesPage from "./CapabilitiesPage";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/i18n";
import { api } from "@/lib/api";

jest.mock("gsap", () => ({
  __esModule: true,
  default: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
    utils: { toArray: () => [] },
  },
}));
jest.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { batch: jest.fn() },
}));
jest.mock("@gsap/react", () => ({ useGSAP: jest.fn() }));

jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  HAS_CONFIGURED_BACKEND: true,
  api: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { response: { use: jest.fn(), eject: jest.fn() } },
  },
}));

beforeAll(() => {
  window.scrollTo = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockImplementation((url) => {
    if (url === "/auth/me") return Promise.reject({ response: { status: 401 } });
    if (url === "/settings") return Promise.resolve({ data: {} });
    return Promise.resolve({ data: [] });
  });
});

function renderPage() {
  render(
    <I18nProvider>
      <MemoryRouter>
        <AuthProvider>
          <CapabilitiesPage />
        </AuthProvider>
      </MemoryRouter>
    </I18nProvider>,
  );
}

test("does not mask an empty published capability set with hardcoded services", async () => {
  renderPage();

  expect(
    await screen.findByText(/belum ada kapabilitas yang dipublikasikan/i),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: /research & development/i }),
  ).not.toBeInTheDocument();
});

test("renders published capabilities in deterministic display order", async () => {
  api.get.mockImplementation((url) => {
    if (url === "/auth/me") return Promise.reject({ response: { status: 401 } });
    if (url === "/settings") return Promise.resolve({ data: {} });
    return Promise.resolve({
      data: [
        {
          slug: "support",
          fields: {
            title: "Supporting",
            body: "Body",
            output: "Output",
            targetUsers: "Teams",
            cta: "Talk",
            priority: "supporting",
            display_order: 2,
          },
        },
        {
          slug: "primary",
          fields: {
            title: "Primary",
            body: "Body",
            output: "Output",
            targetUsers: "Teams",
            cta: "Talk",
            priority: "primary",
            display_order: 1,
          },
        },
      ],
    });
  });

  renderPage();

  await waitFor(() =>
    expect(screen.getAllByRole("heading", { name: "Primary" }).length).toBeGreaterThan(0),
  );
  expect(screen.getByRole("heading", { name: "Supporting" })).toBeInTheDocument();
});
