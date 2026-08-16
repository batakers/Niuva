import React from "react";
import { render, screen } from "@testing-library/react";

import { AppErrorBoundary, RouteFallback } from "./App";

function Bomb() {
  throw new Error("render exploded");
}

describe("AppErrorBoundary", () => {
  let consoleError;

  beforeEach(() => {
    // React logs the caught error to console.error on its own; the boundary
    // also does in non-production. Both are expected here, so silence the
    // noise instead of letting it fail an assertOnConsole-style CI gate.
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  test("renders children when nothing has failed", () => {
    render(
      <AppErrorBoundary>
        <p>Halaman normal</p>
      </AppErrorBoundary>
    );

    expect(screen.getByText("Halaman normal")).toBeInTheDocument();
  });

  test("never claims a connection failure for a render-phase crash", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );

    // This boundary only ever catches render-phase exceptions in this tree —
    // React never routes a network/fetch failure through componentDidCatch —
    // so the copy must not name a cause it cannot actually observe.
    expect(screen.queryByText("KONEKSI TERPUTUS")).not.toBeInTheDocument();
    expect(screen.queryByText(/koneksi anda/i)).not.toBeInTheDocument();
    expect(screen.getByText("TERJADI KESALAHAN")).toBeInTheDocument();
  });

  test("offers both reload and a way back to a known-good page", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole("button", { name: "Muat ulang halaman" })
    ).toBeInTheDocument();
    // A plain <a> is deliberate here, not a router Link: the React tree that
    // just crashed may be in a broken state, so recovery forces a full
    // reload of the app rather than a client-side transition through it.
    const home = screen.getByRole("link", { name: "Kembali ke Beranda" });
    expect(home).toHaveAttribute("href", "/");
  });

  test("announces the failure to assistive technology immediately", () => {
    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("TERJADI KESALAHAN");
  });
});

describe("RouteFallback", () => {
  test("is visible to sighted users, not just announced to screen readers", () => {
    render(<RouteFallback />);

    const status = screen.getByRole("status");
    // A background-colour div with only an sr-only label leaves a sighted
    // visitor looking at nothing while a route chunk downloads.
    expect(status.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("Memuat halaman")).toBeInTheDocument();
  });
});
