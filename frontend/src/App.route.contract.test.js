import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import fs from "fs";
import path from "path";

jest.mock("@/pages/marketing/HomePage", () => () => null);

import { PublicAliasRedirect } from "./App";

const appSource = fs.readFileSync(path.resolve(__dirname, "App.js"), "utf8");

function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <output data-testid="location">
        {location.pathname}
        {location.search}
        {location.hash}
      </output>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}

function renderAlias(pathname) {
  return render(
    <MemoryRouter initialEntries={["/origin", pathname]} initialIndex={1}>
      <Routes>
        <Route
          path="/services"
          element={<PublicAliasRedirect to="/capabilities" />}
        />
        <Route
          path="/portfolio"
          element={<PublicAliasRedirect to="/projects" />}
        />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("public compatibility route redirects", () => {
  test.each([
    ["/services?utm_source=legacy#capability", "/capabilities?utm_source=legacy#capability"],
    ["/portfolio?utm_source=legacy#project", "/projects?utm_source=legacy#project"],
  ])("redirects %s to %s while preserving URL context", async (from, expected) => {
    renderAlias(from);

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(expected);
    });

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/origin");
    });
  });

  test("registers both aliases as redirects to their canonical routes", () => {
    expect(appSource).toMatch(
      /<Route\s+path="\/services"\s+element=\{<PublicAliasRedirect to="\/capabilities" \/>\}\s*\/>/,
    );
    expect(appSource).toMatch(
      /<Route\s+path="\/portfolio"\s+element=\{<PublicAliasRedirect to="\/projects" \/>\}\s*\/>/,
    );
  });
});
