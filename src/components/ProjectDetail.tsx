import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Project } from "@/data/portfolio";
import VectorArrow from "./VectorArrow";

export default function ProjectDetail({
  project,
  onClose,
  onNext,
}: {
  project: Project | null;
  onClose: () => void;
  onNext: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!project || !element) return;
    opener.current = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.detail = "open";
    document.dispatchEvent(
      new CustomEvent("portfolio:overlay", { detail: true }),
    );
    const animation = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? null
      : gsap.fromTo(
          element,
          { clipPath: "inset(30% 12% 30% 12%)", scale: 0.94 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            duration: 0.7,
            ease: "power3.inOut",
          },
        );
    return () => {
      animation?.kill();
      element.close();
      document.body.style.overflow = overflow;
      document.documentElement.removeAttribute("data-detail");
      document.dispatchEvent(
        new CustomEvent("portfolio:overlay", { detail: false }),
      );
      opener.current?.focus({ preventScroll: true });
    };
  }, [project]);
  const close = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) onClose();
    else
      gsap.to(dialog.current, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.45,
        ease: "power3.inOut",
        onComplete: onClose,
      });
  };
  return (
    <dialog
      ref={dialog}
      className={`detail-dialog detail-dialog--${project?.scene || "optics"}`}
      aria-labelledby="detail-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      data-lenis-prevent
    >
      {project && (
        <>
          <div className="detail-header">
            <span>
              Project {project.number} / {project.discipline}
            </span>
            <button className="text-action" onClick={close} autoFocus>
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="detail-content">
            <p className="eyebrow">Selected work / Sujal Agarwal</p>
            <h2 id="detail-title">{project.title}</h2>
            <p className="detail-lead">{project.description}</p>
            <div className="detail-columns">
              <section>
                <h3>01 / Purpose</h3>
                <p>{project.context}</p>
              </section>
              <section>
                <h3>02 / My implementation</h3>
                <p>{project.implementation}</p>
              </section>
              <section>
                <h3>03 / Technical context</h3>
                <p>{project.detail}</p>
                <ul className="tool-list">
                  {project.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </section>
            </div>
            <button
              className="detail-next text-action"
              onClick={() => {
                dialog.current?.scrollTo(0, 0);
                onNext();
              }}
              data-cursor="NEXT"
            >
              Next project <VectorArrow direction="up-right" />
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
