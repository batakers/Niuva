import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { api } from "../../lib/api";
import ProjectsPage, { parsePortfolioResponse } from "./ProjectsPage";

jest.mock("@/components/layout/Layout", () => ({
  MarketingLayout: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../components/brand/CompanyProfileBlocks", () => ({
  BrandButton: ({ children }) => <button type="button">{children}</button>,
  ProjectCaseStudyCard: ({ project }) => <article>{project.title}</article>,
  profileContent: {
    projects: [
      { id: "fallback-1", title: "Fallback one" },
      {
        id: "fallback-2",
        title: "Fallback two",
        image: "/fallback.webp",
        imageAlt: "Fallback",
        imageWidth: 100,
        imageHeight: 100,
      },
    ],
  },
}));

jest.mock("../../components/brand/BrandSystem", () => ({
  BrandPage: ({ children }) => <div>{children}</div>,
  CTASection: () => null,
  MarketingSection: ({ children }) => <section>{children}</section>,
  PageContainer: ({ children }) => <div>{children}</div>,
  PageHero: () => null,
  SectionHeader: () => null,
}));

jest.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({ children }) => <p>{children}</p>,
}));

jest.mock("@/components/ui/error-state", () => ({
  ErrorState: ({ error, onRetry }) => (
    <div role="alert">
      <p>{error}</p>
      {onRetry && <button onClick={onRetry}>Coba lagi</button>}
    </div>
  ),
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div>Memuat</div>,
}));

jest.mock("../../lib/publicSettings", () => ({
  usePublicSettings: () => ({ contact: {} }),
}));

jest.mock("../../lib/api", () => ({
  HAS_CONFIGURED_BACKEND: true,
  api: {
    get: jest.fn(),
  },
  resolveMediaUrl: (value) => value || "",
}));

afterEach(() => {
  jest.clearAllMocks();
});

test("announces the portfolio loading state while data is pending", () => {
  api.get.mockReturnValue(new Promise(() => {}));

  render(<ProjectsPage />);

  expect(screen.getByRole("status")).toHaveTextContent(
    "Memuat portfolio yang dipublikasikan."
  );
});

test("rejects non-array and partially malformed portfolio payloads", () => {
  expect(parsePortfolioResponse({ unexpected: "shape" })).toEqual({
    success: false,
    items: [],
  });
  expect(
    parsePortfolioResponse([
      { id: "valid", title_id: "Valid" },
      { id: "invalid" },
    ])
  ).toEqual({
    success: false,
    items: [],
  });
});

test("renders malformed portfolio data as recoverable invalid state", async () => {
  api.get
    .mockResolvedValueOnce({ data: { unexpected: "shape" } })
    .mockResolvedValueOnce({
      data: [{ id: "recovered", title_id: "Project tervalidasi" }],
    });

  render(<ProjectsPage />);

  expect(
    await screen.findByRole("alert", {
      name: "",
    })
  ).toHaveTextContent("Data portfolio tidak dapat diverifikasi.");
  expect(
    screen.queryByText("Belum ada project yang dipublikasikan.")
  ).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));

  await waitFor(() => {
    expect(screen.getByText("Project tervalidasi")).toBeInTheDocument();
  });
});
