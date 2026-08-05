import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ResetPasswordState from "./ResetPasswordState";

function renderState(success) {
  return render(
    <MemoryRouter>
      <ResetPasswordState success={success} />
    </MemoryRouter>
  );
}

test("successful shared reset offers customer and admin login destinations", () => {
  renderState(true);

  expect(screen.getByRole("link", { name: "Login pelanggan" })).toHaveAttribute(
    "href",
    "/login"
  );
  expect(screen.getByRole("link", { name: "Login admin" })).toHaveAttribute(
    "href",
    "/admin/login"
  );
});
test("invalid reset state returns to the shared recovery route", () => {
  renderState(false);

  expect(screen.getByRole("link", { name: "Minta link baru" })).toHaveAttribute(
    "href",
    "/forgot-password"
  );
});
