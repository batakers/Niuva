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
import { PUBLIC_ROUTE_ALIASES } from "@/lib/publicRoutes";

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
        {Object.entries(PUBLIC_ROUTE_ALIASES).map(([from, to]) => (
          <Route
            key={from}
            path={from}
            element={<PublicAliasRedirect to={to} />}
          />
        ))}
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("public compatibility route redirects", () => {
  test.each([
    ["/about?utm_source=legacy#company", "/tentang?utm_source=legacy#company"],
    ["/services?utm_source=legacy#capability", "/layanan?utm_source=legacy#capability"],
    ["/portfolio?utm_source=legacy#project", "/proyek?utm_source=legacy#project"],
    ["/contact?utm_source=legacy#brief", "/kontak?utm_source=legacy#brief"],
    ["/en/capabilities?utm_source=legacy#service", "/en/services?utm_source=legacy#service"],
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

  test("registers the centralized compatibility map instead of duplicating aliases", () => {
    expect(appSource).toContain(
      "Object.entries(PUBLIC_ROUTE_ALIASES).map(([from, to]) => (",
    );
    expect(appSource).not.toMatch(/path="\/(?:about|capabilities|services|projects|portfolio|contact|privacy)"/);
  });
});
