"use client";
import { useRef, useState } from "react";
import { identity } from "@/data/portfolio";

export default function Contact() {
  const [status, setStatus] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const magnetic = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const move = (event: React.PointerEvent<HTMLElement>) => {
    if (
      !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)")
        .matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * 0.1;
    const y = (event.clientY - bounds.top - bounds.height / 2) * 0.15;
    if (magnetic.current)
      magnetic.current.style.transform = `translate(${Math.max(-12, Math.min(12, x))}px,${Math.max(-8, Math.min(8, y))}px)`;
  };
  const reset = () => {
    if (magnetic.current) magnetic.current.style.transform = "";
  };
  const copy = async () => {
    const url =
      identity.canonicalUrl ||
      `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Portfolio link copied.");
    } catch {
      setFallbackUrl(url);
      setStatus("Select and copy the link below.");
    }
  };
  return (
    <section
      id="contact"
      className="contact"
      data-scene="contact"
      data-context="The ending / Sujal Agarwal"
      tabIndex={-1}
      aria-labelledby="contact-title"
    >
      <div className="contact-reveal">
        <div className="section-label">
          <span>03 / The ending</span>
          <span>Thanks for looking closer.</span>
        </div>
        <div className="contact-composition">
          <h2 id="contact-title" className="contact-title">
            {identity.email ? (
              <>
                Let’s
                <br />
                <span>talk.</span>
              </>
            ) : (
              <>
                Until
                <br />
                <span>next time.</span>
              </>
            )}
          </h2>
          <div className="contact-action">
            <span className="eyebrow">Sujal Agarwal</span>
            {identity.email ? (
              <a
                ref={(element) => {
                  magnetic.current = element;
                }}
                onPointerMove={move}
                onPointerLeave={reset}
                onBlur={reset}
                className="contact-primary"
                href={`mailto:${identity.email}`}
                aria-label={`Send email to ${identity.email}`}
              >
                {identity.email}
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <button
                ref={(element) => {
                  magnetic.current = element;
                }}
                onPointerMove={move}
                onPointerLeave={reset}
                onBlur={reset}
                className="contact-primary"
                onClick={copy}
              >
                Take the link with you<span aria-hidden="true">↗</span>
              </button>
            )}
            <nav
              className="contact-socials"
              aria-label="Social and professional links"
            >
              {identity.instagram && (
                <a
                  href={identity.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link"
                  data-cursor="INSTAGRAM"
                  aria-label={
                    identity.instagramHandle
                      ? `Instagram profile ${identity.instagramHandle}`
                      : "Instagram profile"
                  }
                >
                  <span className="contact-social-main">
                    <span className="contact-social-label">Instagram</span>
                    {identity.instagramHandle && (
                      <span className="contact-social-handle">
                        {identity.instagramHandle}
                      </span>
                    )}
                  </span>
                  <span aria-hidden="true" className="contact-social-arrow">
                    ↗
                  </span>
                </a>
              )}
              {identity.linkedin && (
                <a
                  href={identity.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-social-link"
                  data-cursor="LINKEDIN"
                  aria-label={
                    identity.linkedinHandle
                      ? `LinkedIn profile ${identity.linkedinHandle}`
                      : "LinkedIn profile"
                  }
                >
                  <span className="contact-social-main">
                    <span className="contact-social-label">LinkedIn</span>
                    {identity.linkedinHandle && (
                      <span className="contact-social-handle">
                        {identity.linkedinHandle}
                      </span>
                    )}
                  </span>
                  <span aria-hidden="true" className="contact-social-arrow">
                    ↗
                  </span>
                </a>
              )}
            </nav>
            <span className="copy-status" role="status">
              {status}
            </span>
            {fallbackUrl && (
              <input
                className="copy-fallback"
                aria-label="Portfolio link to copy"
                value={fallbackUrl}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            )}
          </div>
        </div>
        <footer className="footer">
          <span>Sujal Agarwal / {new Date().getFullYear()}</span>
          <div>
            {identity.email && (
              <a
                href={`mailto:${identity.email}`}
                aria-label={`Email ${identity.email}`}
              >
                Email ↗
              </a>
            )}
            {identity.github && (
              <a
                href={identity.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
              >
                GitHub ↗
              </a>
            )}
            {identity.linkedin && (
              <a
                href={identity.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  identity.linkedinHandle
                    ? `LinkedIn profile ${identity.linkedinHandle}`
                    : "LinkedIn profile"
                }
              >
                LinkedIn ↗
              </a>
            )}
            {identity.instagram && (
              <a
                href={identity.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  identity.instagramHandle
                    ? `Instagram profile ${identity.instagramHandle}`
                    : "Instagram profile"
                }
              >
                Instagram ↗
              </a>
            )}
            <a href="#top">
              Back to the beginning <span aria-hidden="true">↑</span>
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
