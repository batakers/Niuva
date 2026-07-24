import "@testing-library/jest-dom";

// react-router v7 references the platform TextEncoder/TextDecoder globals,
// which the jsdom test environment bundled with react-scripts 5 does not
// expose by default. Polyfill from Node's util module for component tests.
if (typeof globalThis.TextEncoder === "undefined") {
  // eslint-disable-next-line global-require
  const { TextEncoder, TextDecoder } = require("util");
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}
