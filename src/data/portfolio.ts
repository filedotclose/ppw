// Professional content is sourced from the supplied Resume (2).pdf.
// Project dates, individual repository URLs, and screenshots were not supplied.
export const identity = {
  name: "Sujal Agarwal",
  email: "sujalagarwaljrt@gmail.com",
  github: "https://github.com/filedotclose",
  linkedin: "https://www.linkedin.com/in/filedotclose/",
  location: "Bhubaneswar, India",
  canonicalUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
};

export const projects = [
  {
    id: "gatepass",
    scene: "optics",
    number: "01",
    title: "Campus Gatepass System",
    shortTitle: "Campus Gatepass",
    titleLines: ["Campus", "Gatepass."],
    discipline: "Full-stack / Access management",
    description:
      "Hostel and library access management, with role-based guard checkpoints and a hardware-ready architecture.",
    tools: ["Node.js", "Express.js", "MongoDB", "JWT"],
    context:
      "A transit-management platform for monitoring hostel and library access. Guard checkpoints enforce role-based access policies.",
    implementation:
      "Built the platform with Node.js, Express.js, MongoDB, and JWT. Modular endpoints were architected for direct biometric-device integration.",
    detail:
      "Stress-tested with 500 simulated concurrent users. This is a concurrency-test result, not a claim of live adoption. The CV describes hardware-ready architecture, not a deployed biometric integration.",
  },
  {
    id: "youtube",
    scene: "signal",
    number: "02",
    title: "Automated AI YouTube Pipeline",
    shortTitle: "AI YouTube Pipeline",
    titleLines: ["AI YouTube", "Pipeline."],
    discipline: "AI / Workflow automation",
    description:
      "An AWS-based workflow connecting topic research, script generation, B-roll, voice synthesis, and YouTube publication.",
    tools: [
      "Python",
      "n8n",
      "Gemini API",
      "AWS",
      "Pexels API",
      "YouTube Data API v3",
    ],
    context:
      "An automated video-production pipeline covering research, content generation, media sourcing, and publication.",
    implementation:
      "Orchestrated topic research, Gemini 2.0 Flash script generation, dynamic B-roll fetching, and voice synthesis in an automated AWS pipeline.",
    detail:
      "Integrated YouTube Data API v3 in n8n for metadata tagging, scheduling, and publication without manual intervention. The portfolio visual is a workflow interpretation; it does not execute the pipeline or send AI requests.",
  },
  {
    id: "kiitkafe",
    scene: "structure",
    number: "03",
    title: "KIITKafe Ordering Platform",
    shortTitle: "KIITKafe",
    titleLines: ["KIITKafe", "Ordering."],
    discipline: "Full-stack / Campus dining",
    description:
      "A campus dining app connecting a persistent cart and checkout to inventory management and kitchen fulfillment.",
    tools: ["React", "Redux Toolkit", "Node.js", "Express.js", "MongoDB"],
    context:
      "A campus ordering platform with customer ordering and administrative inventory and fulfillment workflows.",
    implementation:
      "Developed centralized application state using Redux Toolkit, with real-time cart persistence and high-speed checkout flows.",
    detail:
      "Built an administrative dashboard with RESTful APIs for real-time inventory management and kitchen fulfillment tracking. The layered visual interprets those workflows; it is not a screenshot of the original dashboard.",
  },
  {
    id: "korridor",
    scene: "korridor",
    number: "04",
    title: "Korridor Webapp",
    shortTitle: "Korridor",
    titleLines: ["Korridor", "Webapp."],
    discipline: "Full-stack / Student housing",
    description:
      "A mobile-first student hostel portal for onboarding, room assignments, and grievance ticketing.",
    tools: ["Next.js", "TypeScript", "MongoDB", "Tailwind CSS"],
    context:
      "A student hostel portal bringing onboarding, room assignment, and grievance workflows into a mobile-first interface.",
    implementation:
      "Built the portal using Next.js, TypeScript, MongoDB, and Tailwind CSS, including Next.js server-side components and indexed MongoDB queries.",
    detail:
      "The CV reports sub-second query response times across resident dashboards. No dataset size, test conditions, or additional benchmark measurements were supplied. The visual is an abstract workflow interpretation, not an original product screen.",
  },
] as const;
export type Project = (typeof projects)[number];

export const buildIndex = [
  {
    title: "Interface",
    description:
      "Semantic structure. Typed components. Responsive composition.",
    technologies: ["Next.js", "React", "TypeScript", "CSS"],
  },
  {
    title: "Choreography",
    description:
      "Scene-level timelines. One scroll engine. Spatial transitions.",
    technologies: ["GSAP", "ScrollTrigger", "Lenis"],
  },
  {
    title: "Optics",
    description: "Beveled geometry. Custom refraction. Damped interaction.",
    technologies: ["Three.js", "GLSL", "Canvas texture"],
  },
  {
    title: "Consideration",
    description:
      "Keyboard access. Reduced motion. Local typography. GPU cleanup.",
    technologies: ["Semantic HTML", "Media queries", "Dynamic imports"],
  },
];
