import { links } from "@/content/site";
import type { WorkEntry } from "@/content/work";
import { metadataBase, siteDescription, siteName } from "@/utils/metadata";

// schema.org data for search engines and AI agents, as JSON-LD.

const base = metadataBase.toString().replace(/\/$/, "");
const personId = `${base}/#person`;

export const person = {
  "@type": "Person",
  "@id": personId,
  name: "Hyun Seo",
  url: base,
  jobTitle: "Chief Product Officer",
  worksFor: {
    "@type": "Organization",
    name: "Kayhan Space",
    url: "https://kayhan.space",
  },
  description: siteDescription,
  knowsAbout: [
    "Product design",
    "Design engineering",
    "Space situational awareness",
    "RF geolocation",
    "Artificial intelligence",
    "Quantum computing",
    "Cybersecurity",
    "Geospatial data",
    "Game development",
  ],
  sameAs: [links.linkedin, links.github, links.scholar],
};

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: siteName,
        description: siteDescription,
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${base}/#profile`,
        url: base,
        name: siteName,
        mainEntity: { "@id": personId },
        isPartOf: { "@id": `${base}/#website` },
      },
    ],
  };
}

export function workJsonLd(work: WorkEntry) {
  const url = `${base}/work/${work.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        headline: work.heading,
        description: work.detailMetaDescription,
        image: `${url}/opengraph-image`,
        inLanguage: "en",
        author: { "@type": "Person", "@id": personId, name: "Hyun Seo", url: base },
        about: { "@type": "Organization", name: work.company },
        isPartOf: { "@type": "WebSite", "@id": `${base}/#website`, url: base },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Work", item: `${base}/#work` },
          { "@type": "ListItem", position: 2, name: work.company, item: url },
        ],
      },
    ],
  };
}

/** Serialize for a <script type="application/ld+json">, safe inside HTML. */
export function jsonLdHtml(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
