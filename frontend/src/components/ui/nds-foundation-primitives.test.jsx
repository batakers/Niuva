import { fireEvent, render, screen } from "@testing-library/react";

import { Alert } from "./alert";
import { Button } from "./button";
import { FormField } from "./form-field";
import { Input } from "./input";
import { Skeleton, SkeletonGroup } from "./skeleton";

test("Button exposes a visible, disabled loading contract", () => {
  render(<Button loading>Simpan perubahan</Button>);

  const button = screen.getByRole("button", { name: "Simpan perubahan" });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(button).toHaveAttribute("data-state", "loading");
  expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
});

test("Button prevents an unavailable asChild action before child handlers run", () => {
  const onClick = jest.fn();

  render(
    <Button asChild disabled>
      <a href="/unsafe-destination" onClick={onClick}>
        Tindakan belum tersedia
      </a>
    </Button>
  );

  const link = screen.getByRole("link", { name: "Tindakan belum tersedia" });
  expect(link).toHaveAttribute("aria-disabled", "true");
  expect(link).toHaveAttribute("tabindex", "-1");
  fireEvent.click(link);
  expect(onClick).not.toHaveBeenCalled();
});

test("FormField preserves explicit input contracts and appends its error relation", () => {
  render(
    <FormField label="Email" error="Email belum valid" required>
      <Input id="account-email" aria-describedby="email-policy" />
    </FormField>
  );

  const input = screen.getByLabelText(/Email/);
  expect(input).toHaveAttribute("id", "account-email");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(input.getAttribute("aria-describedby")).toContain("email-policy");
  expect(input.getAttribute("aria-describedby")).toContain("account-email-error");
  expect(screen.getByRole("alert")).toHaveTextContent("Email belum valid");
});

test.each(["info", "success", "warning", "error"])(
  "Alert provides the %s semantic tone",
  (tone) => {
    render(<Alert tone={tone}>{tone} feedback</Alert>);
    expect(screen.getByRole("alert")).toHaveAttribute("data-tone", tone);
  }
);

test("SkeletonGroup announces loading while visual placeholders stay hidden", () => {
  render(
    <SkeletonGroup label="Memuat riwayat pesanan">
      <Skeleton variant="heading" />
      <Skeleton variant="text" />
    </SkeletonGroup>
  );

  const status = screen.getByRole("status");
  expect(status).toHaveAttribute("aria-busy", "true");
  expect(status).toHaveTextContent("Memuat riwayat pesanan");
  expect(status.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
});
