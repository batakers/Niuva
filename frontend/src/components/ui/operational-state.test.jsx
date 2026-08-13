import { render, screen } from "@testing-library/react";
import { OperationalState } from "./operational-state";

test.each([
  "loading",
  "empty",
  "no-match",
  "error",
  "conflict",
  "stale",
  "expired",
  "unavailable",
  "uncertain",
  "success",
])(
  "announces the %s operational state",
  (state) => {
    render(<OperationalState state={state} title={`${state} title`} />);

    expect(screen.getByText(`${state} title`)).toBeInTheDocument();
    expect(screen.getByTestId(`operational-state-${state}`)).toHaveAttribute(
      "aria-live",
      state === "error" || state === "conflict" || state === "uncertain"
        ? "assertive"
        : "polite"
    );
  }
);

test("offers a retry action when recovery is available", () => {
  const onRetry = jest.fn();
  render(
    <OperationalState
      state="stale"
      title="Data berubah"
      retryLabel="Muat versi terbaru"
      onRetry={onRetry}
    />
  );

  screen.getByRole("button", { name: "Muat versi terbaru" }).click();
  expect(onRetry).toHaveBeenCalledTimes(1);
});
