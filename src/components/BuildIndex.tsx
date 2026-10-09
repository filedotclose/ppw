"use client";
import { useState } from "react";
import { buildIndex } from "@/data/portfolio";

export default function BuildIndex() {
  const [active, setActive] = useState(0);
  return (
    <section
      id="inside"
      className="inside"
      data-scene="inside"
      data-context="Under the surface"
      tabIndex={-1}
      aria-labelledby="inside-title"
    >
      <div className="section-label">
        <span>02 / Under the surface</span>
        <span>The portfolio is the implementation</span>
      </div>
      <div className="inside-heading">
        <h2 id="inside-title">
          Not just
          <br />
          the surface<span className="accent">.</span>
        </h2>
        <p>
          What you can see.
          <br />
          What makes it work.
        </p>
      </div>
      <div className="build-index">
        <div className="build-rows">
          {buildIndex.map((group, index) => (
            <div className="build-group" key={group.title}>
              <h3>
                <button
                  className="build-row"
                  id={`build-tab-${index}`}
                  aria-expanded={active === index}
                  aria-controls={`build-panel-${index}`}
                  onClick={() => setActive(index)}
                >
                  <span className="build-number">0{index + 1}</span>
                  <span className="build-name">{group.title}</span>
                  <span className="build-symbol" aria-hidden="true">
                    {active === index ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div
                id={`build-panel-${index}`}
                className="build-inline"
                role="region"
                aria-labelledby={`build-tab-${index}`}
                hidden={active !== index}
              >
                <p>{group.description}</p>
                <ul>
                  {group.technologies.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="build-inspection" aria-hidden="true">
          <span className="build-inspection-number">0{active + 1}</span>
          <div className="build-inspection-detail">
            <span>{buildIndex[active].title}</span>
            <p>{buildIndex[active].description}</p>
            <div>
              {buildIndex[active].technologies.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
