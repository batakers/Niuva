import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import QuoteRevisionEditor from "./QuoteRevisionEditor";
import { I18nProvider } from "@/i18n";
import { api } from "@/lib/api";

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

jest.mock("./AdminLayout", () => ({
  AdminLayout: ({ children }) => <div>{children}</div>,
}));

const { toast } = require("sonner");

const QUOTE = {
  id: "quote-1",
  status: "revision_requested",
  version: 4,
  current_revision: 2,
  permitted_next_actions: ["create_revision"],
  current_version: {
    id: "ver-2",
    revision: 2,
    scope_snapshot: {
      company: "PT Contoh Industri",
      pic_name: "Ayu",
      pic_email: "ayu@example.com",
      pic_phone: "081234567890",
      need: "Prototype enclosure",
      timeline: "Q4 2026",
      brief: "Validasi desain dan prototype fungsional.",
    },
    items: [
      { description: "Desain enclosure", quantity: 2, unit_price_minor: 1500000 },
    ],
    total_minor: 3000000,
  },
};

function renderEditor() {
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={["/admin/b2b/quotes/quote-1/revision"]}>
        <Routes>
          <Route
            path="/admin/b2b/quotes/:id/revision"
            element={<QuoteRevisionEditor />}
          />
        </Routes>
      </MemoryRouter>
    </I18nProvider>
  );
}

const VARIANTS = [
  {
    variant_id: "var-1",
    product_id: "prod-1",
    product_name: "Desk Sign",
    variant_name: "Blue",
    sku: "SIGN-BLUE",
    fixed_price: 150000,
    bill_of_materials_lines: 2,
  },
];

// Routed by URL: the editor reads the quotation and the catalog, and a single
// blanket response would hand the quote back as the variant list.
function mockGet(quote = QUOTE) {
  api.get.mockImplementation((url) =>
    url.includes("quotable-variants")
      ? Promise.resolve({ data: VARIANTS })
      : Promise.resolve({ data: quote })
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGet();
  api.post.mockResolvedValue({ data: { ...QUOTE, version: 5 } });
});

describe("Quote revision editor", () => {
  test("prefills the scope and items from the current immutable version", async () => {
    renderEditor();

    await waitFor(() =>
      expect(screen.getByTestId("scope-company")).toHaveValue(
        "PT Contoh Industri"
      )
    );
    expect(screen.getByTestId("scope-need")).toHaveValue("Prototype enclosure");
    expect(screen.getByTestId("item-description-0")).toHaveValue(
      "Desain enclosure"
    );
    expect(screen.getByTestId("item-quantity-0")).toHaveValue("2");
  });

  test("totals the line items as whole rupiah", async () => {
    renderEditor();

    await waitFor(() => expect(screen.getByTestId("revision-total")).toBeInTheDocument());
    // 2 x 1.500.000, held as a zero-decimal minor unit, so no scaling applies.
    expect(screen.getByTestId("item-total-0")).toHaveTextContent("Rp 3.000.000");
    expect(screen.getByTestId("revision-total")).toHaveTextContent("Rp 3.000.000");
  });

  test("submits a new version carrying expected_version and operation_id", async () => {
    renderEditor();
    await waitFor(() => expect(screen.getByTestId("revision-reason")).toBeInTheDocument());

    fireEvent.change(screen.getByTestId("revision-reason"), {
      target: { value: "Menyesuaikan lingkup setelah diskusi" },
    });
    fireEvent.submit(screen.getByTestId("quote-revision-form"));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));

    const [path, payload] = api.post.mock.calls[0];
    expect(path).toBe("/admin/b2b/quotes/quote-1/versions");
    expect(payload.expected_version).toBe(4);
    expect(payload.operation_id).toEqual(expect.any(String));
    expect(payload.reason).toBe("Menyesuaikan lingkup setelah diskusi");
    expect(payload.total_minor).toBe(3000000);
    expect(payload.scope_snapshot.company).toBe("PT Contoh Industri");
    // Line totals are derived server-side; sending them would let an immutable
    // version disagree with its own arithmetic.
    expect(payload.items).toEqual([
      {
        description: "Desain enclosure",
        quantity: 2,
        unit_price_minor: 1500000,
        variant_id: null,
      },
    ]);
  });

  test("keeps an item-less revision explicitly unpriced rather than free", async () => {
    renderEditor();
    await waitFor(() => expect(screen.getByTestId("remove-item-0")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("remove-item-0"));
    fireEvent.change(screen.getByTestId("revision-reason"), {
      target: { value: "Menunggu penetapan harga" },
    });
    fireEvent.submit(screen.getByTestId("quote-revision-form"));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(api.post.mock.calls[0][1].total_minor).toBeNull();
  });

  test("choosing a variant seeds the line and carries it to the server", async () => {
    renderEditor();
    await waitFor(() => expect(screen.getByTestId("add-item")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("add-item"));
    fireEvent.change(screen.getByTestId("item-variant-1"), {
      target: { value: "var-1" },
    });

    // Seeded from the catalog rather than left for retyping.
    expect(screen.getByTestId("item-description-1")).toHaveValue(
      "Desk Sign · Blue"
    );
    expect(screen.getByTestId("item-price-1")).toHaveValue("150000");

    fireEvent.change(screen.getByTestId("revision-reason"), {
      target: { value: "Menambahkan item katalog" },
    });
    fireEvent.submit(screen.getByTestId("quote-revision-form"));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    const [, payload] = api.post.mock.calls[0];
    expect(payload.items[1].variant_id).toBe("var-1");
  });

  test("a seeded line stays editable", async () => {
    renderEditor();
    await waitFor(() => expect(screen.getByTestId("add-item")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("add-item"));
    fireEvent.change(screen.getByTestId("item-variant-1"), {
      target: { value: "var-1" },
    });
    // A quotation may price a line differently from the shelf.
    fireEvent.change(screen.getByTestId("item-price-1"), {
      target: { value: "175000" },
    });
    fireEvent.change(screen.getByTestId("revision-reason"), {
      target: { value: "Harga khusus pelanggan" },
    });
    fireEvent.submit(screen.getByTestId("quote-revision-form"));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(api.post.mock.calls[0][1].items[1].unit_price_minor).toBe(175000);
  });

  test("a line may carry no variant, for bespoke work", async () => {
    renderEditor();
    await waitFor(() => expect(screen.getByTestId("item-variant-0")).toBeInTheDocument());

    // The existing line has no variant and must stay submittable.
    expect(screen.getByTestId("item-variant-0")).toHaveValue("");
    fireEvent.change(screen.getByTestId("revision-reason"), {
      target: { value: "Pekerjaan khusus" },
    });
    fireEvent.submit(screen.getByTestId("quote-revision-form"));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(api.post.mock.calls[0][1].items[0].variant_id).toBeNull();
  });

  test("holds a missing reason at the form", async () => {
    renderEditor();
    await waitFor(() => expect(screen.getByTestId("revision-reason")).toBeInTheDocument());

    fireEvent.submit(screen.getByTestId("quote-revision-form"));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(api.post).not.toHaveBeenCalled();
  });

  test("refuses to open on a quote the backend would reject", async () => {
    mockGet({ ...QUOTE, status: "sent" });
    renderEditor();

    await waitFor(() =>
      expect(screen.getByTestId("operational-state-conflict")).toBeInTheDocument()
    );
    expect(screen.queryByTestId("quote-revision-form")).not.toBeInTheDocument();
  });

  test("surfaces a version conflict instead of losing the edited scope", async () => {
    api.post.mockRejectedValue({
      response: {
        status: 409,
        data: { detail: { code: "version_conflict", message: "Quote telah berubah." } },
      },
    });

    renderEditor();
    await waitFor(() => expect(screen.getByTestId("revision-reason")).toBeInTheDocument());

    fireEvent.change(screen.getByTestId("revision-reason"), {
      target: { value: "Menyesuaikan lingkup" },
    });
    fireEvent.submit(screen.getByTestId("quote-revision-form"));

    await waitFor(() =>
      expect(screen.getByTestId("operational-state-conflict")).toBeInTheDocument()
    );
    expect(screen.getByTestId("quote-revision-form")).toBeInTheDocument();
    expect(screen.getByTestId("scope-company")).toHaveValue("PT Contoh Industri");
  });
});
