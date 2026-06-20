import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import OwnerConsole from "./OwnerConsole";

describe("OwnerConsole shell (smoke)", () => {
  it("renders non-empty markup", () => {
    const html = renderToStaticMarkup(React.createElement(OwnerConsole));
    expect(html.length).toBeGreaterThan(400);
  });
});
