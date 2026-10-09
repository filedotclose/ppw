"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function MotionSystem() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    const media = gsap.matchMedia();
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    const overlay = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) lenis?.stop();
      else lenis?.start();
    };
    const visibility = () => {
      if (document.hidden) lenis?.stop();
      else if (!document.querySelector("dialog[open]")) lenis?.start();
    };
    const navigate = (event: Event) => {
      const request = (
        event as CustomEvent<number | { top: number; immediate?: boolean }>
      ).detail;
      const { top, immediate } =
        typeof request === "number"
          ? { top: request, immediate: true }
          : request;
      if (lenis) lenis.scrollTo(top, { immediate, force: true });
      else window.scrollTo({ top, behavior: "instant" });
    };
    document.addEventListener("portfolio:scroll", navigate);
    document.addEventListener("portfolio:overlay", overlay);
    document.addEventListener("visibilitychange", visibility);

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const fine = matchMedia("(pointer: fine)").matches;
      lenis = new Lenis({
        duration: 1.2,
        easing: (progress) => Math.min(1, 1.001 - Math.pow(2, -10 * progress)),
        smoothWheel: true,
        anchors: { offset: -24 },
        syncTouch: false,
        autoRaf: false,
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
      entrance
        .fromTo(
          ".hero-word > span",
          { yPercent: 110, rotate: 3 },
          { yPercent: 0, rotate: 0, duration: 1.25, stagger: 0.13 },
          0.15,
        )
        .fromTo(
          ".hero-caption, .hero-foot",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
          1.05,
        );

      const hero = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
        },
      });
      hero
        .to(
          ".hero-word--first",
          { xPercent: -42, yPercent: -65, scale: 1.17, ease: "none" },
          0,
        )
        .to(
          ".hero-word--second",
          { xPercent: 35, yPercent: 110, scale: 1.12, ease: "none" },
          0,
        )
        .fromTo(
          ".hero-caption, .hero-foot",
          { y: 0, opacity: 1 },
          { y: -40, opacity: 0, duration: 0.25, immediateRender: false },
          0,
        )
        .to(".hero-stage", { backgroundColor: "#d2c9b6", ease: "none" }, 0)
        .fromTo(
          ".hero-reveal",
          { clipPath: "inset(50% 0 50% 0)" },
          { clipPath: "inset(0% 0 0% 0)", ease: "none", duration: 0.5 },
          0.5,
        );

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".intro",
            start: "top 85%",
            end: "bottom 30%",
            scrub: 0.65,
          },
        })
        .fromTo(
          ".intro-line--one",
          { xPercent: -8 },
          { xPercent: 5, ease: "none" },
          0,
        )
        .fromTo(
          ".intro-line--two",
          { xPercent: 12 },
          { xPercent: -4, ease: "none" },
          0,
        )
        .fromTo(
          ".intro-line--three",
          { xPercent: -3 },
          { xPercent: 7, ease: "none" },
          0,
        );

      gsap.utils.toArray<HTMLElement>(".study").forEach((scene) => {
        const media = scene.querySelector(".study-visual");
        const title = scene.querySelector(".study-title");
        gsap
          .timeline({
            scrollTrigger: {
              trigger: scene,
              start: "top 92%",
              end: "top 18%",
              scrub: 0.6,
            },
          })
          .fromTo(
            media,
            { clipPath: "inset(12% 8% 12% 8%)", scale: 0.92 },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1, ease: "none" },
            0,
          )
          .fromTo(title, { x: fine ? 100 : 24 }, { x: 0, ease: "none" }, 0);
      });
      gsap.utils.toArray<HTMLElement>(".scene-bridge").forEach((bridge) => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: bridge,
              start: "top 70%",
              end: "bottom bottom",
              scrub: 0.55,
            },
          })
          .to(
            bridge.querySelector(".bridge-before span"),
            { xPercent: -45, scale: 1.15, ease: "none" },
            0,
          )
          .to(
            bridge.querySelector(".bridge-after"),
            { clipPath: "inset(0 0% 0 0)", ease: "none" },
            0,
          )
          .fromTo(
            bridge.querySelector(".bridge-after span"),
            { xPercent: 55 },
            { xPercent: 0, ease: "none" },
            0,
          );
      });
      if (document.querySelector(".contact")) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".contact",
              start: "top 95%",
              end: "top 20%",
              scrub: 0.6,
            },
          })
          .fromTo(
            ".contact-reveal",
            { clipPath: "inset(0 48% 0 48%)" },
            { clipPath: "inset(0 0% 0 0%)", ease: "none" },
            0,
          )
          .fromTo(
            ".contact-title",
            { scale: 0.65, y: 120 },
            { scale: 1, y: 0, ease: "none" },
            0,
          );
      }
      return () => {
        if (tick) gsap.ticker.remove(tick);
        lenis?.destroy();
        lenis = undefined;
      };
    });

    const scenes = document.querySelectorAll<HTMLElement>(
      "section[data-scene], .scene-bridge[data-scene]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.documentElement.dataset.scene = (
              entry.target as HTMLElement
            ).dataset.scene;
            const context = document.getElementById("nav-context");
            if (context)
              context.textContent =
                (entry.target as HTMLElement).dataset.context || "Portfolio";
          }
        });
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: 0 },
    );
    scenes.forEach((scene) => observer.observe(scene));
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    return () => {
      media.revert();
      gsap.ticker.lagSmoothing(500, 33);
      observer.disconnect();
      document.removeEventListener("portfolio:scroll", navigate);
      document.removeEventListener("portfolio:overlay", overlay);
      document.removeEventListener("visibilitychange", visibility);
      delete document.documentElement.dataset.scene;
    };
  }, []);
  return null;
}
