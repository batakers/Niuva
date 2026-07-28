import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DevelopmentMediaUpload } from "./DevelopmentMediaUpload";
import { I18nProvider } from "@/i18n";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
  formatApiError: jest.fn(() => "Upload gagal"),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

function renderUpload(props = {}) {
  return render(
    <I18nProvider>
      <DevelopmentMediaUpload {...props} />
    </I18nProvider>,
  );
}

test("does not expose upload controls when the local capability is inactive", async () => {
  api.get.mockResolvedValue({
    data: { local_upload: "inactive", production_upload: "inactive" },
  });

  renderUpload();

  expect(
    await screen.findByText(/upload production belum aktif/i),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /upload media lokal/i }),
  ).not.toBeInTheDocument();
});

test("uploads through the development-only media API and returns the reference", async () => {
  const uploaded = {
    id: "file-123",
    reference: "media:file-123",
    original_filename: "cover.png",
  };
  const onUploaded = jest.fn();
  api.get.mockResolvedValue({
    data: { local_upload: "active", production_upload: "inactive" },
  });
  api.post.mockResolvedValue({ data: uploaded });

  renderUpload({ onUploaded });
  const input = await screen.findByLabelText(/upload lokal/i);
  const file = new File(["image"], "cover.png", { type: "image/png" });
  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      "/admin/media",
      expect.any(FormData),
    ),
  );
  expect(onUploaded).toHaveBeenCalledWith(uploaded);
});
