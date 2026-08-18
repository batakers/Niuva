import React from "react";
import { render, screen } from "@testing-library/react";

import { ContactForm } from "./BrandSystem";

jest.mock("gsap", () => ({
  __esModule: true,
  default: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
    utils: { toArray: () => [] },
  },
}));
jest.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { batch: jest.fn() } }));
jest.mock("@gsap/react", () => ({ useGSAP: jest.fn() }));

const form = {
  name: "",
  company: "",
  email: "",
  phone: "",
  needType: "Research & Development",
  timeline: "Belum ditentukan",
  message: "",
  consent: false,
};

test("renders translated form chrome without changing canonical option values", () => {
  render(
    <ContactForm
      form={form}
      onChange={() => jest.fn()}
      onSubmit={jest.fn()}
      needOptions={[
        "Research & Development",
        { value: "Kolaborasi lainnya", label: "Other collaboration" },
      ]}
      timelineOptions={[
        { value: "Belum ditentukan", label: "Not decided yet" },
      ]}
      errors={{ email: "Check the email format." }}
      submitLabel="Send project brief"
      copy={{
        requiredNote: "Complete every field so Niuva can review the brief.",
        errorSummary: (count) => `${count} field needs attention.`,
        required: "required",
        name: "Name",
        namePlaceholder: "Full name",
        company: "Company / Institution",
        companyPlaceholder: "Company or institution name",
        email: "Email",
        emailPlaceholder: "name@company.com",
        phone: "WhatsApp number",
        phonePlaceholder: "+62 ...",
        need: "Type of need",
        timeline: "Estimated timeline",
        message: "Additional message",
        messagePlaceholder: "Describe your project need.",
        privacy: "Niuva uses this information only to respond to your request.",
      }}
    />,
  );

  expect(screen.getByLabelText(/^Name/)).toHaveAttribute("autocomplete", "name");
  expect(screen.getByLabelText(/^Company \/ Institution/)).toBeRequired();
  expect(screen.getByLabelText(/^WhatsApp number/)).toHaveAttribute(
    "autocomplete",
    "tel",
  );
  expect(screen.getByLabelText(/Saya setuju Niuva menggunakan data ini/)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Type of need/)).toHaveValue(
    "Research & Development",
  );
  expect(screen.getByRole("option", { name: "Other collaboration" })).toHaveValue(
    "Kolaborasi lainnya",
  );
  expect(screen.getByRole("option", { name: "Not decided yet" })).toHaveValue(
    "Belum ditentukan",
  );
  expect(screen.getByText("Check the email format.")).toHaveAttribute(
    "id",
    "contact-email-error",
  );
  expect(screen.getByRole("button", { name: "Send project brief" })).toBeEnabled();
  expect(
    screen.getByText("Niuva uses this information only to respond to your request."),
  ).toBeInTheDocument();
});
