import { renderHook, waitFor } from "@testing-library/react";
import { api } from "./api";
import {
  parsePublicContentResponse,
  usePublicContent,
} from "./content";

jest.mock("./api", () => ({
  HAS_CONFIGURED_BACKEND: true,
  api: {
    get: jest.fn(),
  },
  unwrap: (promise) => promise.then((response) => response.data),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test("rejects a non-array public-content payload", () => {
  expect(parsePublicContentResponse({ unexpected: "shape" })).toEqual({
    success: false,
    blocks: [],
  });
});

test("rejects the whole public-content payload when one block is malformed", () => {
  expect(
    parsePublicContentResponse([
      { slug: "valid", fields: { title: "Valid" } },
      { fields: { title: "Missing slug" } },
    ])
  ).toEqual({
    success: false,
    blocks: [],
  });
});

test("publishes validated public-content blocks", () => {
  expect(
    parsePublicContentResponse([
      { slug: "company-profile", fields: { intro: "Validated" }, extra: true },
    ])
  ).toEqual({
    success: true,
    blocks: [
      { slug: "company-profile", fields: { intro: "Validated" }, extra: true },
    ],
  });
});

test("exposes malformed public content as invalid instead of ready-empty", async () => {
  api.get.mockResolvedValue({ data: { unexpected: "shape" } });

  const { result } = renderHook(() => usePublicContent("faq"));

  await waitFor(() => {
    expect(result.current).toEqual({ blocks: [], status: "invalid" });
  });
});
