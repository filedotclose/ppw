import { identity } from "@/data/portfolio";

const experience = [
  {
    organization: "Department of IT, Government of Sikkim",
    role: "Software Engineer Intern",
    location: "Gangtok, Sikkim",
    period: "May — June 2026",
    start: "2026-05",
    end: "2026-06",
    government: true,
    description:
      "Built full-stack ePARS appraisal workflows with Next.js and Django for 500+ government staff.",
    detail:
      "Implemented JWT and TOTP authentication with RBAC and ABAC access controls. Docker and CI/CD reduced build times by 67%.",
  },
  {
    organization: "InAmigos Foundation (IAF)",
    role: "Web Development Intern",
    location: "Remote",
    period: "May 2026",
    start: "2026-05",
    description:
      "Developed responsive client portals, audited code and addressed UI bottlenecks and mobile accessibility.",
  },
  {
    organization: "Scaler School of Technology",
    role: "Software & AI Intern",
    location: "Remote",
    period: "2024",
    start: "2024",
    description:
      "Built browser extensions and internal web utilities, integrating LLM endpoints for contextual in-browser workflows and search-query parsing.",
  },
];

const skillGroups = [
  {
    title: "Languages",
    skills: [
      "JavaScript (ES6+)",
      "TypeScript",
      "Python",
      "Java",
      "C",
      "C++",
      "SQL",
    ],
  },
  {
    title: "Frontend",
    skills: [
      "Next.js",
      "React",
      "Redux Toolkit",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
      "GSAP",
    ],
  },
  {
    title: "Backend & authentication",
    skills: ["Node.js", "Express", "Django", "REST", "JWT", "TOTP", "Supabase"],
  },
  {
    title: "Databases",
    skills: ["MongoDB", "PostgreSQL", "MySQL"],
  },
  {
    title: "Cloud & tools",
    skills: [
      "Docker",
      "Git",
      "GitHub",
      "Postman",
      "Vercel",
      "AWS (EC2 / S3)",
      "n8n",
      "Linux",
    ],
  },
  {
    title: "AI & data",
    skills: [
      "Prompt engineering",
      "Gemini API",
      "Google Cloud TTS",
      "Pandas",
      "Scikit-learn",
    ],
  },
];

const schoolEducation = [
  {
    school: "G.D. Goenka Public School",
    qualification: "CBSE · Class XII",
    year: "2024",
    result: "90.2%",
  },
  {
    school: "St. Francis’ School",
    qualification: "ICSE · Class X",
    year: "2022",
    result: "92.8%",
  },
];

export default function Profile() {
  return (
    <section
      id="profile"
      className="profile"
      data-scene="profile"
      data-context="Profile / Experience"
      tabIndex={-1}
      aria-labelledby="profile-title"
    >
      <div className="section-label profile-label">
        <span>Profile / Experience</span>
        <span>{identity.name} · {identity.location}</span>
      </div>

      <header className="profile-header">
        <h2 id="profile-title" className="profile-title">
          <span>
            Software, AI <span className="profile-slash">/</span>
          </span>
          <span className="profile-title-second">&amp; systems.</span>
        </h2>
        <div className="profile-introduction">
          <span className="eyebrow">
            From the browser to public-sector workflows
          </span>
          <p>
            Computer science at KIIT. Full-stack software, government appraisal
            systems and AI-assisted browser tools — with campus leadership
            alongside the technical work.
          </p>
        </div>
      </header>

      <div className="profile-trajectory">
        <div className="profile-subheading">
          <h3 className="eyebrow" id="profile-trajectory-title">
            01 / Trajectory
          </h3>
          <span className="eyebrow">2024 — 2026</span>
        </div>
        <ol
          className="profile-timeline"
          aria-labelledby="profile-trajectory-title"
        >
          {experience.map((record, index) => (
            <li
              className={`profile-record${record.government ? " profile-record--government" : ""}`}
              key={record.organization}
            >
              <div className="profile-record-meta">
                <span className="profile-record-index" aria-hidden="true">
                  0{index + 1}
                </span>
                <p className="profile-period">
                  {record.end ? (
                    <>
                      <time dateTime={record.start}>May</time> —{" "}
                      <time dateTime={record.end}>June 2026</time>
                    </>
                  ) : (
                    <time dateTime={record.start}>{record.period}</time>
                  )}
                </p>
                <span className="profile-location">{record.location}</span>
              </div>
              <div className="profile-record-content">
                <p className="eyebrow profile-role">{record.role}</p>
                <h4>{record.organization}</h4>
                <p>{record.description}</p>
                {record.detail && (
                  <p className="profile-record-detail">{record.detail}</p>
                )}
              </div>
              {record.government && (
                <dl className="profile-impact">
                  <dt>Build-time reduction</dt>
                  <dd>
                    67<span>%</span>
                  </dd>
                  <dd className="profile-impact-note">
                    Docker / CI/CD · Government of Sikkim
                  </dd>
                </dl>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="profile-foundations">
        <div
          className="profile-education"
          aria-labelledby="profile-education-title"
        >
          <h3 className="eyebrow" id="profile-education-title">
            02 / Education
          </h3>
          <div className="profile-university">
            <div>
              <h4>KIIT University</h4>
              <p>B.Tech · Computer Science and Engineering</p>
              <p>Bhubaneswar, Odisha</p>
              <p className="profile-education-period">
                <time dateTime="2024">2024</time> —{" "}
                <time dateTime="2028">2028</time>
              </p>
            </div>
            <dl className="profile-grade">
              <dt>CGPA</dt>
              <dd>9.95</dd>
            </dl>
          </div>
          <ul className="profile-schools">
            {schoolEducation.map((record) => (
              <li key={record.school}>
                <div>
                  <h4>{record.school}</h4>
                  <p>
                    {record.qualification} ·{" "}
                    <time dateTime={record.year}>{record.year}</time>
                  </p>
                </div>
                <span>{record.result}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="profile-skills" aria-labelledby="profile-skills-title">
          <h3 className="eyebrow" id="profile-skills-title">
            03 / Working toolkit
          </h3>
          <p className="profile-skills-intro">
            Grouped by discipline. Open to explore.
          </p>
          <div className="profile-skill-groups">
            {skillGroups.map((group, index) => (
              <details className="profile-skill-group" key={group.title}>
                <summary>
                  <span className="profile-skill-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span>{group.title}</span>
                  <span className="profile-skill-toggle" aria-hidden="true" />
                </summary>
                <ul>
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div
        className="profile-recognition"
        aria-labelledby="profile-recognition-title"
      >
        <h3 className="eyebrow" id="profile-recognition-title">
          04 / Recognition &amp; leadership
        </h3>
        <div className="profile-recognition-grid">
          <div className="profile-rank">
            <p className="eyebrow">All India Rank</p>
            <p className="profile-rank-number">
              8<span aria-hidden="true">/</span>
            </p>
            <h4>
              Bloom National Olympiad
              <br />
              of Computer Science
            </h4>
          </div>
          <ul className="profile-leadership">
            <li>
              <h4>Academic distinction</h4>
              <p>
                Maintained a 9.95 CGPA at KIIT. Ranked top of the batch in
                Class X (92.8%) and Class XII (90.2%).
              </p>
            </li>
            <li>
              <h4>
                Web Development Lead <span>ELABS</span>
              </h4>
            </li>
            <li>
              <h4>
                Graphic Design Lead <span>Kalliope</span>
              </h4>
            </li>
            <li>
              <h4>Developer mentorship</h4>
              <p>Mentored developers in campus tech tracks.</p>
            </li>
            <li>
              <h4>TechFest co-organizer</h4>
              <p>North Bengal’s inaugural TechFest.</p>
            </li>
            <li>
              <h4>Model United Nations</h4>
              <p>Awarded at multiple conferences.</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
