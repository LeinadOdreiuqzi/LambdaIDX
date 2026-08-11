import React from "react";

/**
 * SpeculationRules component for 0ms ultra-fast navigation in Chromium browsers.
 * Declaratively instructs the browser to prefetch and prerender /p/* routes in background.
 */
export function SpeculationRules() {
  const speculationRules = {
    prefetch: [
      {
        source: "list",
        urls: ["/p/introduccion", "/p/las-ciencias-conocidas"],
      },
      {
        source: "document",
        where: {
          and: [{ href_matches: "/p/*" }],
        },
        eagerness: "moderate",
      },
    ],
    prerender: [
      {
        source: "document",
        where: {
          and: [{ href_matches: "/p/*" }],
        },
        eagerness: "conservative",
      },
    ],
  };

  return (
    <script
      id="lambdaidx-speculation-rules"
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(speculationRules) }}
    />
  );
}
