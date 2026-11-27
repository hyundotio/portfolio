// 1. Define the shape of a single entry
// We add 'readonly' to the array so it accepts the "as const" data
export interface WorkEntry {
  readonly id: string;
  readonly company: string;
  /** The company's logo color, used for the case study's wordmark. */
  readonly accent: string;
  /** A darker take for light backgrounds, when the logo color is too pale on white. */
  readonly accentOnLight?: string;
  readonly role: string;
  readonly years: string;
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
  /** Where to see or use the work, shown in the case study's credits. */
  readonly links?: readonly { readonly label: string; readonly href: string }[];
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
const WORK_ENTRIES = [
  {
    id: "ibm",
    company: "IBM",
    accent: "#1f70c1",
    role: "Associate Designer to Senior Designer + Developer",
    years: "2013–2019",
    periodPrefix: "2013/07 (Assoc. Designer, B6) to ",
    periodHighlight: "2019/12 (Sr. Designer, B9)",
    period: "’13/07-’19/12",
    heading: "Made emerging research understandable",
    description:
      "Designed interfaces, prototypes, demos, and explainers across IBM Security, IBM Design, and IBM Research, working on Project Debater, IBM Quantum, Qiskit, robotics, haptics, and emerging interaction models.",
    metaDescription:
      "Explore Hyun Seo's IBM work translating early AI, quantum, cybersecurity, robotics, and research into usable products.",
    highlights: [
      "Designed interfaces for IBM Research’s Project Debater before generative AI became mainstream, including live debate and premier-event experiences for CES and IBM Think.",
      "Created IBM Quantum and Qiskit interface concepts, explainers, and on-site visualizations that made quantum circuits, queues, and computation easier to understand.",
      "Served on an Invention Disclosure Board and contributed to a patent and research portfolio cited 220+ times.",
    ],
    detailIntro:
      "IBM was where I learned how to make advanced technical work understandable without flattening it. Across IBM Security, IBM Design, and IBM Research, I worked on early product experiences, research demos, technical explainers, invention disclosures, and interfaces for technologies that were often years ahead of mainstream adoption.",
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
          "This role capped six years at IBM across IBM Security, IBM Design, and IBM Research, where my work spanned cybersecurity, HCI, AI, quantum, robotics, and emerging interfaces.",
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
    accent: "#e45c27",
    role: "Principal Designer",
    years: "2020–2021",
    periodPrefix: "2020/01 to 2021/11 ",
    periodHighlight: "(Principal Designer)",
    period: "’20/01-’21/11",
    heading: "Turned RF geolocation into an analyst product",
    description:
      "As the first product designer at HawkEye 360, I designed Mission Space, a geospatial intelligence platform for analyzing RF emissions collected by HawkEye 360 satellites. I also built its frontend design system, worked in the React codebase, and established the company’s design discipline.",
    metaDescription:
      "Explore Hyun Seo's HawkEye 360 work turning satellite RF geolocation into usable geospatial intelligence products.",
    highlights: [
      "Took Mission Space from early idea to researched, prototyped, and validated product direction for maritime domain awareness, government, allied government, and commercial users.",
      "Designed the core map, timeline, iconography, shell UI, analyst workflows, and frontend design system for RF geolocation analysis.",
      "Worked hands-on across React, Redux, TypeScript, GraphQL, SCSS, Deck.gl, and Luma.gl, including map performance work that improved interaction from roughly 10-15 FPS to 60 FPS.",
    ],
    detailIntro:
      "HawkEye 360 is where design and frontend engineering became one job for me. I joined as the company’s first product designer at a moment when the company had a powerful new data source and a clear question: how should people actually use it? Mission Space became the answer, turning satellite-collected RF geolocation data into an analyst-facing software experience.",
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
    accent: "#7947e5",
    role: "Head of Design to Chief Product Officer",
    years: "2021–present",
    links: [
      { label: "Satcat", href: "https://www.satcat.com" },
      {
        label: "Satcat for ChatGPT",
        href: "https://chatgpt.com/plugins/plugin_asdk_app_6af2245825cc81919b1e92c00297dc2a",
      },
    ],
    periodPrefix: "2021/11 (Head of Design) to ",
    periodHighlight: "Current (Chief Product Officer)",
    period: "’21/11–Current",
    heading: "Designed and shipped Satcat, a public platform for orbital intelligence",
    description:
      "I joined Kayhan Space as Head of Design and became Chief Product Officer, and I stayed hands-on the whole way. I designed and developed Satcat Terminal and Satcat AI Analyst, designed and helped build the orbital-operations products, and took Satcat public to thousands of registered users. I also built the company’s AI tooling and taught the whole company to use it.",
    metaDescription:
      "Explore Hyun Seo's Kayhan Space work designing and building Satcat, Satcat AI Analyst, orbital operations UX, investigative intelligence, brand, and AI workflows.",
    highlights: [
      "Designed and developed major product surfaces across orbital operations, space business analysis, and AI-assisted defense intelligence. Extended the AI Analyst through recurring work with journalists and analysts, including CNN, Reuters, and Newsweek.",
      "Drove Satcat from product thesis to a public platform with thousands of registered users, hundreds of thousands of visitors, and millions of page views over the last 24 months.",
      "Built the corporate MCP and maintain it with the Chief of AI, held town halls on how to use it, and took the company from almost no AI tooling use to company-wide use across engineering, analytics, documentation, and product knowledge.",
      "Taught developers to be user-centric and UX-first, and installed a shared design taste and a design floor across the company.",
      "Designed and built Satcat for ChatGPT, part of an ongoing effort to meet users in the high-traffic places they already are.",
    ],
    detailIntro:
      "Kayhan Space is where I have had the widest range. My title went from Head of Design to Chief Product Officer, but the job stayed hands-on: I set product direction with leadership, then did the design and a lot of the building myself. That covered UX, frontend development, data visualization, brand, and the company website. Whatever I found effective along the way, I turned into something the rest of the company could use, most of all the AI tooling everyone works with now.",
    detailMetaDescription:
      "Case study on designing and building Satcat, Satcat AI Analyst, orbital operations products, investigative intelligence, brand, and AI workflows at Kayhan Space.",
    detailSections: [
      {
        title: "Scope of the role",
        body: [
          "I joined Kayhan Space as Head of Design, but the company’s needs quickly extended beyond design. The role grew into product direction, technical feasibility work, brand, and customer discovery. I became Chief Product Officer because I didn’t just build nice things. I built things other people use, and through them the company got a shared design taste, a design floor, and user-centric methods.",
          "The title reflects scope more than headcount. I have spent far more of my time designing and building than managing. In a typical stretch I define a product direction with leadership, design the workflow, write the code, and test it in production with real data.",
          "The building is only half of it. When a tool or a way of working proves effective for me, I scale it into the organization so everyone gets better at it, which is where I have had the most leverage.",
        ],
      },
      {
        title: "From specialized B2B product to public platform",
        body: [
          "One of the biggest shifts I drove was Satcat, a B2B and public-facing product direction that expanded Kayhan from a specialized customer base to a public product with thousands of registered users, hundreds of thousands of visitors, and millions of page views over the last 24 months.",
          "The thesis was that space data did not need to stay locked behind operator-only workflows. A public product could help people understand the quality of Kayhan’s product experience, expand the audience beyond a small number of satellite operators and launch providers, and bring awareness, distribution, and customers to the company.",
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
          "I designed and developed Satcat Terminal and Satcat AI Analyst, extending the platform beyond satellite operators by making orbital intelligence accessible to financial, insurance, media, and analyst audiences without requiring astrodynamics expertise.",
          "That product direction came from a broader thesis: the number of satellite operators and launch providers is limited, but the number of people who need to understand space activity is much larger. Satcat AI Analyst already automated core orbital-investigation workflows, giving us a foundation for deeper custom analysis while creating a path to fold new methods back into the product.",
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
            title: "Satcat AI Analyst",
            src: "/assets/work/kayhan-terminal-ai-query.png",
            alt: "Satcat AI Analyst interface showing a plain-language question and a structured orbital intelligence response generated without manual analyst work.",
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
        title: "Meeting users where they are",
        body: [
          "I also designed and built Satcat for ChatGPT, an app that brings the Satcat satellite catalog into the conversation. People can find satellites, plot their orbital history, and see them on an interactive 3D globe without leaving the chat.",
          "The idea is to meet users where they are, the way DoorDash does. Funneling every visitor to our own site adds friction, so we keep building extensions and plugins in the high-traffic places people already use, and let them reach our products from there.",
        ],
      },
      {
        title: "Investigative analysis as a product capability",
        body: [
          "Beyond the product itself, a recurring part of my work at Kayhan was helping journalists and analysts make sense of time-sensitive space activity. I frequently translated orbital data into defensible answers by reconstructing historical satellite activity and evaluating data collections across orbital geometry, illumination, cloud cover, and various sensor limitations.",
          "The most visible example was a CNN investigation into whether Russian reconnaissance satellites could have supported Iranian targeting of U.S. military assets. For that collaboration, I produced detailed reports, source data, interactive web tools, 3D reconstructions, explanatory animations, and broadcast-ready graphics and After Effects assets. CNN used the analysis and visuals throughout its finished investigation, which aired across multiple programs and became part of broader national-security coverage.",
          "Satcat AI Analyst made work at this depth possible by automating much of the underlying orbital investigation. After the CNN collaboration, I folded the custom methods and new requirements back into the product, extending the system so increasingly sophisticated investigations could be repeated end to end without a human analyst manually assembling each one.",
          "The work kept coming after CNN. In October 2026, Newsweek reported on a Russian military satellite, Kosmos-2612, closing in on ICEYE-X36, a commercial radar satellite whose imagery supports Ukraine. Working from Satcat, I gave Newsweek a modeled closest approach of about 8.8 meters and a relative speed slow enough to suggest the Russian satellite was shadowing it. I also made clear that other predictions differed and the true closest distance was unconfirmed.",
        ],
        mediaCards: [
          {
            isVideo: true,
            autostart: false,
            loop: false,
            title: "CNN Investigates",
            src: "/api/blob?pathname=assets/work/kayhan-cnn-investigation.mp4",
            alt: "CNN's one-minute investigative report featuring Kayhan Space orbital analysis, 3D models, technical visualizations, and broadcast graphics.",
            width: 1920,
            height: 1080,
            subtitle:
              "CNN report featuring analysis and visual assets produced for the investigation",
          },
          {
            title: "Testing collection constraints",
            src: "/assets/work/kayhan-cnn-collection-constraints.png",
            alt: "Selected pages from a technical report provided to CNN showing satellite classifications, source data, access geometry, and collection-feasibility analysis.",
            width: 2041,
            height: 1164,
            subtitle:
              "Selected pages from the technical analysis delivered to CNN",
          },
          {
            title: "Interactive web analysis",
            src: "/assets/work/kayhan-cnn-interactive-analysis.png",
            alt: "Browser-based analysis delivered to CNN showing requested dates, weather and cloud constraints, viewing geometry, and candidate satellite passes.",
            width: 2041,
            height: 1164,
            subtitle:
              "Purpose-built web analysis for exploring evidence and constraints",
          },
          {
            title: "CNN credit and public record",
            src: "/assets/work/kayhan-cnn-transcript-credit.png",
            alt: "CNN transcript excerpt crediting Kayhan Space for helping assess the orbital data and provide imagery, alongside CNN's report that Moscow called the allegation fake news.",
            width: 2041,
            height: 1164,
            subtitleLink:
              "https://transcripts.cnn.com/show/ctw/date/2026-09-16/segment/02",
            subtitleLinkTitle: "Read the CNN transcript",
          },
        ],
      },
      {
        title: "Brand, website, and product surface",
        body: [
          "I led the redesign of Kayhan’s brand, logo, website, and product experience, and I designed and developed the company website myself using Next.js and Strapi.",
          "I treated brand and product quality as part of the product. In a technical industry, coherence, clarity, and usability shape trust long before procurement or contracting begins.",
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
        title: "Scaling AI tooling across the company",
        tertiary: true,
        defaultExpanded: true,
        body: [
          "One of the shifts I am most proud of is moving Kayhan to AI-native workflows across engineering, analytics, internal documentation, product knowledge, and cross-functional enablement. Before, very few people at the company used AI tooling, and those who did were not getting much out of it.",
          "I built the corporate MCP and maintain it with our Chief of AI, and I held town halls to show the whole company how to use it. That is how I like to work in general: find what is effective in my own building, turn it into a tool or a practice, and teach it until everyone is better for it.",
          "Around the tooling I set expectations and shared practices for AI-assisted development, internal knowledge, non-engineering enablement, analytics, and documentation. I also pushed the team to test work as end users in deployed environments with real data. A successful build is not proof that a product experience works.",
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
        title: "Teaching developers to be UX-first",
        tertiary: true,
        body: [
          "One of my proudest achievements at Kayhan is teaching developers to be user-centric and UX-first. I care about the craft and about being close to customers, and I wanted the whole team to work that way. The aim was institutional design taste and a design floor: quality that holds whether or not I touched the work.",
          "I pushed for a culture where shipping code and passing builds were the start of the job. Each engineer was responsible for the quality of the user experience their work created. That meant testing flows end-to-end, questioning design implications, and advocating for better product outcomes from within their own technical perspective.",
          "The goal was to make product quality a shared responsibility instead of something thrown over the wall to design. When that worked well, engineers acted as owners of the customer experience with the benefit of their own expertise.",
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
          "What I take from Kayhan is that the fastest way to change what a company can be is to build the thing. Satcat started as a thesis. Because I could design it, build it, and put it in front of people, it became a public platform, an AI analyst, and analysis that CNN and Reuters used in their reporting.",
          "The part I value most is what spread. Developers became user-centric and UX-first, the company got a design floor, and the AI tooling I built became how everyone works. That made the quality more durable than any single feature or redesign.",
        ],
      },
    ],
  },
  {
    id: "frontline-zero",
    company: "Frontline Zero",
    accent: "#ffb23e",
    accentOnLight: "#c48930",
    role: "Solo developer, 556 Games",
    years: "2026–present",
    links: [
      { label: "Website", href: "https://frontlinezero.com" },
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/frontline-zero/id6824570571",
      },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.games556.frontlinezero",
      },
    ],
    periodPrefix: "2026/10 to ",
    periodHighlight: "Current (Solo developer, 556 Games)",
    period: "’26/10–Current",
    heading: "Built an engine and shipped a strategy game to every screen",
    description:
      "Frontline Zero is an isometric real-time strategy game set in the Russia–Ukraine war, where drones, jammers, and air defense decide every fight. I designed and built it end to end, from my own browser engine to the store pages, and shipped it on the web, the App Store, and Google Play with cross-play online battles. It reached over 400 players in its first month.",
    metaDescription:
      "Explore Hyun Seo's Frontline Zero, an isometric real-time strategy game built on a custom deterministic engine and shipped across web, iOS, and Android.",
    highlights: [
      "Designed and built Frontline Zero end to end: game design, art direction, interface, engine, online infrastructure, and store releases, from first commit to three platforms in about two months.",
      "Reached over 400 players in the first month after release, across the web, the App Store, and Google Play.",
      "Wrote webrts, a dependency-free TypeScript RTS engine with a deterministic simulation that makes lockstep cross-play possible between browsers, phones, tablets, and computers.",
      "Designed touch controls from scratch so a dense strategy interface works on a phone, and cut decoded sprite memory from 1.1 GB to about 330 MB so the game runs on low-end devices.",
    ],
    detailIntro:
      "Frontline Zero is my own studio project under 556 Games: a classic isometric real-time strategy game of modern war, Ukraine against Russia. I designed and built it end to end, from the engine underneath it to the store listings on top, and released it on the web, on iPhone, iPad, and Mac, and on Android in about two months. It went public in mid-October 2026, and in its first month it reached over 400 players.",
    detailMetaDescription:
      "Case study on Frontline Zero: game design, a deterministic TypeScript RTS engine, lockstep cross-play, touch controls, and shipping across platforms as one person.",
    detailSections: [
      {
        title: "The game",
        body: [
          "Players build a base, take the towns, factories, and oil that pay for the war, and win the sky before they move on the ground. Cheap FPV drones hunt anything left in the open. Jammers bring them down, fiber-optic drones ignore the jamming, and guns, interceptor drones, and SAMs are the hard counter. Every army has to answer one question: what covers me from above?",
          "Both sides are playable and deliberately asymmetric. Ukraine leans on precision, dispersion, and adaptation; Russia on mass, firepower, and fortification. Twelve battle maps, each in spring and winter, have their own oil and sector layouts, and players can build and share their own maps. Real vehicles and weapons appear by name, every person in the game is fictional, and there is no gore.",
        ],
        mediaCards: [
          {
            title: "Key art",
            src: "/assets/work/frontline-zero-key-art.jpg",
            alt: "Frontline Zero key art showing one Ukrainian and one Russian soldier beneath the Frontline Zero title.",
            width: 1920,
            height: 1080,
            subtitleLink: "https://frontlinezero.com",
            subtitleLinkTitle: "Play Frontline Zero on the web",
          },
          {
            title: "City battle in Kharkiv",
            src: "/assets/work/frontline-zero-kharkiv-battle.jpg",
            alt: "Frontline Zero battle in the streets of Kharkiv with armor, infantry, and the full command interface.",
            width: 2048,
            height: 1152,
          },
          {
            title: "Winter at Bakhmut",
            src: "/assets/work/frontline-zero-bakhmut-winter.jpg",
            alt: "Frontline Zero winter battle at Bakhmut with units fighting across snow-covered terrain.",
            width: 2048,
            height: 1152,
          },
        ],
      },
      {
        title: "An engine built for determinism",
        body: [
          "Underneath the game is webrts, a browser-native isometric RTS engine I wrote in TypeScript with no runtime dependencies. The engine is kept strictly game-agnostic: a test fails if it ever imports game content.",
          "The simulation is fully deterministic, with integer world units, fixed-length ticks, a seeded random number generator, and every player input routed through orders. That discipline is what makes lockstep multiplayer possible. Every player runs the full simulation, the network carries only commands, and a relay on Cloudflare Durable Objects orders those commands into turns and checks state hashes, so a desync is caught rather than guessed at.",
        ],
        mediaCards: [
          {
            title: "Base building and economy",
            src: "/assets/work/frontline-zero-kursk-base-economy.jpg",
            alt: "Frontline Zero base at Kursk with production buildings, oil derricks, and the economy interface.",
            width: 2048,
            height: 1152,
          },
          {
            title: "Forest fight over oil",
            src: "/assets/work/frontline-zero-kreminna-forest.jpg",
            alt: "Frontline Zero battle in Kreminna Forest over oil fields, with units moving through dense trees.",
            width: 2048,
            height: 1152,
          },
        ],
      },
      {
        title: "Designing for touch",
        body: [
          "Strategy games are traditionally built around a mouse, a keyboard, and a large screen. I designed the touch interface from scratch, with gestures, an order wheel, and a dedicated phone layout, so the same matches work on a phone and players on phones can meet players on computers online.",
          "Performance work served the same goal. Trimming and packing sprite atlases and moving to 256-color art cut decoded sprite memory from 1.1 GB to about 330 MB. The renderer also detects when a device draws WebGL in software and falls back to a canvas renderer that holds 60 frames per second.",
        ],
        mediaCards: [
          {
            title: "Skirmish on a phone",
            src: "/assets/work/frontline-zero-touch-skirmish.jpg",
            alt: "Frontline Zero skirmish running on an Android phone with the touch interface.",
            width: 1920,
            height: 1080,
            subtitleLink:
              "https://play.google.com/store/apps/details?id=com.games556.frontlinezero",
            subtitleLinkTitle: "View on Google Play",
          },
          {
            title: "Unit handbook",
            src: "/assets/work/frontline-zero-unit-handbook.jpg",
            alt: "Frontline Zero handbook screen describing a unit, its role, and the history behind it.",
            width: 2048,
            height: 1152,
            subtitleLink: "https://apps.apple.com/us/app/frontline-zero/id6824570571",
            subtitleLinkTitle: "View on the App Store",
          },
        ],
      },
      {
        title: "Shipping as one person",
        tertiary: true,
        body: [
          "I built Frontline Zero with AI coding agents as day-to-day collaborators, guided by a standing brief that sets the rules every agent follows: architecture boundaries, determinism, and how changes are tested. The same approach extended into production, including an art pipeline I wrote to turn 3D models into the game's isometric sprites.",
          "Beyond the game itself, I handled the work a studio normally splits across a team: a map editor and community map browser, the tutorial and unit handbook, store listings and the press kit, and releases on the web, the App Store, and Google Play.",
        ],
      },
      {
        title: "Packaging and distribution",
        tertiary: true,
        body: [
          "I treated the game as a product to package, not just a build to upload. Its original soundtrack is released as its own album, Frontline Zero (Original Game Soundtrack), distributed through RouteNote.",
          "Every place the game lives is kept in sync: the free-to-play website, the App Store, Google Play, itch.io, ModDB and IndieDB, a YouTube channel, a Discord community, and a Fandom wiki. They share the same descriptions, art, and facts, so search engines and AI assistants pick up one consistent picture of the game and can send people straight to a place to play it.",
        ],
      },
      {
        title: "Why the work mattered",
        body: [
          "Frontline Zero is the most direct test of how I like to work: product thinking, interface design, and engineering held together by one person, with AI agents extending what that person can build. It put a deep, systems-heavy game in front of real players on every major screen in a matter of weeks, and more than 400 of them played it in the first month.",
          "It is also a project with a purpose beyond the work. Ten percent of profit goes every year to humanitarian aid for civilians affected by the war, through UNITED24.",
        ],
      },
    ],
  },
] as const;

// Current work first (main role, then studio project), then the past roles.
export const WORK_DATA = [
  WORK_ENTRIES[2],
  WORK_ENTRIES[3],
  WORK_ENTRIES[1],
  WORK_ENTRIES[0],
] as const;

// 3. Derived Types
export type WorkId = (typeof WORK_DATA)[number]["id"];
