"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const query = matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let cleanup = () => {};
    const setup = () => {
      cleanup();
      if (!query.matches || !ref.current) return;
      const element = ref.current;
      const span = element.querySelector("span");
      let x = -100,
        y = -100,
        tx = -100,
        ty = -100,
        frame = 0;
      const render = () => {
        x += (tx - x) * 0.4;
        y += (ty - y) * 0.4;
        element.style.transform = `translate3d(${x}px,${y}px,0)`;
        if (Math.abs(tx - x) + Math.abs(ty - y) > 0.1)
          frame = requestAnimationFrame(render);
        else frame = 0;
      };
      const move = (event: PointerEvent) => {
        tx = event.clientX;
        ty = event.clientY;
        element.dataset.visible = "true";
        const target = (
          event.target instanceof Element
            ? event.target
            : (event.target as Node | null)?.parentElement
        )?.closest<HTMLElement>(
          "[data-cursor], a, button, input, textarea, summary",
        );
        element.dataset.state = target ? "active" : "default";
        if (span) {
          span.textContent = target?.dataset.cursor || "";
        }
        if (!frame) frame = requestAnimationFrame(render);
      };
      const leave = () => {
        element.dataset.visible = "false";
      };
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerleave", leave);
        element.dataset.visible = "false";
      };
    };
    setup();
    query.addEventListener("change", setup);
    return () => {
      cleanup();
      query.removeEventListener("change", setup);
    };
  }, []);
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <span />
    </div>
  );
}
