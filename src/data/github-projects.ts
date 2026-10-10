export interface GitHubProject {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  titleLines: [string, string];
  discipline: string;
  category: "fullstack" | "ai-systems" | "creative-audio" | "data-science";
  categoryLabel: string;
  description: string;
  tools: string[];
  githubUrl: string;
  liveUrl?: string;
  context: string;
  implementation: string;
  detail: string;
  metrics: {
    label: string;
    value: string;
  }[];
  palette: {
    paper: string;
    ink: string;
    accent: string;
  };
}

export const githubProjects: GitHubProject[] = [
  {
    id: "ksac-gatepass",
    number: "01",
    title: "KIIT KSAC GatePass Pro",
    shortTitle: "KSAC GatePass",
    titleLines: ["KSAC", "GatePass."],
    discipline: "Full-Stack / Access Management & Transit State Machine",
    category: "fullstack",
    categoryLabel: "Full-Stack",
    description:
      "A tamper-proof digital tracking and in-time curfew extension system between KIIT hostels and the Student Activity Center (KSAC), replacing paper slips with a real-time 6-stage transit state machine.",
    tools: [
      "Next.js 15",
      "TypeScript",
      "MongoDB",
      "Mongoose",
      "JWT",
      "Tailwind CSS",
    ],
    githubUrl: "https://github.com/filedotclose/KSAC-Gatepass",
    liveUrl: "https://ksac-gatepass.vercel.app",
    context:
      "Campus hostels enforce strict evening curfews (7:00 PM – 7:30 PM). Students participating in legitimate society workshops and hackathons at the Student Activity Center previously relied on handwritten paper slips prone to signature forgery and lost transit verification.",
    implementation:
      "Engineered an automated digital state machine: PENDING → APPROVED → HOSTEL_EXIT → IN_KSAC → KSAC_EXIT → RETURNED. Built tri-tier RBAC for Students, Hostel Wardens, and KSAC Desk Authorities with tamper-resistant cryptographic audit logs and QR token scanning.",
    detail:
      "Stress-tested with 500 simulated concurrent users. Next.js App Router API handlers with Mongoose connection pooling and httpOnly JWT authentication ensure sub-second state transitions and zero curfew slip tampering.",
    metrics: [
      { label: "Transit Machine", value: "6 Discrete States" },
      { label: "Stress Test", value: "500 Concurrent Users" },
      { label: "Auth Protocol", value: "JWT / httpOnly Cookie" },
      { label: "Verification", value: "Tamper-Proof Audit Log" },
    ],
    palette: {
      paper: "#bdc4aa",
      ink: "#242c20",
      accent: "#435939",
    },
  },
  {
    id: "ai-review",
    number: "02",
    title: "AI Review & Construction DPR System",
    shortTitle: "AI Review System",
    titleLines: ["AI Review", "Pipeline."],
    discipline: "AI & Systems / Operational Intelligence & DPR Auditing",
    category: "ai-systems",
    categoryLabel: "AI & Systems",
    description:
      "An AI-powered operational review and construction management platform tracking daily progress reports (DPR), fuel logistics, biometric worker attendance, and petty cash with Celery anomaly detection.",
    tools: [
      "FastAPI",
      "Python",
      "Async SQLAlchemy",
      "Celery",
      "Redis",
      "Next.js PWA",
      "Docker",
      "MinIO",
    ],
    githubUrl: "https://github.com/filedotclose/AI-Review-System",
    context:
      "Infrastructure and civil construction projects suffer from delayed reporting, unverified heavy equipment fuel burn, and discrepancies between manual site rosters and subcontractor petty cash disbursements.",
    implementation:
      "Architected an asynchronous pipeline using FastAPI, SQLAlchemy async sessions, and Celery background workers. Site supervisors submit DPRs via an offline-capable Next.js PWA with photo uploads to MinIO. Celery Beat schedules anomaly audits comparing machine run-hours to fuel consumption.",
    detail:
      "Containerized microservices stack managed via Docker Compose. Automated executive briefs surface material consumption deviations and flag ghost worker rosters using algorithmic anomaly scoring.",
    metrics: [
      { label: "Core Backend", value: "FastAPI + Async SQLAlchemy" },
      { label: "Task Queue", value: "Celery + Redis Broker" },
      { label: "Storage Engine", value: "MinIO S3 Compatible" },
      { label: "Client Layer", value: "Offline-Ready Next.js PWA" },
    ],
    palette: {
      paper: "#ca6149",
      ink: "#2c130c",
      accent: "#e4775e",
    },
  },
  {
    id: "gesture-midi",
    number: "03",
    title: "Gesture-MIDI Spatial Instrument",
    shortTitle: "Gesture-MIDI",
    titleLines: ["Gesture", "MIDI."],
    discipline: "Creative Computing / Computer Vision & Audio Synthesis",
    category: "creative-audio",
    categoryLabel: "Creative & Audio",
    description:
      "A low-latency, webcam-based gesture-controlled MIDI instrument built with MediaPipe HandLandmarker, OpenCV, and Mido, offering dual-hand musical performance, pinch note triggers, and continuous CC expression.",
    tools: [
      "Python 3.11",
      "MediaPipe Tasks",
      "OpenCV",
      "Mido",
      "NumPy",
      "Virtual MIDI / DAW",
    ],
    githubUrl: "https://github.com/filedotclose/Gesture-MIDI",
    context:
      "Traditional electronic instruments require physical hardware surfaces. This project transforms any standard consumer webcam into a 3D expressive musical interface without wearable sensors.",
    implementation:
      "Extracts 21 3D hand landmarks via MediaPipe Tasks with exponential moving average (EMA) smoothing and 3-frame debounced pinch detection. Left hand triggers basslines (Octaves 2-3) while right hand plays leads (Octaves 4-5). Finger pinches trigger notes; vertical Y-axis height modulates Volume (CC 7) and wrist rotation controls Pitch Bend.",
    detail:
      "Features real-time scale quantization across Major, Minor, Pentatonic, Dorian, and Harmonic Minor scales, real-time triad chord voicing, virtual piano visualizer, and direct MIDI recording to .mid standard files.",
    metrics: [
      { label: "Tracking Rig", value: "21 MediaPipe Landmarks" },
      { label: "Trigger Debounce", value: "3-Frame Stabilizer" },
      { label: "Continuous CC", value: "Volume (CC7) & Pitch Bend" },
      { label: "Latency", value: "Sub-15ms Video-to-MIDI" },
    ],
    palette: {
      paper: "#2c3b4a",
      ink: "#e8eff5",
      accent: "#5fa8d3",
    },
  },
  {
    id: "klick",
    number: "04",
    title: "KLICK Mechanical Switch Emulator",
    shortTitle: "KLICK Emulator",
    titleLines: ["KLICK", "Acoustics."],
    discipline: "Systems Engineering / Low-Level OS Hooks & Audio DSP",
    category: "creative-audio",
    categoryLabel: "Systems & Audio",
    description:
      "An ultra-low latency mechanical keyboard sound emulator desktop application for Windows, featuring spatial stereo column positioning, bi-directional upstroke/downstroke acoustics, and micro-pitch humanization.",
    tools: [
      "Python",
      "Windows Low-Level Hook API",
      "PyAudio",
      "NumPy",
      "Spatial Stereo DSP",
    ],
    githubUrl: "https://github.com/filedotclose/klick",
    context:
      "Laptops and membrane keyboards lack the tactile auditory satisfaction of boutique mechanical switches. KLICK was inspired by Klack to bring high-fidelity mechanical switch acoustics to any keyboard in real time.",
    implementation:
      "Captures global keystrokes using Windows low-level keyboard hooks and plays multi-sampled switch sounds through direct hardware audio streaming with a 256-sample buffer. Panning coordinates match physical keyboard columns (Q/A/Z left, Space center, P/Enter right).",
    detail:
      "Simulates 10 authentic mechanical switches (NovelKeys Cream, Holy Panda deep thock, IBM Model M buckling spring, Cherry MX Red/Brown/Blue, KTT Strawberry) with independent bottom-out downstrokes and slider-release upstrokes, plus ±1.5% micro-pitch and ±4% gain humanization.",
    metrics: [
      { label: "Audio Latency", value: "Sub-10ms Hardware Buffer" },
      { label: "Buffer Window", value: "256 Audio Samples" },
      { label: "Profiles", value: "10 Mechanical Switches" },
      { label: "Spatial Stereo", value: "Column-Mapped Panning" },
    ],
    palette: {
      paper: "#38312c",
      ink: "#f4ede8",
      accent: "#d4a373",
    },
  },
  {
    id: "online-kafe",
    number: "05",
    title: "Online Kafe Canteen Platform",
    shortTitle: "Online Kafe",
    titleLines: ["Online", "Kafe."],
    discipline: "Full-Stack / Campus Dining & Real-Time Fulfillment",
    category: "fullstack",
    categoryLabel: "Full-Stack",
    description:
      "A high-throughput campus dining platform connecting customer digital carts with kitchen fulfillment tracking, menu management, and real-time inventory availability.",
    tools: [
      "Next.js 16",
      "React 19",
      "MongoDB",
      "Mongoose",
      "Redux Toolkit",
      "Tailwind CSS",
      "Zod",
    ],
    githubUrl: "https://github.com/filedotclose/ONLINE-KAFE",
    context:
      "Campus canteens face severe rush-hour bottlenecks. Physical ordering queues cause wait times of 20+ minutes and frequent order mix-ups between the counter and the preparation kitchen.",
    implementation:
      "Developed a modern web application using Next.js 16 and React 19. Implemented persistent client-side cart state with Redux Toolkit, real-time order lifecycle tracking (Pending → Preparing → Ready), and an executive dashboard for kitchen inventory control.",
    detail:
      "Backed by MongoDB with Mongoose indexing, Zod schema validation for all incoming order payloads, and secure role-based JWT authentication separating customer and canteen admin actions.",
    metrics: [
      { label: "Next.js Engine", value: "Next.js 16 App Router" },
      { label: "Order State", value: "Pending → Prep → Ready" },
      { label: "Validation", value: "Strict Zod Schemas" },
      { label: "State Store", value: "Redux Toolkit Persist" },
    ],
    palette: {
      paper: "#d8c4a4",
      ink: "#2c2217",
      accent: "#b0733a",
    },
  },
  {
    id: "korridor",
    number: "06",
    title: "Korridor Student Housing Portal",
    shortTitle: "Korridor Webapp",
    titleLines: ["Korridor", "Housing."],
    discipline: "Full-Stack / Student Housing & Grievance Ticketing",
    category: "fullstack",
    categoryLabel: "Full-Stack",
    description:
      "A mobile-first student hostel portal for university residential complexes, streamlining onboarding, block & room allocations, and resident grievance ticketing.",
    tools: [
      "Next.js",
      "TypeScript",
      "MongoDB",
      "Tailwind CSS",
      "Server Components",
    ],
    githubUrl: "https://github.com/filedotclose/Korridor",
    liveUrl: "https://korridor.vercel.app",
    context:
      "Hostel administration at large universities involves thousands of incoming residents. Paper-based room assignments and in-person grievance reporting lead to administrative overhead and delayed repairs.",
    implementation:
      "Built a mobile-first portal with Next.js App Router and server-side components. Supports verified digital onboarding, algorithmic room allocations, and an integrated maintenance grievance dispatch system.",
    detail:
      "Leveraged MongoDB compound indexes to achieve sub-second query speeds across thousands of resident records, with responsive Tailwind UI optimized for mobile devices.",
    metrics: [
      { label: "Architecture", value: "Next.js Server Components" },
      { label: "Query Speed", value: "Sub-Second Indexed DB" },
      { label: "Mobile First", value: "Tailwind UI System" },
      { label: "Ticketing", value: "Full Grievance Dispatch" },
    ],
    palette: {
      paper: "#2f3833",
      ink: "#e2ede6",
      accent: "#76a287",
    },
  },
  {
    id: "smory",
    number: "07",
    title: "Smory Social Memory Network",
    shortTitle: "Smory Capsule",
    titleLines: ["Smory", "Memory."],
    discipline: "Full-Stack / Collaborative Social Memory Engine",
    category: "fullstack",
    categoryLabel: "Full-Stack",
    description:
      "A collaborative digital journal and social memory capsule web application enabling users to curate, tag, and revisit chronological life experiences.",
    tools: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    githubUrl: "https://github.com/filedotclose/Smory",
    liveUrl: "https://smory-nu.vercel.app",
    context:
      "Traditional social media feeds favor ephemeral content over meaningful retrospection. Smory was built to provide an intentional, archive-centric space for documenting personal and shared milestones.",
    implementation:
      "Built with Next.js App Router and TypeScript. Provides an intuitive card-based memory composition flow with multi-tag taxonomies, date indexing, and collaborative memory reels.",
    detail:
      "Optimized for zero layout shift with responsive modern typography, edge CDN deployment on Vercel, and seamless mobile touch interactions.",
    metrics: [
      { label: "Deployment", value: "Vercel Edge Network" },
      { label: "Type Safety", value: "Strict TypeScript" },
      { label: "UI Flow", value: "Card Memory Composition" },
      { label: "Taxonomy", value: "Multi-Tag Indexing" },
    ],
    palette: {
      paper: "#c3b1be",
      ink: "#2c1c27",
      accent: "#8b5278",
    },
  },
  {
    id: "expense-tracker",
    number: "08",
    title: "Offline-First PWA Expense Tracker",
    shortTitle: "Expense Tracker",
    titleLines: ["Expense", "Ledger."],
    discipline: "Client-Side Engineering / Offline-First PWA & Storage",
    category: "fullstack",
    categoryLabel: "Client Utility",
    description:
      "A lightweight, offline-first Progressive Web App for instantaneous personal expense logging, category analytics, and budget forecasting without backend latency.",
    tools: [
      "JavaScript (ES6+)",
      "Service Workers",
      "IndexedDB",
      "CSS3 Flexbox",
      "PWA Manifest",
    ],
    githubUrl: "https://github.com/filedotclose/expense-tracker",
    context:
      "Personal finance tracking requires friction-free entry at the moment of payment. Heavy banking apps with slow internet handshakes deter consistent daily logging.",
    implementation:
      "Engineered an offline-first PWA using Service Workers for client-side caching and local storage / IndexedDB persistence. Transactions log in under 5 milliseconds with immediate balance adjustments.",
    detail:
      "Generates dynamic category percentage breakdowns across spending categories and operates 100% offline with zero external framework overhead.",
    metrics: [
      { label: "App Model", value: "Offline-First PWA" },
      { label: "Latency", value: "Sub-5ms Local Logging" },
      { label: "Dependencies", value: "Zero External Frameworks" },
      { label: "Offline Cache", value: "Service Worker Driven" },
    ],
    palette: {
      paper: "#aebdc0",
      ink: "#1b282b",
      accent: "#437078",
    },
  },
  {
    id: "netflix-analysis",
    number: "09",
    title: "Exploratory Streaming Data Science",
    shortTitle: "Data Science EDA",
    titleLines: ["Streaming", "Analytics."],
    discipline: "Data Science / Exploratory Analysis & Statistical Modeling",
    category: "data-science",
    categoryLabel: "Data Science",
    description:
      "An in-depth exploratory data analysis of streaming catalog trends, content classification, duration distributions, and country-level production clusters using Pandas and Seaborn.",
    tools: [
      "Python 3",
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "Jupyter Notebook",
    ],
    githubUrl: "https://github.com/filedotclose/Netflix-Dataset-Analysis",
    context:
      "Understanding international streaming catalog evolution provides valuable insights into entertainment consumption shifts from linear broadcast television to on-demand global media.",
    implementation:
      "Constructed a structured data cleansing and imputation pipeline in Jupyter Notebook. Handled missing casting and director attributes, normalized multi-country origin strings, and categorized duration metrics across movies and multi-season TV shows.",
    detail:
      "Visualized release year timelines, maturity rating distributions (TV-MA, TV-14, PG-13), and genre heatmaps connecting production country to dominant narrative themes.",
    metrics: [
      { label: "Dataset Scope", value: "8,800+ Catalog Records" },
      { label: "Transformations", value: "Vectorized Pandas Pipeline" },
      { label: "Visualizations", value: "Seaborn / Matplotlib Heatmaps" },
      { label: "Analysis Lens", value: "Global Genre Clustering" },
    ],
    palette: {
      paper: "#3b2b2b",
      ink: "#f7eded",
      accent: "#e50914",
    },
  },
];
