// 1. Define the shape of a single entry
// We add 'readonly' to the array so it accepts the "as const" data
export interface WorkEntry {
  readonly id: string;
  readonly company: string;
  readonly periodPrefix: string;
  readonly periodHighlight: string;
  readonly period: string;
  readonly heading: string;
  readonly description: string;
  readonly metaDescription: string;
  readonly highlights: readonly string[];
  readonly detailIntro: string;
  readonly detailMetaDescription: string;
  readonly detailSections: readonly WorkDetailSection[];
}

export interface WorkDetailSection {
  readonly title: string;
  readonly body: readonly string[];
  readonly mediaCards?: readonly WorkDetailMediaCard[];
  readonly tertiary?: boolean;
  readonly defaultExpanded?: boolean;
}

export interface WorkDetailMediaCard {
  readonly isVideo?: boolean;
  readonly autostart?: boolean;
  readonly loop?: boolean;
  readonly title?: string;
  readonly subtitle?: string;
  readonly subtitleLinkTitle?: string;
  readonly subtitleLink?:
    | string
    | {
        readonly text: string;
        readonly href: string;
      };
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

// 2. Your Data
export const WORK_DATA = [
  {
    id: "ibm",
    company: "IBM",
    periodPrefix: "2013/07 (Assoc. Designer, B6) to ",
    periodHighlight: "2019/12 (Sr. Designer, B9)",
    period: "’13/07-’19/12",
    heading: "Made emerging research understandable",
    description:
      "Designed interfaces, prototypes, demos, and explainers across IBM Cybersecurity, IBM Design, and IBM Research, working on Project Debater, IBM Quantum, Qiskit, robotics, haptics, and emerging interaction models.",
    metaDescription:
      "Explore Hyun Seo's IBM work translating early AI, quantum, cybersecurity, robotics, and research into usable products.",
    highlights: [
      "Designed interfaces for IBM Research’s Project Debater before generative AI became mainstream, including live debate and premier-event experiences for CES and IBM Think.",
      "Created IBM Quantum and Qiskit interface concepts, explainers, and on-site visualizations that made quantum circuits, queues, and computation easier to understand.",
      "Served on an Invention Disclosure Board and contributed to a patent and research portfolio cited 220+ times.",
    ],
    detailIntro:
      "IBM was where I learned how to make advanced technical work understandable without flattening it. Across IBM Cybersecurity, IBM Design, and IBM Research, I worked on early product experiences, research demos, technical explainers, invention disclosures, and interfaces for technologies that were often years ahead of mainstream adoption.",
    detailMetaDescription:
      "IBM case study on Project Debater, IBM Quantum, Qiskit, robotics, and making emerging research understandable.",
    detailSections: [
      {
        title: "Research-to-product translation",
        body: [
          "A lot of the work lived between research and product. The teams had powerful technical capabilities, but those capabilities needed interfaces, stories, demos, and interaction models before executives, clients, developers, or broader audiences could understand what they meant.",
          "My role was to translate that complexity into experiences that felt legible and credible. Sometimes that meant designing interfaces. Sometimes it meant building prototypes, creating explainer videos, shaping technical narratives, or helping research teams communicate how a system worked and why it mattered.",
        ],
      },
      {
        title: "Project Debater and early AI interfaces",
        body: [
          "I worked on IBM Research’s Project Debater before generative AI became mainstream, helping design user interfaces for live debate experiences and premier IBM events including CES and IBM Think.",
          "I also created system-explainer videos in collaboration with research teams, including story, assets, and animation. The goal was to make a complex NLP and argument-generation system understandable to audiences that ranged from researchers to executives to public-event attendees.",
        ],
        mediaCards: [
          {
            title: "Project Debater live interface",
            src: "/assets/work/ibm-project-debater-live-interface.webp",
            alt: "Project Debater interface designed for live debate experiences and IBM premier events.",
            width: 2048,
            height: 1152,
          },
          {
            isVideo: true,
            autostart: true,
            loop: true,
            title: "AI system explainer",
            src: "/api/blob?pathname=assets/work/ibm-project-debater-ai-explainer.mp4",
            alt: "Explainer video or storyboard showing how Project Debater processed topics, evidence, arguments, and debate structure.",
            width: 1920,
            height: 1080,
          },
          {
            title: "CES and IBM Think experience",
            src: "/assets/work/ibm-project-debater-ces-think.jpg",
            alt: "Premier event experience for Project Debater at CES or IBM Think.",
            width: 2048,
            height: 1152,
          },
        ],
      },
      {
        title: "IBM Quantum, Qiskit, and technical explainers",
        body: [
          "I worked on early IBM Quantum and Qiskit interface concepts before IBM Quantum became a broader commercial effort. That included interface explorations, educational material, and visual systems that helped explain how quantum computing worked and how people could begin using Qiskit.",
          "I also created on-site visualizations for quantum computing experiences, including visual feedback around people’s quantum circuits as they were queued and computed. The work was less about making quantum simple and more about making an unfamiliar system visible enough that people could reason about it.",
        ],
        mediaCards: [
          {
            isVideo: true,
            autostart: true,
            loop: true,
            title: "IBM Q Education UX",
            src: "/api/blob?pathname=assets/work/ibm-quantum-education-ux.mp4",
            alt: "IBM Quantum explainer visual showing quantum concepts, circuits, or computation flow.",
            width: 1920,
            height: 1080,
            subtitle: "Footage by 3rd party. Everything else by me.",
          },
          {
            isVideo: true,
            autostart: true,
            loop: true,
            title: "Qiskit getting started",
            src: "/api/blob?pathname=assets/work/ibm-qiskit-getting-started.mp4",
            alt: "Early Qiskit or IBM Quantum interface concept for programming and understanding quantum circuits.",
            width: 1920,
            height: 1080,
            subtitle: "Footage by 3rd party. Everything else by me.",
          },
          {
            title: "Quantum circuit visualization",
            src: "/assets/work/ibm-quantum-circuit-visualization.png",
            alt: "On-site IBM Quantum visualization showing queued quantum circuits and computation state.",
            width: 1600,
            height: 900,
            subtitleLink: "https://patents.google.com/patent/US10592626B1",
            subtitleLinkTitle: "View Patent no: US10592626B1",
          },
        ],
      },
      {
        title: "Robotics, haptics, and physical computing",
        body: [
          "Across IBM Research and Watson IoT experiences, I contributed to interfaces and demos involving robotics, haptics, multi-screen interaction, and physical computing. These projects explored how digital interfaces could extend into physical environments, including screen movement, tactile feedback, and spatial interaction.",
          "That work became part of a broader pattern in my career: taking systems that are technically novel, difficult to explain, or invisible to most users, and designing ways for people to see, manipulate, and understand them.",
        ],
        mediaCards: [
          {
            isVideo: true,
            autostart: true,
            loop: true,
            title: "Interfaces beyond the screen",
            src: "/api/blob?pathname=assets/work/ibm-interfaces-beyond-screen.mp4",
            alt: "IBM Research robotics and haptics experience showing physical interaction, robot arms, or multi-screen interfaces.",
            width: 1920,
            height: 1080,
            subtitleLink: "https://patents.google.com/patent/US10623724B2",
            subtitleLinkTitle: "View Patent no: US10623724B2",
          },
          {
            isVideo: true,
            autostart: true,
            loop: true,
            title: "Spatial interaction prototype",
            src: "/api/blob?pathname=assets/work/ibm-spatial-interaction-prototype.mp4",
            alt: "Physical computing prototype exploring movement, touch, spatial interaction, or multi-screen control.",
            width: 2041,
            height: 1164,
            subtitleLink: "https://patents.google.com/patent/US11029759B2",
            subtitleLinkTitle: "View Patent no: US11029759B2",
          },
        ],
      },
      {
        title: "Invention and research judgment",
        tertiary: true,
        defaultExpanded: true,
        body: [
          "This role capped six years at IBM across IBM Cybersecurity, IBM Design, and IBM Research, where my work spanned cybersecurity, HCI, AI, quantum, robotics, and emerging interfaces.",
          "I also served on an Invention Disclosure Board, helping review, shape, and prioritize technical invention submissions for legal docketing. Several of these projects contributed to a broader patent and research portfolio that has been cited 220+ times.",
        ],
        mediaCards: [
          {
            title: "Research and patent portfolio",
            src: "/assets/work/ibm-research-patent-portfolio.png",
            alt: "Google Scholar or research portfolio view showing patents, publications, and citation count.",
            width: 2496,
            height: 1292,
            subtitleLink:
              "https://scholar.google.com/citations?user=P-hCXaQAAAAJ&hl=en",
            subtitleLinkTitle: "View my Google Scholar profile",
          },
        ],
      },
      {
        title: "Why the work mattered",
        body: [
          "IBM taught me that design can be a bridge between research, product, business, and technical credibility. In emerging technology, the interface is often the first place where an idea becomes understandable enough to evaluate.",
          "That lesson has carried through the rest of my career: the most useful design work is not just visual polish. It is the act of making hard systems visible, testable, explainable, and usable enough for people to make decisions with them.",
        ],
      },
    ],
  },
  {
    id: "hawkeye-360",
    company: "HawkEye 360",
    periodPrefix: "2020/01 to 2021/11 ",
    periodHighlight: "(Principal Designer)",
    period: "’20/01-’21/11",
    heading: "Turned RF geolocation into an analyst product",
    description:
      "As the first product designer at HawkEye 360, I helped establish the company’s design discipline and led product design for Mission Space, a geospatial intelligence platform for analyzing RF emissions collected by HawkEye 360 satellites.",
    metaDescription:
      "Explore Hyun Seo's HawkEye 360 work turning satellite RF geolocation into usable geospatial intelligence products.",
    highlights: [
      "Took Mission Space from early idea to researched, prototyped, and validated product direction for maritime domain awareness, government, allied government, and commercial users.",
      "Designed the core map, timeline, iconography, shell UI, analyst workflows, and frontend design system for RF geolocation analysis.",
      "Worked hands-on across React, Redux, TypeScript, GraphQL, SCSS, Deck.gl, and Luma.gl, including map performance work that improved interaction from roughly 10-15 FPS to 60 FPS.",
    ],
    detailIntro:
      "HawkEye 360 was where I moved from designer to design-function builder. I joined as the company’s first product designer at a moment when the company had a powerful new data source and a clear question: how should people actually use it? Mission Space became the answer, turning satellite-collected RF geolocation data into an analyst-facing software experience.",
    detailMetaDescription:
      "Case study on HawkEye 360 Mission Space, RF geolocation maps, analyst workflows, and design systems.",
    detailSections: [
      {
        title: "Starting from an idea",
        body: [
          "Mission Space began as a simple but difficult premise: HawkEye 360 needed a software interface for its RF geolocation data. The company had a novel capability, but the user experience, product workflow, and design discipline still had to be created.",
          "Working with the VP of Product and engineering leadership, I helped take Mission Space from early concept into a researched and prototyped product direction. I conducted user research with maritime domain awareness users, including on-site interviews, to understand existing workflows, pain points, and how RF geolocation could fit into serious analysis.",
        ],
        mediaCards: [
          {
            isVideo: true,
            autostart: true,
            loop: true,
            title: "Mission Space Prototype",
            src: "/api/blob?pathname=assets/work/hawkeye-product-prototype.mp4",
            alt: "Video showing the initial design prototype of Mission Space.",
            width: 1920,
            height: 1080,
            subtitle: "Produced entirely by me",
          },
          {
            isVideo: true,
            autostart: true,
            loop: true,
            title: "Mission Space Product Explainer",
            src: "/api/blob?pathname=assets/work/hawkeye-rf-signals-workflow-video.mp4",
            alt: "Video showing how HawkEye 360 translated satellite-collected RF signals into analyst workflows.",
            width: 1920,
            height: 1080,
            subtitle: "Produced by Everhouse using my UI assets",
          },
        ],
      },
      {
        title: "Making RF geolocation usable",
        body: [
          "The product challenge was not just plotting dots on a map. RF geolocation data is inherently uncertain. Signals indicate presence, timing, frequency, and probability rather than absolute identity. Analysts needed ways to reason about emissions, error ellipses, spoofing indicators, time trails, and geospatial context without pretending the data was more certain than it was.",
          "I designed the core Mission Space experience, including the map interface, timeline, iconography, shell UI, signal workflows, and analyst-facing data interactions. The goal was to create a system that respected uncertainty while still helping users form hypotheses, tell stories, and make decisions.",
        ],
        mediaCards: [
          {
            title: "RF geolocation map",
            src: "/assets/work/hawkeye-rf-geolocation-map.jpg",
            alt: "Mission Space map interface for exploring satellite-collected RF geolocation data.",
            width: 2041,
            height: 1164,
          },
          {
            title: "Signal analysis workflow",
            src: "/assets/work/hawkeye-signal-analysis-workflow.png",
            alt: "Mission Space workflow for inspecting RF emissions, signal metadata, and geospatial context.",
            width: 2041,
            height: 1164,
          },
          {
            title: "Time-based patterning",
            src: "/assets/work/hawkeye-rf-timeline-patterns.jpg",
            alt: "Mission Space timeline visualization for understanding RF signal timing, trails, and recurring patterns.",
            width: 2041,
            height: 1164,
          },
          {
            title: "Uncertainty and spoofing context",
            src: "/assets/work/hawkeye-rf-uncertainty-context.png",
            alt: "Mission Space interface showing uncertainty, error ellipse context, and spoofing indicators for analyst review.",
            width: 2041,
            height: 1164,
          },
        ],
      },
      {
        title: "Building the design discipline",
        body: [
          "Before my role, HawkEye 360 did not have an established design process or design system. I led the company’s first design thinking workshops, helped define how design contributed to product and company strategy, and created methods, templates, artifacts, and review habits that gave design a durable role beyond visual polish.",
          "I managed two designers, helped hire and mentor the team, and expanded design’s role across product, internal tooling, marketing, customer demos, and investor storytelling. Design became a way to clarify the company’s value, not just a way to make finished screens look better.",
        ],
        mediaCards: [
          {
            title: "First product design system",
            src: "/assets/work/hawkeye-product-design-system.png",
            alt: "HawkEye 360 product design system showing interface components, visual language, and reusable UI patterns.",
            width: 2041,
            height: 1164,
          },
          {
            title: "Design process and workflow mapping",
            src: "/assets/work/hawkeye-design-process-map.png",
            alt: "Design process artifact showing workflow mapping, product requirements, or design thinking outputs.",
            width: 2041,
            height: 1164,
          },
        ],
      },
      {
        title: "Frontend and technical ownership",
        body: [
          "I built the initial frontend design kit in HTML, CSS, and JavaScript, which evolved into the company’s product design system. As the product became more real, I learned and worked hands-on across React, Redux, TypeScript, GraphQL, SCSS, Deck.gl, and Luma.gl.",
          "One of the technical moments I am proud of was improving map interaction performance from roughly 10-15 FPS to 60 FPS. The solution came from a UX realization: while the user was panning or zooming, the system did not need to recalculate every visual layer on every frame. Deferring expensive recalculation until movement stopped made the experience feel dramatically more usable.",
        ],
      },
      {
        title: "ArcGIS, demos, and investor storytelling",
        tertiary: true,
        defaultExpanded: true,
        body: [
          "Mission Space also influenced related product work, including an ArcGIS plugin that brought a Mission Space-like experience into tools analysts already used. That helped customers access HawkEye 360 data through familiar workflows while retaining the visual language and organization of the product.",
          "The work also became important to demos, sales enablement, investor storytelling, and internal confidence. Mission Space helped turn a complex data capability into a scenario people could understand quickly, which made the value of the data easier to communicate.",
        ],
        mediaCards: [
          {
            title: "Investor and customer storytelling",
            src: "/assets/work/hawkeye-investor-storytelling.png",
            alt: "Investor or customer demo artifact showing how Mission Space helped explain the value of RF geolocation data.",
            width: 2041,
            height: 1164,
          },
          {
            title: "Scenario-based intelligence demo",
            src: "/assets/work/hawkeye-scenario-intelligence-demo.png",
            alt: "Mission Space scenario or intelligence brief showing how RF geolocation data could be turned into a usable story.",
            width: 2041,
            height: 1164,
          },
          {
            title: "ArcGIS analyst workflow",
            src: "/assets/work/hawkeye-arcgis-analyst-workflow.png",
            alt: "ArcGIS plugin experience that brought HawkEye 360 RF geolocation data into existing analyst workflows.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://www.prnewswire.com/news-releases/hawkeye-360-introduces-hawkeye-rf-data-explorer-for-esri-arcgis-to-improve-the-accessibility-of-radio-frequency-intelligence-301222247.html",
            subtitleLinkTitle: "Read related press release",
          },
          {
            title: "Related patent work",
            src: "/assets/work/hawkeye-rf-geolocation-patent.png",
            alt: "Patent or invention artifact related to Mission Space and RF geolocation analysis workflows.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://patents.google.com/patent/US20250142289A1/en",
            subtitleLinkTitle: "View Patent no: US20250142289A1",
          },
        ],
      },
      {
        title: "Why the work mattered",
        body: [
          "HawkEye 360 proved that product design can help create a category. The company did not simply need screens; it needed a way to show what RF geolocation data meant, how analysts could use it, and why it was valuable.",
          "The richness of the company’s design culture started there. Mission Space became a foundation for product experience, design systems, demos, investor materials, and a broader understanding of what design could contribute inside a technical company.",
        ],
      },
    ],
  },
  {
    id: "kayhan-space",
    company: "Kayhan Space",
    periodPrefix: "2021/11 (Head of Design) to ",
    periodHighlight: "Current (Chief Product Officer)",
    period: "’21/11–Current",
    heading: "Helped rebuild the company around product",
    description:
      "At Kayhan Space, I grew from Head of Design into Chief Product Officer while helping transform the company from a specialized technical product into a broader product-led business with stronger UX, public reach, AI-native workflows, and commercially meaningful pull.",
    metaDescription:
      "Explore Hyun Seo's Kayhan Space work across Satcat, orbital operations UX, brand, AI workflows, and product leadership.",
    highlights: [
      "Drove Satcat from product thesis to a public platform with thousands of registered users, hundreds of thousands of visitors, and millions of page views over the last 24 months.",
      "Designed and developed major product surfaces across orbital operations, Satcat Terminal, corporate brand, website, and customer-facing workflows.",
      "Helped build a design- and user-centric culture while moving the company toward AI-native workflows across engineering, analytics, documentation, product knowledge, and enablement.",
    ],
    detailIntro:
      "Kayhan Space became the most complete test of my range so far. I did not operate inside a narrow product-design lane; I helped shape how the company built, communicated, and shipped. That included product strategy, UX, brand, technical feasibility, internal operating processes, AI-native development practices, engineering culture, and direct implementation. The result was not just a better interface, but a broader product-led company with stronger reach, clearer UX, and more commercial pull.",
    detailMetaDescription:
      "Case study on Kayhan Space product leadership across Satcat, orbital operations, Satcat Terminal, brand, and AI workflows.",
    detailSections: [
      {
        title: "Scope of the role",
        body: [
          "I joined Kayhan Space as Head of Design, but the company’s needs quickly extended beyond design. Over time, the role expanded into product direction, process design, technical feasibility work, brand, customer discovery, and executive-level company building. I ultimately grew into the Chief Product Officer role because product strategy, design quality, commercialization, and engineering velocity were tightly connected and had to be treated as one system.",
          "My work operated at multiple altitudes at once: defining product strategy with leadership, designing customer-facing experiences, shaping internal processes, helping technical teams make better product decisions, and translating ideas into code and implementation when the company needed them to become real.",
        ],
      },
      {
        title: "From specialized B2B product to public platform",
        body: [
          "One of the biggest shifts I drove was Satcat, a B2B and public-facing product direction that expanded Kayhan from a specialized customer base to a public product with thousands of registered users, hundreds of thousands of visitors, and millions of page views over the last 24 months.",
          "The thesis was that space data did not need to stay locked behind operator-only workflows. A public product could help people understand the quality of Kayhan’s product experience, expand the audience beyond a small number of satellite operators and launch providers, and create awareness, distribution, and commercial gravity around the company.",
        ],
        mediaCards: [
          {
            title: "Public platform growth",
            src: "/assets/work/kayhan-satcat-growth-dashboard.png",
            alt: "Satcat growth dashboard showing visitor and page-view growth over a 24-month period.",
            width: 1690,
            height: 1004,
          },
          {
            title: "Launch validation",
            src: "/assets/work/kayhan-satcat-launch-validation.png",
            alt: "Public launch validation for Satcat through Product Hunt ranking, community discussion, and industry mentions.",
            width: 1690,
            height: 1004,
          },
        ],
      },
      {
        title: "Product ecosystem and orbital operations",
        body: [
          "Satcat became more than a satellite catalog. It grew into a unified product ecosystem for orbital operations, including conjunction assessment, orbit determination, collision avoidance, ephemeris management, launch coordination, LEOP workflows, and space traffic coordination.",
          "The design challenge was to make high-stakes orbital workflows usable without hiding the underlying uncertainty. Conjunction assessment, for example, involves covariance, sensor uncertainty, propagation differences, operator-to-operator data quality, and risk mitigation decisions. The product needed to make recommendations clear while still showing users why those recommendations existed.",
        ],
        mediaCards: [
          {
            title: "Catalog visual view",
            src: "/assets/work/kayhan-satcat-catalog-globe.png",
            alt: "Satcat globe interface showing orbital objects, selected satellite details, filters, and visual catalog exploration.",
            width: 2041,
            height: 1164,
            subtitleLink: "https://satcat.com/globe",
            subtitleLinkTitle: "View the Satellite Catalog",
          },
          {
            title: "Space business directory",
            src: "/assets/work/kayhan-satcat-business-directory.png",
            alt: "Satcat business directory showing a company profile, operator context, key people, and satellite-related business metadata.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://www.satcat.com/businesses/f5ded31b-4a8b-46d2-918e-5177d03b829f/spacex",
            subtitleLinkTitle: "View SpaceX in Satcat",
          },
          {
            title: "Risk triage & mitigation",
            src: "/assets/work/kayhan-satcat-risk-triage.png",
            alt: "Satcat conjunction assessment interface showing collision-risk context, recommendation status, and mitigation workflow details.",
            width: 2041,
            height: 1164,
            subtitleLink: "https://satcat.com/conjunctions",
            subtitleLinkTitle: "View Conjunctions in Satcat",
          },
          {
            title: "Future planning",
            src: "/assets/work/kayhan-satcat-future-planning.png",
            alt: "Satcat planning interface showing orbital simulation, future state analysis, and configurable orbital design parameters.",
            width: 2041,
            height: 1164,
            subtitleLink: "https://satcat.com/orbit-designer",
            subtitleLinkTitle: "Try Satcat Orbit Designer",
          },
        ],
      },
      {
        title: "Satcat Terminal and space data for non-space users",
        body: [
          "I designed and developed Satcat Terminal, extending the platform beyond satellite operators by making orbital intelligence accessible to financial, insurance, media, and analyst audiences without requiring astrodynamics expertise.",
          "That product direction came from a broader thesis: the number of satellite operators and launch providers is limited, but the number of people who need to understand space activity is much larger. Investors, journalists, insurers, analysts, and enterprise decision-makers need space data made clear and actionable, not hidden behind expert-only orbital mechanics workflows.",
        ],
        mediaCards: [
          {
            title: "Global data monitoring",
            src: "/assets/work/kayhan-terminal-global-monitoring.png",
            alt: "Satcat Terminal monitoring dashboard showing global space activity signals, charts, alerts, and intelligence surfaces.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://spacenews.com/kayhan-targets-investors-insurers-with-expanded-orbital-intelligence-platform/",
            subtitleLinkTitle: "See Coverage by SpaceNews",
          },
          {
            title: "Plain-language space data queries",
            src: "/assets/work/kayhan-terminal-ai-query.png",
            alt: "Satcat Terminal AI query interface showing a plain-language question and a structured orbital intelligence response.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://payloadspace.com/kayhan-space-launches-satcat-terminal/",
            subtitleLinkTitle: "See Coverage by Payload",
          },
          {
            title: "Industry usage",
            src: "/assets/work/kayhan-reuters-orbital-analysis.png",
            alt: "Reuters article excerpt citing Kayhan Space analysis of orbital data in a geopolitical and security context.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://www.reuters.com/world/europe/russia-supplies-iran-with-cyber-support-spy-imagery-hone-attacks-ukraine-says-2026-04-07/",
            subtitleLinkTitle: "View Reuters article",
          },
          {
            title: "Orbital analytics for non-specialists",
            src: "/assets/work/kayhan-terminal-ai-analysis.png",
            alt: "Satcat Terminal AI analysis output translating orbital activity into a readable report for non-specialist users.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://www.businesswire.com/news/home/20260320098727/en/Kayhan-Space-Opens-Satellite-Intelligence-to-Investors-and-Financial-Professionals-for-the-First-Time",
            subtitleLinkTitle: "Read related press release",
          },
        ],
      },
      {
        title: "Brand, website, and product surface",
        body: [
          "I led the redesign of Kayhan’s brand, logo, website, and product experience. I designed and developed the company website using Next.js and Strapi, and worked hands-on across product strategy, UX, frontend development, data visualization, prototyping, customer discovery, technical architecture, marketing support, and executive strategy.",
          "I treated brand and product quality as strategic assets rather than surface polish. In a technical industry, coherence, clarity, and usability shape trust long before procurement or contracting begins.",
        ],
        mediaCards: [
          {
            title: "Identity system",
            src: "/assets/work/kayhan-identity-system.png",
            alt: "Kayhan Space identity system showing logo variations, international wordmarks, and business-card application.",
            width: 2041,
            height: 1164,
            subtitle: "Fun fact: Back of the business card is the logo",
          },
          {
            title: "Website redesign",
            src: "/assets/work/kayhan-website-redesign.png",
            alt: "Kayhan Space website redesign showing before-and-after visual direction and product-led homepage treatment.",
            width: 2041,
            height: 1164,
            subtitleLink: "https://kayhan.space",
          },
          {
            title: "Sales and product collateral",
            src: "/assets/work/kayhan-brand-collateral.png",
            alt: "Kayhan Space brand system applied to sales collateral, product documentation, printed material, and presentation assets.",
            width: 2041,
            height: 1164,
          },
          {
            title: "Event presence",
            src: "/assets/work/kayhan-brand-event-presence.png",
            alt: "Kayhan Space brand system applied to conference booth materials, banners, demo screens, and physical event presence.",
            width: 2041,
            height: 1164,
          },
        ],
      },
      {
        title: "AI-native operating workflows",
        tertiary: true,
        defaultExpanded: true,
        body: [
          "One of the shifts I am most proud of was helping move Kayhan toward AI-native operating workflows across engineering, analytics, internal documentation, product knowledge, and cross-functional enablement.",
          "This was not just about asking AI to write code. It meant creating expectations, systems, and shared practices around AI-assisted development, internal knowledge, non-engineering enablement, analytics, and documentation. It also meant pushing the team to test work as end users in deployed environments with real data, not simply treating a successful build as proof that a product experience worked.",
        ],
        mediaCards: [
          {
            title: "Agent skills architecture",
            src: "/assets/work/kayhan-agent-skills-architecture.png",
            alt: "Conceptual architecture for company-wide agent skills, MCP integration, internal repositories, and shared discipline practices.",
            width: 2041,
            height: 1164,
          },
          {
            title: "Workflow shift",
            src: "/assets/work/kayhan-ai-workflow-shift.png",
            alt: "Before-and-after workflow diagram showing how AI-native systems helped connect engineering, product, design, SMEs, and non-technical roles.",
            width: 2041,
            height: 1164,
          },
        ],
      },
      {
        title: "Culture and engineering ownership",
        tertiary: true,
        body: [
          "Early on, I took pride in the individual craft itself and in being close to customers, but over time the more meaningful work became helping change how the team thought about building.",
          "I pushed for a culture where engineers were not judged only by whether code shipped or builds passed. The expectation became broader: each engineer was responsible not just for implementation, but for the quality of the user experience their work created. That meant testing flows end-to-end, questioning design implications, and advocating for better product outcomes from within their own technical perspective.",
          "The goal was to make product quality a shared responsibility rather than something thrown over the wall to design. When that worked well, engineers were not just producing code against a checklist; they were acting as owners of the customer experience with the benefit of their own expertise.",
        ],
      },
      {
        title: "External recognition and market pull",
        tertiary: true,
        defaultExpanded: true,
        body: [
          "The strongest proof point was not just traffic, but market pull. Satcat became a major product and brand conduit for Kayhan, supporting customer conversations, new services, external analysis, and broader awareness across the space industry.",
          "That work contributed to external recognition as well. Pathfinder’s redesign was honored with three Finalist distinctions in Fast Company’s Innovation by Design Awards in 2023, and Satcat received recognition there in 2025. To me, that recognition mattered less as decoration and more as evidence that the company’s product and design quality had become visible beyond its immediate market.",
        ],
        mediaCards: [
          {
            title: "Design recognition",
            src: "/assets/work/kayhan-fast-company-award.jpeg",
            alt: "Fast Company Innovation by Design recognition graphic for Kayhan Space and Satcat.",
            width: 1535,
            height: 1536,
            subtitleLink:
              "https://www.fastcompany.com/91388467/ux-design-innovation-by-design-2025",
          },
          {
            title: "Market pull",
            src: "/assets/work/kayhan-market-pull-logos.png",
            alt: "Representative customer and industry logos connected to Kayhan Space product adoption and market reach.",
            width: 1920,
            height: 1640,
            subtitleLink: "https://www.satcat.com/products/operations",
          },
        ],
      },
      {
        title: "Why the work mattered",
        body: [
          "The biggest lesson from this period was that product can reshape a company’s identity when it is treated as more than interface design. At Kayhan, the combination of product direction, UX clarity, branding, technical execution, AI-enabled workflows, and market framing changed what kind of company we could be.",
          "Just as importantly, I helped push the engineering culture beyond a narrow definition of success. The strongest outcome was not only shipping better products myself, but helping create an environment where engineers increasingly owned the user experience consequences of what they built. That shift made product quality more durable than any single feature or redesign.",
        ],
      },
    ],
  },
] as const;

// 3. Derived Types
export type WorkId = (typeof WORK_DATA)[number]["id"];
export type SceneState = "home" | "easter-egg" | "contact" | "resume" | WorkId;
