# Sujal Agarwal — interactive portfolio

Next.js / React / TypeScript portfolio with locally hosted Manrope typography, a custom WebGL optical instrument, scene-specific GSAP choreography, and one Lenis scroll engine.

## Run

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Production:

```sh
npm run typecheck
npm run build
npm start
```

## Professional content and sources

The original workspace was empty. The owner subsequently supplied **Resume (2).pdf** from Downloads. Its text and embedded contact-link annotations are the authoritative source for the professional content now published here.

### Selected work

1. Campus Gatepass System — Node.js, Express, MongoDB, JWT, role-based checkpoints, and hardware-ready architecture.
2. Automated AI YouTube Pipeline — Python, n8n, Gemini, AWS, Pexels, and YouTube Data API v3.
3. KIITKafe Ordering Platform — React, Redux Toolkit, Node.js, Express, and MongoDB.
4. Korridor Webapp — Next.js, TypeScript, MongoDB, and Tailwind CSS.

### Profile

- Government of Sikkim Department of IT, InAmigos Foundation, and Scaler School of Technology internship records.
- KIIT education, 9.95 CGPA, and secondary/senior-secondary results.
- CV-listed technical skills, academic distinction (top of the batch in Classes X and XII), AIR 8, campus leadership, TechFest activity, and Model UN recognition.
- Email, GitHub, and LinkedIn URLs extracted from the supplied CV.
- A first-person introduction with the B.Tech study period and CGPA, plus a direct link to experience.

The PDF is not copied into the public directory. A phone number appears in the CV but is not published in the site; contact uses email and the professional profiles.

### Accuracy boundaries

- All four project fields are explicitly labeled **schematics, not product screenshots**. Their controls inspect explanations and visual interpretations; they do not operate the original projects, authenticate people, assign rooms, run AI jobs, or publish videos.
- The gatepass figure of **500 simulated concurrent users** describes stress testing, not live adoption. Hardware-ready architecture is not represented as a deployed biometric integration.
- **500+ government staff** and **67% build-time reduction** come from the CV’s Government of Sikkim experience entry.
- Korridor’s sub-second query performance is CV-reported; no additional benchmark conditions or dataset sizes are invented.
- Project dates, individual repository URLs, deployment URLs, and original screenshots were not supplied and remain omitted.
- The under-the-surface index describes this portfolio’s implementation, separately from the résumé skills and professional projects.

Project descriptions and verified contact links live in `src/data/portfolio.ts`. Profile records and skills are in `src/components/Profile.tsx`. Use genuine media when available; keep abstract representations clearly labeled.

Set `NEXT_PUBLIC_SITE_URL` to the actual deployed HTTPS origin before building. Canonical and sitemap entries are emitted only with a configured origin. Without it, social-image metadata uses the development origin.

## Systems

- `src/components/Portfolio.tsx`: semantic scene composition and project selection.
- `MotionSystem.tsx`: GSAP match-media lifecycle, scene timelines, context navigation, and Lenis/GSAP synchronization. Wheel and menu-link scrolling use one Lenis instance. Touch scrolling stays native; reduced-motion visitors bypass Lenis.
- `OpticalLens.tsx`: lazy-loaded Three.js renderer, beveled geometry, custom refraction/Fresnel shader, active-scene text textures, damped interaction, capped DPR, and demand-driven rendering. Rendering pauses behind dialogs and in hidden tabs. Resources and listeners are disposed without forcing context loss on React’s reusable development canvas.
- `Navigation.tsx` / `ProjectDetail.tsx`: native modal dialogs with spatial transitions, Escape support, focus restoration, and background-scroll suspension.
- `ProjectFields.tsx` / `src/app/project-fields.css`: four responsive, keyboard-accessible project schematics.
- `Profile.tsx` / `src/app/profile.css`: experience, education, native skill disclosures, and achievements.
- `BuildIndex.tsx`: accessible disclosure index of this website’s actual implementation technologies.
- `Contact.tsx`: verified email and professional links, with bounded magnetic interaction.
- `src/app/globals.css`: global layout, environments, scene transitions, and motion/renderer fallbacks.

The optical texture samples text geometry and styles, not a DOM screenshot. Rotated or perspective-transformed text is approximated. Legacy `SignalField.tsx` and `StructureField.tsx` remain as unused standalone creative-coding experiments; they are not presented as résumé projects.

## Validation

```sh
npm run test:browser
npm run test:browser -- --production
```

The script starts a temporary server on port 3100, launches actual Chrome, generates viewport screenshots and accessibility reports under ignored `qa/`, and closes both processes afterward. It exercises smooth scrolling, project schematics, keyboard sliders, skill disclosures, menu focus, case-study navigation, verified contact destinations, reduced motion, no-JavaScript rendering, non-WebGL fallback, responsive layouts, 404 handling, and social-image/robots endpoints.

On Windows it defaults to Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Elsewhere install Playwright Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to the actual browser path. Software WebGL flags apply only to the automated browser.

Axe results are regression checks, not complete accessibility certification. CPU-emulated WebGL does not establish real-device GPU performance. Test target devices before publishing.

No analytics, remote fonts, third-party embeds, autoplay audio, or runtime AI/API credentials are required by the portfolio.
