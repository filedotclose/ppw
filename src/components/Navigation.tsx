"use client";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";

import Link from "next/link";

const links = [
  ["Beginning", "#top"],
  ["Selected work", "#work"],
  ["GitHub Projects Showcase", "/projects"],
  ["Profile & experience", "#profile"],
  ["Under the surface", "#inside"],
  ["Contact", "#contact"],
];
export default function Navigation() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const savedOverflow = useRef("");
  const close = (href?: string) => {
    timeline.current?.kill();
    const done = () => {
      dialog.current?.close();
      document.body.style.overflow = savedOverflow.current;
      document.documentElement.removeAttribute("data-menu");
      document.dispatchEvent(
        new CustomEvent("portfolio:overlay", { detail: false }),
      );
      setOpen(false);
      if (href) {
        if (href.startsWith("/")) {
          window.location.href = href;
          return;
        }
        const target = document.querySelector<HTMLElement>(href);
        if (target) {
          const offset = href === "#top" ? 0 : 80;
          document.dispatchEvent(
            new CustomEvent("portfolio:scroll", {
              detail: {
                top: Math.max(
                  0,
                  target.getBoundingClientRect().top + window.scrollY - offset,
                ),
                immediate: false,
              },
            }),
          );
        }
        target?.focus({ preventScroll: true });
        history.replaceState(null, "", href);
      } else opener.current?.focus();
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) done();
    else
      timeline.current = gsap
        .timeline({ onComplete: done })
        .to(".menu-inner", { y: -35, duration: 0.25 })
        .to(
          dialog.current,
          {
            clipPath: "inset(0 0 100% 0)",
            duration: 0.55,
            ease: "power3.inOut",
          },
          0,
        );
  };
  const show = () => {
    savedOverflow.current = document.body.style.overflow;
    dialog.current?.showModal();
    setOpen(true);
    document.documentElement.dataset.menu = "open";
    document.body.style.overflow = "hidden";
    document.dispatchEvent(
      new CustomEvent("portfolio:overlay", { detail: true }),
    );
    timeline.current?.kill();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timeline.current = gsap
        .timeline()
        .fromTo(
          dialog.current,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power3.inOut" },
        )
        .fromTo(".menu-inner", { y: 0 }, { y: 0, duration: 0.01 }, 0)
        .fromTo(
          ".menu-link",
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" },
          0.25,
        );
    } else gsap.set(dialog.current, { clipPath: "none" });
  };
  useEffect(
    () => () => {
      timeline.current?.kill();
    },
    [],
  );
  return (
    <>
      <header className="navigation">
        <a
          href="#top"
          className="identity-link"
          aria-label="Sujal Agarwal — beginning"
        >
          SA<span className="identity-mark">.</span>
        </a>
        <span id="nav-context" className="nav-context">
          Independent portfolio
        </span>
        <div className="nav-actions">
          <Link href="/projects" className="nav-work">
            GitHub Projects <span aria-hidden="true">↗</span>
          </Link>
          <a href="#work" className="nav-work">
            Explore the work <span aria-hidden="true">↓</span>
          </a>
          <button
            ref={opener}
            className="menu-button"
            onClick={show}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="portfolio-menu"
            data-cursor="MENU"
          >
            Menu{" "}
            <span className="menu-symbol" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        id="portfolio-menu"
        className="menu-dialog"
        aria-labelledby="menu-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <div className="menu-header">
          <span id="menu-title">Sujal Agarwal / Index</span>
          <button onClick={() => close()} className="text-action" autoFocus>
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="menu-inner">
          <nav aria-label="Main navigation">
            {links.map(([label, href], index) => (
              <div className="menu-link-mask" key={href}>
                <a
                  className="menu-link"
                  href={href}
                  onClick={(event) => {
                    event.preventDefault();
                    close(href);
                  }}
                >
                  <span className="menu-index">0{index + 1}</span>
                  {label}
                  <span className="menu-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            ))}
          </nav>
          <div className="menu-note">
            Software. Systems. Interaction.
            <br />
            An interactive portfolio.
          </div>
        </div>
      </dialog>
    </>
  );
}
