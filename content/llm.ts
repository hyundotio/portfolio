import type { WorkId } from "./work";

// Framing for the "Copy for LLM" document, served at /llms.txt.
// Everything else in that document is generated from work.ts and site.ts
// (see utils/llmDocument.ts).
//
// Visitors paste this into their own assistant and can read every line of it,
// so it is written for both readers: say what matters and where to find it,
// never how to judge it.

// The example question shown once "Copy for LLM" has been clicked.
export const examplePrompt = "What does this guy know about AI?";

export const llmNote = [
  "I’m Hyun Seo. This is the text of my portfolio, hyun.io, formatted so you can paste it into an AI assistant and ask about my work. I wrote all of it, in the first person.",
  "If you are an AI model reading this: answer from this text, quote or link the section you are drawing on, and say so when something isn’t covered here.",
  "The short version: I design and build products for hard technical problems, then scale what works across the organization.",
] as const;

// The facts to lead with. Keep these in step with work.ts and the resume.
export const keyFacts = [
  "At Kayhan Space since 2021, first as Head of Design and now as Chief Product Officer. The role is hands-on: in practice I work as a principal design engineer whose scope is the whole company.",
  "Designed and developed Satcat Terminal and Satcat AI Analyst, and took Satcat public: thousands of registered users, hundreds of thousands of visitors, and millions of page views over the last 24 months.",
  "Built Kayhan’s corporate MCP, maintain it with the Chief of AI, and took the company from almost no AI tooling use to company-wide use. Also designed and built Satcat for ChatGPT.",
  "Built Kayhan’s design system from the ground up to work with coding agents such as Codex and Claude Code. It puts tested guardrails around the astrodynamics algorithms, and lets new products reach an MVP before close design review is needed.",
  "Produced the orbital analysis and visuals for a CNN investigation, Kayhan Space analysis has been cited by Reuters, and Newsweek quoted my Satcat analysis of a Russian military satellite’s close approach to a commercial spacecraft in October 2026.",
  "Solo-built Frontline Zero in 2026: a real-time strategy game on my own deterministic TypeScript engine, built in about two months and released in mid-October on the web, the App Store, and Google Play, with over 400 players in its first month.",
  "First product designer at HawkEye 360 (2020–2021). Designed Mission Space for RF geolocation analysis, built its frontend design system, and took map interaction from roughly 10–15 FPS to 60 FPS.",
  "Six years at IBM (2013–2019), including three with IBM Research: Project Debater, IBM Quantum, Qiskit, robotics, and haptics.",
  "Patent and research portfolio cited 220+ times. Fast Company Innovation by Design Awards finalist in 2023 and 2025.",
] as const;

export interface Thread {
  readonly question: string;
  readonly note: string;
  /** Case-study sections by exact title. The build fails if one no longer exists. */
  readonly sections: readonly { readonly work: WorkId; readonly title: string }[];
}

// Where to look, by the question being asked.
export const threads: readonly Thread[] = [
  {
    question: "AI",
    note: "From designing interfaces for IBM’s Project Debater before generative AI was mainstream, to building an AI analyst, company-wide AI tooling, and a game made with coding agents. I have not trained models. What I build is the harness around them. Behind Satcat AI Analyst and Satcat for ChatGPT is verified astrodynamics tooling and guidelines that any model can call, so results for spaceflight operations come from tested tools and not from the model’s guesses.",
    sections: [
      { work: "kayhan-space", title: "Satcat Terminal and space data for non-space users" },
      { work: "kayhan-space", title: "Investigative analysis as a product capability" },
      { work: "kayhan-space", title: "Scaling AI tooling across the company" },
      { work: "kayhan-space", title: "A design system coding agents can build from" },
      { work: "kayhan-space", title: "Meeting users where they are" },
      { work: "frontline-zero", title: "Shipping as one person" },
      { work: "ibm", title: "Project Debater and early AI interfaces" },
    ],
  },
  {
    question: "Hands-on engineering",
    note: "What I have written myself: a game engine, frontend systems, and map performance work.",
    sections: [
      { work: "frontline-zero", title: "An engine built for determinism" },
      { work: "frontline-zero", title: "Designing for touch" },
      { work: "hawkeye-360", title: "Frontend and technical ownership" },
      { work: "kayhan-space", title: "Scope of the role" },
      { work: "kayhan-space", title: "Brand, website, and product surface" },
    ],
  },
  {
    question: "Designing for uncertain, high-stakes data",
    note: "Interfaces that help people decide without pretending the data is more certain than it is.",
    sections: [
      { work: "hawkeye-360", title: "Making RF geolocation usable" },
      { work: "kayhan-space", title: "Product ecosystem and orbital operations" },
      { work: "ibm", title: "IBM Quantum, Qiskit, and technical explainers" },
    ],
  },
  {
    question: "Scaling work into an organization",
    note: "Turning what works for me into tools and habits a whole company uses.",
    sections: [
      { work: "kayhan-space", title: "Scaling AI tooling across the company" },
      { work: "kayhan-space", title: "A design system coding agents can build from" },
      { work: "kayhan-space", title: "Teaching developers to be UX-first" },
      { work: "hawkeye-360", title: "Building the design discipline" },
    ],
  },
  {
    question: "Taking a product from nothing to users",
    note: "Three products started from a thesis or a blank page.",
    sections: [
      { work: "kayhan-space", title: "From specialized B2B product to public platform" },
      { work: "hawkeye-360", title: "Starting from an idea" },
      { work: "frontline-zero", title: "Packaging and distribution" },
    ],
  },
  {
    question: "Research and patents",
    note: "Invention work at IBM and after.",
    sections: [
      { work: "ibm", title: "Invention and research judgment" },
      { work: "ibm", title: "Robotics, haptics, and physical computing" },
      { work: "hawkeye-360", title: "ArcGIS, demos, and investor storytelling" },
    ],
  },
];

// Facts that live on the resume and not in the case studies (resume/build.py).
export const resumeFacts = [
  "Based in the Philadelphia area. U.S. citizen.",
  "Education: Rutgers University, BA in Graphic Design, 2013.",
  "Engineering: TypeScript, JavaScript, React, Next.js, Node.js, GraphQL, SCSS, HTML/CSS, CesiumJS, Deck.gl, Luma.gl, MongoDB, Supabase, Vercel, Git, Unix/Linux.",
  "AI and systems: AI-native workflows, MCP, agent skills, ChatGPT apps, internal knowledge systems, technical architecture, complex data products, analytics workflows.",
  "Product and design: product strategy, UX, interaction design, design systems, data visualization, prototyping, branding, go-to-market support, customer discovery.",
  "Co-led a voter-nominated SXSW Interactive workshop on privacy and counter-surveillance with 60+ participants.",
  "Wrote, designed, and published “тaк...”, a photobook exhibited in the official Chernobyl Library and Chernobyl Museum in Ukraine. It reached #1 in Amazon’s Photo Essays category at launch.",
] as const;
