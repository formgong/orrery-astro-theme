/**
 * The three canvas visuals, in one small dependency-free script:
 *   plexus  rotating 3D particle network (hero)
 *   flow    drifting lines (media panel)
 *   wave    3D field of dots rolling like a swell (footer)
 *
 * Usage: <canvas data-scene="plexus|flow|wave" aria-hidden="true"></canvas>
 * Line and dot color = the canvas's CSS `color`; accent = its --accent.
 * Device pixel ratio is capped at 2. A scene draws only while it is on screen
 * and the tab is visible. With prefers-reduced-motion: reduce it draws one
 * still frame and never animates.
 */

type Draw = (c: CanvasRenderingContext2D, w: number, h: number, t: number, ink: string, accent: string) => void;

const TAU = Math.PI * 2;

/** Seeded random numbers, so every visitor gets the same network. */
function random(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

function plexus(): Draw {
  const rnd = random(11);
  const pts: number[][] = [];
  // Points on and inside a squashed sphere.
  for (let i = 0; i < 160; i++) {
    const u = rnd() * 2 - 1;
    const a = rnd() * TAU;
    const r = 0.6 + rnd() * 0.4;
    const s = Math.sqrt(1 - u * u) * r;
    pts.push([s * Math.cos(a) * 1.3, u * r * 0.72, s * Math.sin(a)]);
  }
  // The network turns as one rigid body, so neighbours never change: link them once.
  const links: number[] = [];
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const [a, b] = [pts[i], pts[j]];
      if (Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 0.4) links.push(i, j);
    }
  const xy = new Float32Array(pts.length * 3);

  return (c, w, h, t, ink, accent) => {
    const turn = t * 0.00009;
    const [cy, sy, cx, sx] = [Math.cos(turn), Math.sin(turn), Math.cos(0.35), Math.sin(0.35)];
    const scale = Math.min(w / 2.7, h / 1.7);
    pts.forEach(([x, y, z], i) => {
      const x1 = x * cy + z * sy;
      const z1 = z * cy - x * sy;
      const y1 = y * cx - z1 * sx;
      const z2 = z1 * cx + y * sx;
      const f = 2.6 / (2.6 + z2);
      xy[i * 3] = w / 2 + x1 * scale * f;
      xy[i * 3 + 1] = h / 2 + y1 * scale * f;
      xy[i * 3 + 2] = (1.2 - z2) / 2.4; // 0 far … 1 near
    });
    // Links in four brightness bands: four strokes per frame instead of one per line.
    c.strokeStyle = ink;
    c.lineWidth = 0.7;
    for (let band = 0; band < 4; band++) {
      c.beginPath();
      for (let k = 0; k < links.length; k += 2) {
        const i = links[k] * 3;
        const j = links[k + 1] * 3;
        if (Math.min(3, Math.floor((xy[i + 2] + xy[j + 2]) * 2)) !== band) continue;
        c.moveTo(xy[i], xy[i + 1]);
        c.lineTo(xy[j], xy[j + 1]);
      }
      c.globalAlpha = 0.07 + band * 0.07;
      c.stroke();
    }
    for (let i = 0; i < pts.length; i++) {
      const d = xy[i * 3 + 2];
      c.globalAlpha = 0.35 + d * 0.6;
      c.fillStyle = i % 9 ? ink : accent;
      c.beginPath();
      c.arc(xy[i * 3], xy[i * 3 + 1], 0.8 + d * 1.6, 0, TAU);
      c.fill();
    }
  };
}

function flow(): Draw {
  return (c, w, h, t, ink, accent) => {
    const lines = 26;
    const step = w / 48;
    c.lineWidth = 1;
    for (let i = 0; i < lines; i++) {
      c.beginPath();
      for (let k = 0; k <= 48; k++) {
        const y =
          h * (0.12 + (0.76 * i) / lines) +
          Math.sin(k * 0.16 + i * 0.45 + t * 0.0005) * h * 0.07 +
          Math.sin(k * 0.06 - t * 0.0003 + i * 0.21) * h * 0.11;
        k ? c.lineTo(k * step, y) : c.moveTo(0, y);
      }
      const lit = i % 7 === 3;
      c.strokeStyle = lit ? accent : ink;
      c.globalAlpha = lit ? 0.55 : 0.14 + (i % 3) * 0.06;
      c.stroke();
    }
  };
}

function wave(): Draw {
  return (c, w, h, t, ink) => {
    const cols = 70;
    const rows = 26;
    c.fillStyle = ink;
    for (let r = 0; r < rows; r++) {
      const z = r / (rows - 1); // 0 far … 1 near
      const f = 1 / (1.9 - z * 1.3);
      c.globalAlpha = 0.12 + z * 0.55;
      const size = 0.8 + z * 1.8;
      for (let k = 0; k < cols; k++) {
        const x = (k / (cols - 1)) * 2 - 1;
        const lift = Math.sin(x * 2.6 + t * 0.0005 + z * 2.2) * Math.cos(z * 3.4 - t * 0.0003 + x) * 0.5;
        c.fillRect(w / 2 + x * w * 0.62 * f, h * (0.3 + z * 0.62) - lift * h * 0.22 * f, size, size);
      }
    }
  };
}

const SCENES: Record<string, () => Draw> = { plexus, flow, wave };
const still = matchMedia("(prefers-reduced-motion: reduce)");

for (const canvas of document.querySelectorAll<HTMLCanvasElement>("canvas[data-scene]")) {
  const ctx = canvas.getContext("2d");
  const make = SCENES[canvas.dataset.scene ?? ""];
  if (!ctx || !make) continue;
  const draw = make();
  let ink = "";
  let accent = "";
  let w = 0;
  let h = 0;
  let dpr = 1;
  let t = 9000; // scene time in ms; also the pose of the still frame
  let last = 0;
  let raf = 0;
  let onScreen = false;

  const frame = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h, t, ink, accent);
    ctx.globalAlpha = 1;
  };
  const loop = (now: number) => {
    t += Math.min(now - (last || now), 50); // no jump after a pause
    last = now;
    frame();
    raf = requestAnimationFrame(loop);
  };
  const update = () => {
    cancelAnimationFrame(raf);
    raf = last = 0;
    if (onScreen && !document.hidden && !still.matches) raf = requestAnimationFrame(loop);
  };

  new ResizeObserver(() => {
    // Colors are read here, after layout: WebKit can run the script before the stylesheet applies.
    const css = getComputedStyle(canvas);
    ink = css.color;
    accent = css.getPropertyValue("--accent").trim() || ink;
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    frame();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    update();
  }).observe(canvas);
  document.addEventListener("visibilitychange", update);
  still.addEventListener("change", update);
}
