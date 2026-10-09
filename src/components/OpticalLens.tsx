"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type SceneName =
  | "hero"
  | "intro"
  | "optics"
  | "signal"
  | "structure"
  | "korridor"
  | "profile"
  | "inside"
  | "contact";
type SceneAnchor = { name: SceneName; top: number };
type ScenePose = { x: number; y: number; roll: number; scale: number };

const SCENE_SELECTOR = "section[data-scene]";
const SCENE_ORDER: SceneName[] = [
  "hero",
  "intro",
  "optics",
  "signal",
  "structure",
  "korridor",
  "profile",
  "inside",
  "contact",
];
const SCENES: Record<SceneName, ScenePose> = {
  hero: { x: 0.72, y: 0.49, roll: -0.17, scale: 1 },
  intro: { x: 0.23, y: 0.43, roll: 0.15, scale: 0.7 },
  optics: { x: 0.73, y: 0.4, roll: -0.12, scale: 0.8 },
  signal: { x: 0.83, y: 0.25, roll: 0.12, scale: 0.6 },
  structure: { x: 0.86, y: 0.2, roll: -0.1, scale: 0.48 },
  korridor: { x: 0.8, y: 0.35, roll: 0.12, scale: 0.5 },
  profile: { x: 0.83, y: 0.25, roll: 0.08, scale: 0.3 },
  inside: { x: 0.24, y: 0.3, roll: 0.1, scale: 0.35 },
  contact: { x: 0.5, y: 0.43, roll: 0.08, scale: 0.55 },
};
const TEXT_SELECTORS: Record<SceneName, string> = {
  hero: ".hero-title, .hero-reveal",
  intro: "h2",
  optics: "h2, .project-visual-type",
  signal: "h2, .project-visual-type",
  structure: "h2, .project-visual-type",
  korridor: "h2, .project-visual-type",
  profile: "h2, .profile-impact dd, .profile-grade dd, .profile-rank-number",
  inside: "h2",
  contact: ".contact-title",
};
const AVOID_SELECTORS: Partial<Record<SceneName, string>> = {
  optics: ".project-field-controls",
  signal: ".project-field-controls",
  structure: ".project-field-controls, .ordering-inspection",
  korridor: ".project-field-controls, .hostel-reading",
  profile: ".profile-timeline, .profile-foundations, .profile-recognition",
  inside: ".build-index",
  contact: ".contact-action",
};

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vLocalPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    // The object only uses uniform scale, so this is a valid normal transform.
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uTypography;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform vec2 uLensCenter;
  uniform float uAspect;
  uniform float uFocus;
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  float band(float value, float center, float width) {
    float distanceFromCenter = (value - center) / width;
    return exp(-distanceFromCenter * distanceFromCenter);
  }

  // An ivory editorial studio: broad softboxes, dark cards, no emissive lights.
  vec3 studio(vec3 direction) {
    vec3 ivory = vec3(0.94, 0.90, 0.79);
    vec3 olive = vec3(0.16, 0.18, 0.135);
    float sky = smoothstep(-0.7, 0.9, direction.y);
    vec3 result = mix(olive * 0.52, ivory * 0.68, sky);
    float softbox = band(direction.x + direction.y * 0.34, -0.40, 0.13);
    float rim = band(direction.x - direction.y * 0.22, 0.73, 0.055);
    float darkCard = band(direction.x + direction.y * 0.12, 0.16, 0.16);
    result *= 1.0 - darkCard * 0.67;
    result += ivory * (softbox * 0.68 + rim * 0.95);
    return result;
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    if (!gl_FrontFacing) normal = -normal;
    float facing = clamp(dot(normal, viewDirection), 0.0, 1.0);
    float fresnel = 0.043 + 0.957 * pow(1.0 - facing, 5.0);
    float edge = pow(1.0 - facing, 2.1);

    // Refract the active scene's viewport-aligned text, not a card attached
    // to the object. Slightly different indices split letter edges only.
    vec3 rayR = refract(-viewDirection, normal, 1.0 / 1.465);
    vec3 rayG = refract(-viewDirection, normal, 1.0 / 1.480);
    vec3 rayB = refract(-viewDirection, normal, 1.0 / 1.498);
    vec2 screenUV = gl_FragCoord.xy / uResolution;
    vec2 baseUV = uLensCenter + (screenUV - uLensCenter) * mix(0.96, 0.66, uFocus);
    vec2 screenScale = vec2(1.0 / uAspect, 1.0);
    baseUV += uPointer * screenScale * 0.006;
    float opticalDepth = mix(0.035, 0.31, uFocus) + 0.14 * (1.0 - facing);
    vec2 localCurve = vLocalPosition.xy / vec2(2.45, 2.95);
    vec2 bend = (normal.xy * 0.045 + localCurve * length(localCurve) * 0.055) * screenScale;
    vec2 uvR = baseUV + rayR.xy * screenScale * opticalDepth + bend;
    vec2 uvG = baseUV + rayG.xy * screenScale * opticalDepth + bend;
    vec2 uvB = baseUV + rayB.xy * screenScale * opticalDepth + bend;
    vec3 printColor = vec3(
      texture2D(uTypography, uvR).r,
      texture2D(uTypography, uvG).g,
      texture2D(uTypography, uvB).b
    );
    vec3 secondPrint = texture2D(uTypography, uvG + rayG.xy * screenScale * opticalDepth * 0.35).rgb;
    printColor = mix(printColor, secondPrint, 0.08 * (1.0 - facing));

    // Beer-Lambert-like absorption increases along oblique optical paths.
    float pathLength = 0.42 / max(facing, 0.24);
    vec3 absorption = exp(-vec3(0.78, 0.66, 0.91) * pathLength);
    vec3 transmitted = printColor * absorption;
    transmitted = mix(transmitted, vec3(0.23, 0.255, 0.19), 0.14);
    vec3 reflected = studio(reflect(-viewDirection, normal));
    vec3 color = mix(transmitted, reflected, clamp(fresnel + edge * 0.38, 0.0, 1.0));

    vec3 key = normalize(vec3(-0.65, 0.85, 1.0));
    vec3 halfDirection = normalize(key + viewDirection);
    float specular = pow(max(dot(normal, halfDirection), 0.0), 100.0);
    color += vec3(1.0, 0.96, 0.83) * specular * 0.55;
    float fineReflection = band(reflect(-viewDirection, normal).x, -0.64, 0.025);
    color += vec3(0.96, 0.91, 0.76) * fineReflection * edge * 0.32;

    // The center stays translucent; the thick polished rim reads almost solid.
    float alpha = clamp(0.52 + edge * 0.47, 0.0, 0.99);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function makeTypographyTexture(): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(document.createElement("canvas"));
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

type TextRun = {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
  font: string;
  size: number;
  lineHeight: number;
  tracking: string;
  color: string;
  opacity: number;
  clip: { left: number; top: number; right: number; bottom: number };
};

function drawTypography(
  texture: THREE.CanvasTexture,
  sceneName: SceneName,
  section: HTMLElement | undefined,
  width: number,
  height: number,
  mobile: boolean,
  lensX: number,
  lensY: number,
  previousSignature: string,
): string {
  const canvas = texture.image as HTMLCanvasElement;
  const resolution = Math.min(
    mobile ? 1 : 1.5,
    (mobile ? 1024 : 2048) / Math.max(width, height),
  );
  const textureWidth = Math.max(1, Math.round(width * resolution));
  const textureHeight = Math.max(1, Math.round(height * resolution));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Optical lens: 2D canvas is unavailable.");

  // These measurements are taken only after a relevant event, never while just
  // damping pointer/pose/focus. Range preserves inline spans, br and CSS wrapping.
  const styles = new Map<HTMLElement, CSSStyleDeclaration>();
  const styleOf = (element: HTMLElement) => {
    let style = styles.get(element);
    if (!style) {
      style = getComputedStyle(element);
      styles.set(element, style);
    }
    return style;
  };
  const field = section?.querySelector<HTMLElement>(
    ".study-visual, .hero-stage, .contact-reveal",
  );
  const fieldRect = field?.getBoundingClientRect();
  const inField =
    fieldRect &&
    lensX >= fieldRect.left &&
    lensX <= fieldRect.right &&
    lensY >= fieldRect.top &&
    lensY <= fieldRect.bottom;
  let backgroundElement: HTMLElement | null =
    (inField ? field : section) ?? document.body;
  let background = "transparent";
  while (backgroundElement) {
    background = styleOf(backgroundElement).backgroundColor;
    if (background !== "transparent" && background !== "rgba(0, 0, 0, 0)")
      break;
    backgroundElement = backgroundElement.parentElement;
  }
  const runs: TextRun[] = [];
  const range = document.createRange();
  section
    ?.querySelectorAll<HTMLElement>(TEXT_SELECTORS[sceneName])
    .forEach((source) => {
      const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent ?? "";
        const parent = node.parentElement;
        if (!text.trim() || !parent) continue;
        const style = styleOf(parent);
        const size = parseFloat(style.fontSize);
        if (!Number.isFinite(size) || size <= 0) continue;
        let opacity = 1;
        const clip = { left: 0, top: 0, right: width, bottom: height };
        for (
          let ancestor: HTMLElement | null = parent;
          ancestor;
          ancestor = ancestor.parentElement
        ) {
          const ancestorStyle = styleOf(ancestor);
          if (
            ancestorStyle.display === "none" ||
            ancestorStyle.visibility === "hidden"
          ) {
            opacity = 0;
            break;
          }
          opacity *= Number(ancestorStyle.opacity);
          const inset = ancestorStyle.clipPath.match(/^inset\(([^)]+)\)$/);
          if (inset) {
            const bounds = ancestor.getBoundingClientRect();
            const values = inset[1].trim().split(/\s+/);
            const sides = [
              values[0],
              values[1] ?? values[0],
              values[2] ?? values[0],
              values[3] ?? values[1] ?? values[0],
            ];
            const pixels = (value: string, length: number) =>
              parseFloat(value) * (value.endsWith("%") ? length / 100 : 1);
            clip.top = Math.max(
              clip.top,
              bounds.top + pixels(sides[0], bounds.height),
            );
            clip.right = Math.min(
              clip.right,
              bounds.right - pixels(sides[1], bounds.width),
            );
            clip.bottom = Math.min(
              clip.bottom,
              bounds.bottom - pixels(sides[2], bounds.height),
            );
            clip.left = Math.max(
              clip.left,
              bounds.left + pixels(sides[3], bounds.width),
            );
          }
          if (
            /hidden|clip|scroll|auto/.test(
              ancestorStyle.overflowX + ancestorStyle.overflowY,
            )
          ) {
            const bounds = ancestor.getBoundingClientRect();
            if (/hidden|clip|scroll|auto/.test(ancestorStyle.overflowX)) {
              clip.left = Math.max(clip.left, bounds.left);
              clip.right = Math.min(clip.right, bounds.right);
            }
            if (/hidden|clip|scroll|auto/.test(ancestorStyle.overflowY)) {
              clip.top = Math.max(clip.top, bounds.top);
              clip.bottom = Math.min(clip.bottom, bounds.bottom);
            }
          }
          if (ancestor === section) break;
        }
        if (
          opacity < 0.005 ||
          clip.right <= clip.left ||
          clip.bottom <= clip.top
        )
          continue;
        const addRun = (start: number, end: number) => {
          range.setStart(node, start);
          range.setEnd(node, end);
          const rect = range.getBoundingClientRect();
          if (
            rect.width <= 0 ||
            rect.height <= 0 ||
            rect.bottom <= clip.top ||
            rect.top >= clip.bottom ||
            rect.right <= clip.left ||
            rect.left >= clip.right
          )
            return;
          let content = text.slice(start, end).replace(/\s+/g, " ");
          if (style.textTransform === "uppercase")
            content = content.toLocaleUpperCase();
          if (style.textTransform === "lowercase")
            content = content.toLocaleLowerCase();
          runs.push({
            text: content,
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            font: `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`,
            size,
            lineHeight: parseFloat(style.lineHeight) || size * 1.2,
            tracking:
              style.letterSpacing === "normal" ? "0px" : style.letterSpacing,
            color: style.color,
            opacity,
            clip,
          });
        };
        range.selectNodeContents(node);
        if (range.getClientRects().length <= 1) {
          addRun(0, text.length);
        } else {
          // Split a wrapped text node into lines without re-laying it out in canvas.
          let start = 0;
          let lineTop: number | undefined;
          for (let offset = 0; offset < text.length;) {
            const next =
              offset + ((text.codePointAt(offset) ?? 0) > 0xffff ? 2 : 1);
            range.setStart(node, offset);
            range.setEnd(node, next);
            const rect = range.getBoundingClientRect();
            if (lineTop !== undefined && Math.abs(rect.top - lineTop) > 1) {
              addRun(start, offset);
              start = offset;
            }
            lineTop = rect.top;
            offset = next;
          }
          addRun(start, text.length);
        }
      }
    });

  // A dirty event needn't change the sampled text: do not upload identical pixels.
  const signature = JSON.stringify([
    sceneName,
    textureWidth,
    textureHeight,
    background,
    runs.map((run) => [
      run.text,
      ...[run.left, run.top, run.width, run.height].map((value) =>
        Math.round(value * 2),
      ),
      run.font,
      run.tracking,
      run.color,
      Math.round(run.opacity * 100),
      run.clip,
    ]),
  ]);
  if (signature === previousSignature) return signature;
  if (canvas.width !== textureWidth || canvas.height !== textureHeight)
    texture.dispose();
  canvas.width = textureWidth;
  canvas.height = textureHeight;
  context.setTransform(
    canvas.width / width,
    0,
    0,
    canvas.height / height,
    0,
    0,
  );
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.textBaseline = "alphabetic";
  for (const run of runs) {
    context.save();
    context.beginPath();
    context.rect(
      run.clip.left,
      run.clip.top,
      run.clip.right - run.clip.left,
      run.clip.bottom - run.clip.top,
    );
    context.clip();
    context.font = run.font;
    context.letterSpacing = run.tracking;
    const metrics = context.measureText(run.text);
    const ascent = metrics.fontBoundingBoxAscent ?? run.size * 0.8;
    const descent =
      metrics.fontBoundingBoxDescent ??
      Math.max(run.size * 0.2, run.lineHeight - ascent);
    context.translate(run.left, run.top);
    // Includes ancestor GSAP translation/scale. Rotated/3D text uses its AABB.
    context.scale(
      run.width / Math.max(metrics.width, 0.01),
      run.height / Math.max(ascent + descent, 1),
    );
    context.globalAlpha = run.opacity;
    context.fillStyle = run.color;
    context.fillText(run.text, 0, ascent);
    context.restore();
  }
  texture.needsUpdate = true;
  return signature;
}

function makeLensGeometry(mobile: boolean): THREE.ExtrudeGeometry {
  const width = 2.45;
  const height = 2.95;
  const radius = 0.64;
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(left + radius, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left + radius, top);
  shape.quadraticCurveTo(left, top, left, top - radius);
  shape.lineTo(left, bottom + radius);
  shape.quadraticCurveTo(left, bottom, left + radius, bottom);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.46,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: 0.15,
    bevelSize: 0.12,
    bevelSegments: mobile ? 5 : 9,
    curveSegments: mobile ? 16 : 28,
  });
  geometry.translate(0, 0, -0.23);
  return geometry;
}

/**
 * Lazy-load this client component from its parent with next/dynamic (ssr: false).
 * Section data-scene values are mapped by SCENES above.
 * Without sections, the same route is driven by document scroll progress.
 * --lens-focus (0–100) and optical:focus events control the refracted focal plane.
 * A parent menu can hide the canvas via the [data-optical-lens] selector.
 */
export default function OpticalLens() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let geometry: THREE.ExtrudeGeometry | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let typography: THREE.CanvasTexture | null = null;
    let frame = 0;
    let overlayPaused = !!document.querySelector("dialog[open]");
    let typographyTimer = 0;
    let disposed = false;
    let failed = false;
    let shaderError: {
      program: string | null;
      vertex: string | null;
      fragment: string | null;
    } | null = null;
    let ready = false;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let focusObserver: MutationObserver | null = null;
    const cleanups: Array<() => void> = [];

    const disposeResources = () => {
      geometry?.dispose();
      material?.dispose();
      typography?.dispose();
      // React can replay this effect on the same canvas in StrictMode or HMR.
      // Dispose GPU resources, but do not deliberately lose its reusable context.
      renderer?.dispose();
      geometry = null;
      material = null;
      typography = null;
      renderer = null;
    };

    const removeReadyState = () => {
      canvas.style.opacity = "0";
      if (ready && document.documentElement.dataset.webgl === "ready") {
        delete document.documentElement.dataset.webgl;
      }
      ready = false;
    };

    const fail = (reason: string, cause?: unknown) => {
      if (failed || disposed) return;
      failed = true;
      if (process.env.NODE_ENV !== "production") {
        console.error(
          `[OpticalLens] ${reason} Keeping the CSS fallback visible.`,
          cause ?? "",
        );
      }
      cancelAnimationFrame(frame);
      window.clearTimeout(typographyTimer);
      frame = 0;
      removeReadyState();
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      focusObserver?.disconnect();
      cleanups.splice(0).forEach((cleanup) => cleanup());
      disposeResources();
    };

    try {
      const mobileQuery = window.matchMedia("(max-width: 767px)");
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      let mobile = mobileQuery.matches;
      let reducedMotion = motionQuery.matches;
      let viewportWidth = Math.max(window.innerWidth, 1);
      let viewportHeight = Math.max(window.innerHeight, 1);
      let worldWidth = 1;
      let worldHeight = 1;
      let anchors: SceneAnchor[] = [];
      const sceneElements = new Map<SceneName, HTMLElement>();
      let sectionsDirty = true;
      let routeDirty = true;
      let baseScale = 1;
      let targetScale = 1;
      let typographySignature = "";
      let layoutDirty = true;
      let typographyDirty = true;
      const readFocus = () => {
        const value = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--lens-focus",
          ),
        );
        return (
          THREE.MathUtils.clamp(Number.isFinite(value) ? value : 50, 0, 100) /
          100
        );
      };
      let targetFocus = readFocus();
      let smoothedFocus = targetFocus;
      let interaction = 1;
      let progress = 0;
      let activeScene: SceneName = "hero";
      let previousTime = 0;
      let previousScrollY = window.scrollY;
      let previousScrollTime = performance.now();
      let velocity = 0;
      let pointerX = 0;
      let pointerY = 0;
      let smoothedPointerX = 0;
      let smoothedPointerY = 0;
      let targetX = SCENES.hero.x;
      let targetY = SCENES.hero.y;
      let targetRoll = SCENES.hero.roll;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
      camera.position.set(0, 0, 8);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !mobile,
        powerPreference: "low-power",
        premultipliedAlpha: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;

      typography = makeTypographyTexture();
      typography.anisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy(),
      );
      geometry = makeLensGeometry(mobile);
      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uTypography: { value: typography },
          uPointer: { value: new THREE.Vector2() },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uLensCenter: {
            value: new THREE.Vector2(SCENES.hero.x, 1 - SCENES.hero.y),
          },
          uAspect: { value: 1 },
          uFocus: { value: targetFocus },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      });
      // Shader compilation errors do not normally throw from renderer.render.
      renderer.debug.checkShaderErrors = true;
      renderer.debug.onShaderError = (
        gl,
        program,
        vertexShader,
        fragmentShader,
      ) => {
        shaderError = {
          program: gl.getProgramInfoLog(program),
          vertex: gl.getShaderInfoLog(vertexShader),
          fragment: gl.getShaderInfoLog(fragmentShader),
        };
      };
      const lens = new THREE.Mesh(geometry, material);
      lens.rotation.set(-0.2, -0.42, SCENES.hero.roll);
      scene.add(lens);
      const targetPosition = new THREE.Vector3();
      const targetRotation = new THREE.Vector3();
      const fromPose: ScenePose = { ...SCENES.hero };
      const toPose: ScenePose = { ...SCENES.hero };
      let initialPose = true;

      const collectSections = () => {
        const scrollY = window.scrollY;
        sceneElements.clear();
        anchors = Array.from(
          document.querySelectorAll<HTMLElement>(SCENE_SELECTOR),
        )
          .flatMap((section): SceneAnchor[] => {
            const name = section.dataset.scene;
            if (!name || !Object.prototype.hasOwnProperty.call(SCENES, name))
              return [];
            if (section.getClientRects().length === 0) return [];
            sceneElements.set(name as SceneName, section);
            return [
              {
                name: name as SceneName,
                top: section.getBoundingClientRect().top + scrollY,
              },
            ];
          })
          .sort((a, b) => a.top - b.top);
        sectionsDirty = false;
        routeDirty = true;
      };

      const measurePose = (name: SceneName, pose: ScenePose) => {
        Object.assign(pose, SCENES[name]);
        if (mobile && name !== "hero") {
          pose.scale = Math.min(pose.scale, 0.55);
          pose.x = name === "contact" ? 0.5 : 0.81;
          pose.y = 0.3;
        }
        const section = sceneElements.get(name);
        const field = section?.querySelector<HTMLElement>(".study-visual");
        const bounds = field?.getBoundingClientRect();
        if (bounds && bounds.bottom > 100 && bounds.top < viewportHeight) {
          const fieldX = name === "optics" ? (mobile ? 0.8 : 0.73) : 0.86;
          const fieldY =
            name === "optics" ? 0.3 : name === "signal" ? 0.17 : 0.1;
          pose.x = (bounds.left + bounds.width * fieldX) / viewportWidth;
          pose.y = (bounds.top + bounds.height * fieldY) / viewportHeight;
        }
        const header = mobile ? 80 : 95;
        const basePixelWidth =
          ((baseScale * 2.69) / worldWidth) * viewportWidth * 1.12;
        const basePixelHeight =
          ((baseScale * 3.19) / worldHeight) * viewportHeight * 1.12;
        let halfWidth = (basePixelWidth * pose.scale) / 2;
        let halfHeight = (basePixelHeight * pose.scale) / 2;
        let centerX = THREE.MathUtils.clamp(
          pose.x * viewportWidth,
          halfWidth + 12,
          viewportWidth - halfWidth - 12,
        );
        let centerY = pose.y * viewportHeight;
        const avoid = AVOID_SELECTORS[name];
        if (section && avoid) {
          const blockers = Array.from(
            section.querySelectorAll<HTMLElement>(avoid),
            (element) => element.getBoundingClientRect(),
          )
            .filter(
              (rect) =>
                rect.width > 0 &&
                rect.bottom > header &&
                rect.top < viewportHeight &&
                centerX + halfWidth > rect.left &&
                centerX - halfWidth < rect.right,
            )
            .sort((a, b) => a.top - b.top);
          // Choose a quiet vertical interval, rather than alternately jumping
          // above one control and below another overlapping control.
          const gaps: Array<{ top: number; bottom: number }> = [];
          let cursor = header;
          for (const rect of blockers) {
            if (rect.top - 12 > cursor)
              gaps.push({ top: cursor, bottom: rect.top - 12 });
            cursor = Math.max(cursor, rect.bottom + 12);
          }
          if (cursor < viewportHeight - 16)
            gaps.push({ top: cursor, bottom: viewportHeight - 16 });
          let bestGap: { top: number; bottom: number } | undefined;
          let bestScore = Infinity;
          for (const gap of gaps) {
            const available = gap.bottom - gap.top;
            if (available < 32) continue;
            const fittedHalfHeight = Math.min(halfHeight, available / 2);
            const fittedY = THREE.MathUtils.clamp(
              centerY,
              gap.top + fittedHalfHeight,
              gap.bottom - fittedHalfHeight,
            );
            const score =
              Math.abs(fittedY - centerY) +
              Math.max(0, halfHeight * 2 - available) * 0.5;
            if (score < bestScore) {
              bestGap = gap;
              bestScore = score;
            }
          }
          if (bestGap) {
            pose.scale = Math.min(
              pose.scale,
              (bestGap.bottom - bestGap.top) / basePixelHeight,
            );
            halfWidth = (basePixelWidth * pose.scale) / 2;
            halfHeight = (basePixelHeight * pose.scale) / 2;
            centerY = THREE.MathUtils.clamp(
              centerY,
              bestGap.top + halfHeight,
              bestGap.bottom - halfHeight,
            );
          }
        }
        // The hero retains its established framing; smaller scenes keep clear
        // of the navigation and allow the upper-right field position on mobile.
        if (name !== "hero") {
          centerX = THREE.MathUtils.clamp(
            centerX,
            halfWidth + 12,
            viewportWidth - halfWidth - 12,
          );
          centerY = THREE.MathUtils.clamp(
            centerY,
            header + halfHeight,
            viewportHeight - halfHeight - 16,
          );
        } else if (mobile) {
          centerX = THREE.MathUtils.clamp(
            centerX,
            viewportWidth * 0.29,
            viewportWidth * 0.71,
          );
        }
        pose.x = centerX / viewportWidth;
        pose.y = centerY / viewportHeight;
      };

      const updateRoute = () => {
        const scrollY = Math.max(0, window.scrollY);
        const maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - viewportHeight,
        );
        progress =
          maxScroll > 0 ? THREE.MathUtils.clamp(scrollY / maxScroll, 0, 1) : 0;
        let from: SceneName;
        let to: SceneName;
        let blend: number;

        if (anchors.length > 0) {
          from = anchors[0].name;
          to = from;
          blend = 0;
          for (let index = 1; index < anchors.length; index += 1) {
            const next = anchors[index];
            // Hold each composition until the next section enters the viewport.
            // Clamp arrival to maxScroll so even a short contact section settles.
            const end = THREE.MathUtils.clamp(
              next.top - viewportHeight * 0.25,
              0,
              maxScroll,
            );
            const previousEnd = THREE.MathUtils.clamp(
              anchors[index - 1].top - viewportHeight * 0.25,
              0,
              maxScroll,
            );
            const start = Math.max(
              previousEnd,
              Math.max(0, next.top - viewportHeight * 0.85),
            );
            if (scrollY >= end) {
              from = next.name;
              to = from;
              continue;
            }
            if (scrollY > start) {
              to = next.name;
              blend = THREE.MathUtils.clamp(
                (scrollY - start) / Math.max(1, end - start),
                0,
                1,
              );
            }
            break;
          }
        } else {
          const segment = progress * (SCENE_ORDER.length - 1);
          const index = Math.min(Math.floor(segment), SCENE_ORDER.length - 2);
          from = SCENE_ORDER[index];
          to = SCENE_ORDER[index + 1];
          blend = segment - index;
        }
        blend = blend * blend * (3 - 2 * blend);
        const nextScene = blend < 0.5 ? from : to;
        if (nextScene !== activeScene) typographyDirty = true;
        activeScene = nextScene;
        measurePose(from, fromPose);
        measurePose(to, toPose);
        targetX = THREE.MathUtils.lerp(fromPose.x, toPose.x, blend);
        targetY = THREE.MathUtils.lerp(fromPose.y, toPose.y, blend);
        targetRoll = THREE.MathUtils.lerp(fromPose.roll, toPose.roll, blend);
        targetScale =
          baseScale * THREE.MathUtils.lerp(fromPose.scale, toPose.scale, blend);
        const response = (name: SceneName) =>
          name === "contact" ? 0 : name === "hero" ? 1 : 0.2;
        interaction = THREE.MathUtils.lerp(response(from), response(to), blend);
        routeDirty = false;
        canvas.dataset.scene = activeScene;
        canvas.style.setProperty("--lens-x", `${(targetX * 100).toFixed(2)}%`);
        canvas.style.setProperty("--lens-y", `${(targetY * 100).toFixed(2)}%`);
        canvas.style.setProperty("--lens-progress", progress.toFixed(4));
        canvas.style.setProperty(
          "--lens-scale",
          (targetScale / baseScale).toFixed(4),
        );
      };

      const resize = () => {
        if (!renderer) return;
        viewportWidth = Math.max(window.innerWidth, 1);
        viewportHeight = Math.max(window.innerHeight, 1);
        camera.aspect = viewportWidth / viewportHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5),
        );
        renderer.setSize(viewportWidth, viewportHeight, false);
        if (material) {
          renderer.getDrawingBufferSize(material.uniforms.uResolution.value);
          material.uniforms.uAspect.value = camera.aspect;
        }
        targetFocus = readFocus();
        typographyDirty = true;
        worldHeight =
          2 *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          camera.position.z;
        worldWidth = worldHeight * camera.aspect;
        const desiredWidth = worldWidth * (mobile ? 0.43 : 0.28);
        baseScale = Math.min(
          desiredWidth / 2.69,
          (worldHeight * (mobile ? 0.48 : 0.72)) / 3.19,
        );
        routeDirty = true;
        layoutDirty = false;
        sectionsDirty = true;
      };

      const requestFrame = () => {
        if (
          !frame &&
          !disposed &&
          !failed &&
          !document.hidden &&
          !overlayPaused
        ) {
          frame = window.requestAnimationFrame(render);
        }
      };

      const render = (time: number) => {
        frame = 0;
        if (
          disposed ||
          failed ||
          document.hidden ||
          overlayPaused ||
          !renderer ||
          !material
        )
          return;
        try {
          if (layoutDirty) resize();
          if (sectionsDirty) collectSections();
          if (routeDirty) updateRoute();
          if (typographyDirty && typography) {
            typographySignature = drawTypography(
              typography,
              activeScene,
              sceneElements.get(activeScene),
              viewportWidth,
              viewportHeight,
              mobile,
              targetX * viewportWidth,
              targetY * viewportHeight,
              typographySignature,
            );
            typographyDirty = false;
          }
          const dt = previousTime
            ? Math.min((time - previousTime) / 1000, 0.05)
            : 1 / 60;
          previousTime = time;
          const damping = 1 - Math.exp(-dt * 7.5);
          if (reducedMotion) {
            smoothedPointerX = 0;
            smoothedPointerY = 0;
            velocity = 0;
          } else {
            smoothedPointerX = THREE.MathUtils.lerp(
              smoothedPointerX,
              pointerX,
              damping,
            );
            smoothedPointerY = THREE.MathUtils.lerp(
              smoothedPointerY,
              pointerY,
              damping,
            );
            velocity *= Math.exp(-dt * 5.5);
          }
          if (interaction === 0) velocity = 0;
          smoothedFocus =
            initialPose || reducedMotion
              ? targetFocus
              : THREE.MathUtils.lerp(smoothedFocus, targetFocus, damping);
          if (Math.abs(smoothedFocus - targetFocus) < 0.0001)
            smoothedFocus = targetFocus;

          const pointerAmount =
            mobile || reducedMotion ? 0 : 0.035 * interaction;
          targetPosition.set(
            (targetX - 0.5 + smoothedPointerX * pointerAmount) * worldWidth,
            (0.5 - targetY - smoothedPointerY * pointerAmount) * worldHeight,
            0,
          );
          targetRotation.set(
            -0.2 + smoothedPointerY * (reducedMotion ? 0 : 0.11) * interaction,
            -0.42 + smoothedPointerX * (reducedMotion ? 0 : 0.16) * interaction,
            targetRoll +
              THREE.MathUtils.clamp(velocity * 0.055, -0.12, 0.12) *
                interaction,
          );
          const snap = initialPose || reducedMotion;
          lens.position.lerp(targetPosition, snap ? 1 : damping);
          const nextScale = THREE.MathUtils.lerp(
            lens.scale.x,
            targetScale,
            snap ? 1 : damping,
          );
          lens.scale.setScalar(
            Math.abs(nextScale - targetScale) < 0.0001
              ? targetScale
              : nextScale,
          );
          lens.rotation.x = THREE.MathUtils.lerp(
            lens.rotation.x,
            targetRotation.x,
            snap ? 1 : damping,
          );
          lens.rotation.y = THREE.MathUtils.lerp(
            lens.rotation.y,
            targetRotation.y,
            snap ? 1 : damping,
          );
          lens.rotation.z = THREE.MathUtils.lerp(
            lens.rotation.z,
            targetRotation.z,
            snap ? 1 : damping,
          );
          material.uniforms.uPointer.value.set(
            smoothedPointerX * interaction,
            smoothedPointerY * interaction,
          );
          material.uniforms.uFocus.value = smoothedFocus;
          material.uniforms.uLensCenter.value.set(
            lens.position.x / worldWidth + 0.5,
            lens.position.y / worldHeight + 0.5,
          );
          renderer.render(scene, camera);
          // Only a successful, compiled first frame is allowed to hide the fallback.
          if (shaderError) {
            fail(
              "The optical shader could not compile or link.",
              JSON.stringify(shaderError, null, 2),
            );
            return;
          }
          if (renderer.getContext().isContextLost()) {
            fail("The WebGL context was lost during rendering.");
            return;
          }
          if (!ready) {
            ready = true;
            canvas.style.opacity = "1";
            document.documentElement.dataset.webgl = "ready";
          }
          initialPose = false;
          const unsettled =
            lens.position.distanceToSquared(targetPosition) > 0.000001 ||
            Math.abs(lens.rotation.x - targetRotation.x) > 0.0003 ||
            Math.abs(lens.rotation.y - targetRotation.y) > 0.0003 ||
            Math.abs(lens.rotation.z - targetRotation.z) > 0.0003 ||
            Math.abs(smoothedPointerX - pointerX) > 0.001 ||
            Math.abs(smoothedPointerY - pointerY) > 0.001 ||
            Math.abs(velocity) > 0.001 ||
            Math.abs(smoothedFocus - targetFocus) > 0.0001 ||
            Math.abs(lens.scale.x - targetScale) > 0.0001;
          if (!reducedMotion && unsettled) requestFrame();
        } catch (error) {
          fail("Rendering the optical lens threw an exception.", error);
        }
      };

      const queueTypographySnapshot = (delay: number) => {
        window.clearTimeout(typographyTimer);
        // One trailing event snapshot catches GSAP scrub/CSS transition settling,
        // without following every animation tick or starting a permanent loop.
        typographyTimer = window.setTimeout(() => {
          if (disposed || failed) return;
          typographyDirty = true;
          routeDirty = true;
          requestFrame();
        }, delay);
      };
      const onInput = (event: Event) => {
        const target = event.target;
        if (
          !(target instanceof HTMLElement) ||
          target.closest(SCENE_SELECTOR)?.getAttribute("data-scene") !==
            activeScene
        )
          return;
        if (
          target.id === "signal-input" ||
          target.id === "separation" ||
          target.id === "focus"
        ) {
          typographyDirty = true;
          routeDirty = true;
          queueTypographySnapshot(target.id === "separation" ? 450 : 100);
          requestFrame();
        }
      };
      const onScroll = () => {
        const now = performance.now();
        const scrollY = window.scrollY;
        const elapsed = Math.max(16, now - previousScrollTime);
        velocity = reducedMotion
          ? 0
          : THREE.MathUtils.clamp(
              ((scrollY - previousScrollY) / viewportHeight) * (1000 / elapsed),
              -2,
              2,
            );
        if (Math.abs(scrollY - previousScrollY) > 0.1) {
          routeDirty = true;
          typographyDirty = true;
          queueTypographySnapshot(750);
        }
        previousScrollY = scrollY;
        previousScrollTime = now;
        requestFrame();
      };
      const onPointerMove = (event: PointerEvent) => {
        if (
          reducedMotion ||
          mobile ||
          interaction === 0 ||
          event.pointerType === "touch"
        )
          return;
        pointerX = THREE.MathUtils.clamp(
          (event.clientX / viewportWidth) * 2 - 1,
          -1,
          1,
        );
        pointerY = THREE.MathUtils.clamp(
          (event.clientY / viewportHeight) * 2 - 1,
          -1,
          1,
        );
        requestFrame();
      };
      const onPointerLeave = () => {
        pointerX = 0;
        pointerY = 0;
        requestFrame();
      };
      const onResize = () => {
        const nextMobile = mobileQuery.matches;
        if (nextMobile !== mobile) {
          mobile = nextMobile;
          const nextGeometry = makeLensGeometry(mobile);
          lens.geometry = nextGeometry;
          geometry?.dispose();
          geometry = nextGeometry;
          pointerX = 0;
          pointerY = 0;
        }
        layoutDirty = true;
        requestFrame();
      };
      const onFocusChange = (event?: Event) => {
        const detail: unknown = (event as CustomEvent<unknown> | undefined)
          ?.detail;
        // The portfolio emits a plain Event after updating CSS; numeric custom
        // events are also accepted for integrations that do not write the CSS.
        const nextFocus =
          typeof detail === "number" && Number.isFinite(detail)
            ? THREE.MathUtils.clamp(detail, 0, 100) / 100
            : readFocus();
        if (nextFocus === targetFocus) return;
        targetFocus = nextFocus;
        if (activeScene === "optics") typographyDirty = true;
        requestFrame();
      };
      const onFontsReady = () => {
        if (disposed || failed) return;
        typographyDirty = true;
        queueTypographySnapshot(1500);
        invalidateSections();
      };
      const onMotionChange = () => {
        reducedMotion = motionQuery.matches;
        pointerX = 0;
        pointerY = 0;
        previousTime = 0;
        typographyDirty = true;
        layoutDirty = true;
        requestFrame();
      };
      const onVisibilityChange = () => {
        if (document.hidden) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else {
          previousTime = 0;
          previousScrollY = window.scrollY;
          previousScrollTime = performance.now();
          velocity = 0;
          sectionsDirty = true;
          typographyDirty = true;
          targetFocus = readFocus();
          requestFrame();
        }
      };
      const onOverlay = (event: Event) => {
        overlayPaused = (event as CustomEvent<boolean>).detail;
        if (overlayPaused) {
          cancelAnimationFrame(frame);
          frame = 0;
          window.clearTimeout(typographyTimer);
        } else {
          previousTime = 0;
          typographyDirty = true;
          routeDirty = true;
          requestFrame();
        }
      };
      const onContextLost = (event: Event) => {
        event.preventDefault();
        fail("The browser emitted webglcontextlost.");
      };
      const invalidateSections = () => {
        sectionsDirty = true;
        requestFrame();
      };
      const onSceneResize = () => {
        typographyDirty = true;
        invalidateSections();
      };
      const listen = (
        target: EventTarget,
        type: string,
        listener: EventListener,
        passive = true,
      ) => {
        target.addEventListener(type, listener, { passive });
        cleanups.push(() => target.removeEventListener(type, listener));
      };
      listen(document, "portfolio:overlay", onOverlay);
      listen(document, "input", onInput);
      listen(window, "optical:focus", onFocusChange);
      listen(window, "scroll", onScroll);
      listen(window, "resize", onResize);
      listen(window, "pointermove", onPointerMove as EventListener);
      listen(document.documentElement, "pointerleave", onPointerLeave);
      listen(window, "blur", onPointerLeave);
      listen(document, "visibilitychange", onVisibilityChange);
      listen(canvas, "webglcontextlost", onContextLost, false);
      listen(motionQuery, "change", onMotionChange);
      listen(mobileQuery, "change", onResize);
      listen(document, "load", invalidateSections);
      if (document.fonts) {
        listen(document.fonts, "loadingdone", onFontsReady);
        void document.fonts.ready.then(onFontsReady);
      }

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(onSceneResize);
        resizeObserver.observe(document.documentElement);
        resizeObserver.observe(document.body);
        document
          .querySelectorAll(SCENE_SELECTOR)
          .forEach((section) => resizeObserver?.observe(section));
      }
      if (typeof MutationObserver !== "undefined") {
        focusObserver = new MutationObserver(() => onFocusChange());
        // Watch CSS-only slider updates without polling or observing our own
        // per-frame canvas styles. Class changes may also change inherited focus.
        focusObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
        focusObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
        mutationObserver = new MutationObserver((records) => {
          let topologyChanged = false;
          let activeTextChanged = false;
          let activeLayoutChanged = false;
          for (const record of records) {
            const element =
              record.target instanceof HTMLElement
                ? record.target
                : record.target.parentElement;
            if (
              !element ||
              element === canvas ||
              element === document.documentElement
            )
              continue;
            const section = element.closest<HTMLElement>(SCENE_SELECTOR);
            if (section?.dataset.scene === activeScene) {
              activeLayoutChanged = true;
              if (
                element.closest(TEXT_SELECTORS[activeScene]) ||
                record.target === section
              )
                activeTextChanged = true;
            }
            if (
              record.type === "attributes" &&
              record.attributeName === "data-scene"
            )
              topologyChanged = true;
            if (record.type === "childList") {
              for (const node of [
                ...record.addedNodes,
                ...record.removedNodes,
              ]) {
                if (
                  node instanceof HTMLElement &&
                  (node.matches(SCENE_SELECTOR) ||
                    node.querySelector(SCENE_SELECTOR))
                ) {
                  topologyChanged = true;
                }
              }
            }
          }
          if (topologyChanged && resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver.observe(document.documentElement);
            resizeObserver.observe(document.body);
            document
              .querySelectorAll(SCENE_SELECTOR)
              .forEach((section) => resizeObserver?.observe(section));
          }
          if (activeTextChanged || topologyChanged) typographyDirty = true;
          if (activeLayoutChanged || topologyChanged) invalidateSections();
        });
        mutationObserver.observe(document.body, {
          childList: true,
          characterData: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["data-scene", "class", "hidden"],
        });
      }
      requestFrame();
    } catch (error) {
      fail("Initializing the optical lens threw an exception.", error);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(typographyTimer);
      cleanups.splice(0).forEach((cleanup) => cleanup());
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      focusObserver?.disconnect();
      removeReadyState();
      disposeResources();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-optical-lens=""
      aria-hidden="true"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        zIndex: 3,
        opacity: 0,
      }}
    />
  );
}
