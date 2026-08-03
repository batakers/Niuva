import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { api } from "@/lib/api";
import { UserSelector } from "./UserSelector";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
  },
  formatApiError: () => "Direktori pengguna tidak tersedia.",
}));

const users = [
  { id: "customer-1", name: "Ayu", email: "ayu@example.com" },
  { id: "customer-2", name: "Bima", email: "bima@example.com" },
];

beforeEach(() => {
  api.get.mockResolvedValue({ data: users });
});

afterEach(() => {
  jest.clearAllMocks();
});

async function renderReady(props = {}) {
  const onChange = props.onChange || jest.fn();
  render(<UserSelector value="" onChange={onChange} {...props} />);
  const combobox = await screen.findByRole("combobox");
  await waitFor(() => expect(combobox).toBeEnabled());
  return { combobox, onChange };
}

test("supports deterministic keyboard navigation and restores trigger focus", async () => {
  const { combobox, onChange } = await renderReady();

  fireEvent.keyDown(combobox, { key: "ArrowDown" });

  const search = await screen.findByRole("textbox", { name: "Cari pengguna" });
  await waitFor(() => expect(search).toHaveFocus());
  expect(combobox).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("listbox", { name: "Daftar pengguna" })).toBeInTheDocument();
  expect(screen.getAllByRole("option")).toHaveLength(2);

  fireEvent.keyDown(search, { key: "End" });
  expect(search.getAttribute("aria-activedescendant")).toContain("customer-2");
  fireEvent.keyDown(search, { key: "Enter" });

  expect(onChange).toHaveBeenCalledWith("customer-2", users[1]);
  await waitFor(() => expect(combobox).toHaveFocus());
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

test("filters options and closes with Escape without changing selection", async () => {
  const { combobox, onChange } = await renderReady();

  fireEvent.click(combobox);
  const search = await screen.findByRole("textbox", { name: "Cari pengguna" });
  fireEvent.change(search, { target: { value: "Bima" } });

  expect(screen.getAllByRole("option")).toHaveLength(1);
  expect(screen.getByRole("option")).toHaveTextContent("Bima");

  fireEvent.keyDown(search, { key: "Escape" });
  expect(onChange).not.toHaveBeenCalled();
  await waitFor(() => expect(combobox).toHaveFocus());
});

test("keeps the clear action outside the combobox with a 44px target", async () => {
  const onChange = jest.fn();
  render(
    <UserSelector
      value="customer-1"
      onChange={onChange}
    />
  );

  const combobox = await screen.findByRole("combobox");
  await waitFor(() => expect(combobox).toHaveTextContent("Ayu"));
  const clear = screen.getByRole("button", { name: "Hapus pilihan" });

  expect(combobox).not.toContainElement(clear);
  expect(clear).toHaveClass("h-11", "w-11");

  fireEvent.click(clear);
  expect(onChange).toHaveBeenCalledWith("", null);
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
});

test("announces directory failures when the popup is opened", async () => {
  api.get.mockRejectedValueOnce({ response: { data: { detail: "offline" } } });
  const { combobox } = await renderReady();

  fireEvent.click(combobox);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Direktori pengguna tidak tersedia."
  );
});
