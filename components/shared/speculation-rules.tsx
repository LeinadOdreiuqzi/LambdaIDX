"use client";

import { useEffect } from "react";

/**
 * SpeculationRules component for 0ms ultra-fast navigation in Chromium browsers.
 * Declaratively instructs the browser to prefetch and prerender /p/* routes in background
 * via standard DOM textContent insertion (avoiding innerHTML warnings).
 */
export function SpeculationRules() {
  useEffect(() => {
    if (
      typeof HTMLScriptElement !== "undefined" &&
      HTMLScriptElement.supports &&
      HTMLScriptElement.supports("speculationrules")
    ) {
      if (document.getElementById("lambdaidx-speculation-rules")) return;

      const script = document.createElement("script");
      script.id = "lambdaidx-speculation-rules";
      script.type = "speculationrules";
      script.textContent = JSON.stringify({
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
      });

      document.head.appendChild(script);

      return () => {
        const existing = document.getElementById("lambdaidx-speculation-rules");
        if (existing) existing.remove();
      };
    }
  }, []);

  return null;
}
