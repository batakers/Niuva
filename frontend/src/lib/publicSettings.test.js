import {
  projectPublicContact,
  sanitizePublicContact,
} from "./publicSettings";

test("projects only the public profile contact fields and derives WhatsApp URL", () => {
  expect(
    projectPublicContact({
      address: "Bandung",
      email: "hello@example.com",
      phone: "+62 22 123",
      whatsapp: "+62 812-3456-7890",
      maps_url: "https://maps.example/location",
      bank_name: "must not leak",
    }),
  ).toEqual({
    location: "Bandung",
    email: "hello@example.com",
    phone: "+62 22 123",
    whatsapp: "+62 812-3456-7890",
    whatsappHref: "https://wa.me/6281234567890",
    mapsHref: "https://maps.example/location",
  });
});

test("removes unsafe links from legacy CMS contact data", () => {
  expect(
    sanitizePublicContact({
      location: "Bandung",
      email: "hello@example.com",
      whatsapp: "0812",
      whatsappHref: "javascript:alert(1)",
      mapsHref: "https://user:secret@example.com/location",
    }),
  ).toEqual({
    location: "Bandung",
    email: "hello@example.com",
    phone: "",
    whatsapp: "0812",
    whatsappHref: "",
    mapsHref: "",
  });
});

test("removes invalid legacy email values before building mail links", () => {
  expect(
    sanitizePublicContact({
      email: "javascript:alert(1)",
    }).email,
  ).toBe("");
});
