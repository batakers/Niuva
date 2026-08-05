import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { AuthCard, AuthShell } from "./AuthShell";

function renderShell(audience) {
  return render(
    <MemoryRouter>
      <AuthShell audience={audience}>
        <AuthCard title="Test form">Form content</AuthCard>
      </AuthShell>
    </MemoryRouter>
  );
}

test("customer access uses customer language without internal access copy", () => {
  renderShell("customer");

  expect(screen.getByText("Pesanan Anda, dalam satu tempat.")).toBeInTheDocument();
  expect(screen.queryByText(/ruang kerja operasional/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/akses internal/i)).not.toBeInTheDocument();
});
test("staff access remains clearly scoped to Admin Studio", () => {
  renderShell("staff");

  expect(screen.getByText("Ruang kerja operasional Niuva.")).toBeInTheDocument();
  expect(screen.getByText(/akses internal mengikuti peran/i)).toBeInTheDocument();
});
test("recovery presentation is neutral across account types", () => {
  renderShell("recovery");

  expect(
    screen.getByText("Kembali ke akun Anda dengan langkah yang jelas.")
  ).toBeInTheDocument();
  expect(screen.queryByText(/portal pelanggan/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Admin Studio/i)).not.toBeInTheDocument();
});
