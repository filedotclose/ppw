import type { Metadata } from "next";
import GitHubProjectsShowcase from "@/components/GitHubProjectsShowcase";
import "./projects.css";

export const metadata: Metadata = {
  title: "Projects Showcase — Sujal Agarwal (@filedotclose)",
  description:
    "Interactive architectural schematics and engineering showcase of Sujal Agarwal's open-source projects on GitHub, including KSAC Gatepass, AI Review System, Gesture-MIDI, KLICK, and more with GSAP horizontal scroll.",
};

export default function ProjectsPage() {
  return <GitHubProjectsShowcase />;
}
