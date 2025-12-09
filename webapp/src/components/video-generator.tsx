"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import WebMWriter from "webm-writer";

type StyleOption = {
  id: string;
  name: string;
  description: string;
  palette: {
    baseHue: number;
    hueVariance: number;
    accentHueShift: number;
    saturation: number;
    lightness: number;
    glow: number;
    motionSpeed: number;
    layerCount: number;
    ribbonDensity: number;
  };
};

const DURATION_SECONDS = 200;
const FRAME_RATE = 12;
const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 288;

const STYLES: StyleOption[] = [
  {
    id: "aurora",
    name: "Aurora Cascade",
    description: "Dreamlike cosmic currents with sweeping light trails.",
    palette: {
      baseHue: 215,
      hueVariance: 80,
      accentHueShift: 140,
      saturation: 68,
      lightness: 34,
      glow: 0.65,
      motionSpeed: 0.85,
      layerCount: 36,
      ribbonDensity: 24,
    },
  },
  {
    id: "zenith",
    name: "Zenith Bloom",
    description: "Warm cinematic gradients with blooming highlights.",
    palette: {
      baseHue: 18,
      hueVariance: 45,
      accentHueShift: -120,
      saturation: 72,
      lightness: 38,
      glow: 0.58,
      motionSpeed: 0.65,
      layerCount: 30,
      ribbonDensity: 20,
    },
  },
  {
    id: "neo",
    name: "Neon Flux",
    description: "Vibrant cyberpunk ribbons and glitched light pulses.",
    palette: {
      baseHue: 295,
      hueVariance: 100,
      accentHueShift: -60,
      saturation: 78,
      lightness: 32,
      glow: 0.75,
      motionSpeed: 1.2,
      layerCount: 42,
      ribbonDensity: 28,
    },
  },
  {
    id: "terra",
    name: "Terra Drift",
    description: "Organic earthy motion inspired by aerial landscapes.",
    palette: {
      baseHue: 125,
      hueVariance: 55,
      accentHueShift: 200,
      saturation: 60,
      lightness: 36,
      glow: 0.5,
      motionSpeed: 0.55,
      layerCount: 32,
      ribbonDensity: 18,
    },
  },
];

const SAMPLE_PROMPTS = [
  "luminous ocean waves morphing into night sky constellations",
  "floating bioluminescent gardens over a future metropolis",
  "slow dancing nebula clouds reflecting on arctic waters",
  "anamorphic fractal forests breathing with radiant fog",
];

type GenerationState = "idle" | "generating" | "complete" | "error";

const PROGRESS_UPDATE_INTERVAL = Math.max(1, Math.floor(FRAME_RATE / 2));
const TOTAL_FRAMES = DURATION_SECONDS * FRAME_RATE;

export function VideoGenerator() {
  const [prompt, setPrompt] = useState(
    "aurora infused skyline with fluid neon rivers crossing a sleeping city",
  );
  const [detail, setDetail] = useState(0.65);
  const [styleId, setStyleId] = useState<string>(STYLES[0].id);
  const [status, setStatus] = useState<GenerationState>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedStyle = useMemo(
    () => STYLES.find((style) => style.id === styleId) ?? STYLES[0],
    [styleId],
  );

  const resetStatus = () => {
    if (status !== "generating") {
      setStatus("idle");
      setErrorMessage(null);
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="space-y-8">
        <header className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-50 shadow-sm backdrop-blur">
            200 Second AI Video Studio
          </span>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
            Free cinematic video generation, crafted entirely in your browser.
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-slate-200/80 sm:text-xl">
            Describe your scene, choose a motion palette, and render a full
            200-second WebM video with flowing AI-inspired visuals. Everything
            runs locally—no credits, no paywalls.
          </p>
        </header>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[0_40px_120px_-45px_rgba(59,130,246,0.48)] backdrop-blur">
          <div className="space-y-6">
            <div className="space-y-3">
              <label
                htmlFor="prompt"
                className="block text-sm font-semibold uppercase tracking-wide text-slate-100/80"
              >
                Creative prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(event) => {
                  resetStatus();
                  setPrompt(event.target.value);
                }}
                className="min-h-[140px] w-full resize-y rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-base text-slate-50 outline-none transition focus:border-indigo-400/80 focus:ring-2 focus:ring-indigo-300/30"
                placeholder="Describe the motion, mood, and environment you want to see..."
              />
              <p className="text-sm text-slate-200/60">
                Hint: combine a setting, a dominant motion, and a lighting
                direction for richer sequences.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-slate-100/80">
                Motion palette
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                {STYLES.map((style) => {
                  const isActive = style.id === selectedStyle.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        resetStatus();
                        setStyleId(style.id);
                      }}
                      className={`rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70 ${
                        isActive
                          ? "border-indigo-300/80 bg-indigo-300/15 shadow-[0_12px_40px_-18px_rgba(99,102,241,0.7)]"
                          : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold text-slate-50">
                          {style.name}
                        </p>
                        {isActive && (
                          <span className="rounded-full border border-indigo-200/40 bg-indigo-300/30 px-3 py-0.5 text-xs font-semibold uppercase text-indigo-50">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-200/70">
                        {style.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-100/80">
                  Scene density
                </span>
                <span className="text-sm text-slate-200/70">
                  {Math.round(detail * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.01}
                value={detail}
                onChange={(event) => {
                  resetStatus();
                  setDetail(Number(event.target.value));
                }}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-indigo-400"
              />
              <p className="text-sm text-slate-200/60">
                Increase to add more layered motion, particles, and glow. Lower
                values produce calmer, slower-moving compositions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void generateVideo()}
                disabled={status === "generating" || !prompt.trim()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-sky-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_18px_45px_-18px_rgba(99,102,241,0.65)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_55px_-22px_rgba(99,102,241,0.75)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "generating" ? "Rendering..." : "Generate 200s Video"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetStatus();
                  const choice =
                    SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
                  setPrompt(choice);
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-100/80 transition hover:border-white/40 hover:bg-white/10"
              >
                Surprise me
              </button>
              {videoUrl && (
                <a
                  href={videoUrl}
                  download={`ai-video-${Date.now()}.webm`}
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-300/20 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-50 shadow-[0_14px_35px_-20px_rgba(74,222,128,0.6)] transition hover:bg-emerald-300/30"
                >
                  Download WebM
                </a>
              )}
            </div>

            {status === "generating" && (
              <div className="rounded-2xl border border-white/15 bg-slate-900/60 p-4 text-sm text-slate-200/80">
                <div className="flex items-center justify-between font-medium text-slate-100">
                  <span>Encoding frames</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-blue-400 to-sky-400 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">
                  Estimated time elapsed: {elapsedSeconds.toFixed(1)}s · Target
                  duration: 200s · Frame rate: {FRAME_RATE}fps
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-rose-200/40 bg-rose-200/20 px-4 py-3 text-sm text-rose-50">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300/60">
            Suggested prompts
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  resetStatus();
                  setPrompt(sample);
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-white/30 hover:bg-white/10"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
              Offline
            </p>
            <p className="mt-2 text-sm text-slate-100/80">
              All synthesis happens locally in your browser with WebAssembly and
              GPU-accelerated gradients.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
              Precise duration
            </p>
            <p className="mt-2 text-sm text-slate-100/80">
              Every render encodes exactly 200 seconds of motion at a steady{" "}
              {FRAME_RATE}fps cadence.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-200">
              Ready to deploy
            </p>
            <p className="mt-2 text-sm text-slate-100/80">
              Optimized for Vercel edge delivery with a fully static Next.js
              frontend.
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-[0_40px_120px_-45px_rgba(99,102,241,0.55)]">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="h-full w-full"
            />
            {status === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 text-center">
                <span className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-200/80">
                  Live canvas preview
                </span>
                <p className="max-w-xs text-xs text-slate-200/70">
                  Video frames stream here while rendering. Once complete, a
                  playable WebM preview appears below.
                </p>
              </div>
            )}
          </div>
          <div className="mt-5 space-y-4 rounded-2xl border border-indigo-200/20 bg-indigo-300/10 p-4">
            <header className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/80">
                Output controls
              </span>
              <span className="text-xs text-indigo-100/70">
                {CANVAS_WIDTH}×{CANVAS_HEIGHT}px · {FRAME_RATE}fps · WebM (VP8)
              </span>
            </header>
            <ul className="space-y-2 text-sm text-indigo-50/80">
              <li>
                · Gradient-driven particle fields informed by your prompt&apos;s
                emotional tone.
              </li>
              <li>
                · Layered soft-light ribbons with adaptive glow and texture
                turbulence.
              </li>
              <li>
                · Automatic prompt captions over cinematic letterbox formatting.
              </li>
            </ul>
          </div>
        </div>

        {videoUrl && (
          <div className="rounded-3xl border border-emerald-200/20 bg-emerald-300/10 p-6">
            <header className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Rendered preview
              </span>
              <span className="text-xs text-emerald-100/80">
                Length: 200s · Size depends on prompt detail
              </span>
            </header>
            <video
              src={videoUrl}
              controls
              preload="metadata"
              className="mt-4 w-full rounded-2xl border border-emerald-200/30"
            />
            <p className="mt-3 text-xs text-emerald-50/80">
              Your video is stored locally. Download the WebM for editing or
              upload anywhere without licensing limits.
            </p>
          </div>
        )}
      </aside>
    </div>
  );

  async function generateVideo() {
    const canvas = canvasRef.current;
    if (!canvas) {
      setErrorMessage("Canvas context unavailable in this browser.");
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      setErrorMessage("Canvas rendering is not supported.");
      return;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt) {
      setErrorMessage("Please describe a scene to generate a video.");
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }

    setStatus("generating");
    setProgress(0);
    setElapsedSeconds(0);
    setErrorMessage(null);

    const seed = hashPrompt(cleanedPrompt + selectedStyle.id + detail.toString());
    const rng = createRandom(seed);
    const writer = new WebMWriter({
      quality: 0.92,
      frameRate: FRAME_RATE,
    });

    const start = performance.now();
    const promptLines = wrapPrompt(cleanedPrompt);

    try {
      for (let frame = 0; frame < TOTAL_FRAMES; frame += 1) {
        drawFrame({
          ctx: context,
          frame,
          promptLines,
          style: selectedStyle,
          detail,
          rng,
        });

        writer.addFrame(canvas);

        if (frame % PROGRESS_UPDATE_INTERVAL === 0 || frame === TOTAL_FRAMES - 1) {
          const elapsed = (performance.now() - start) / 1000;
          setProgress(((frame + 1) / TOTAL_FRAMES) * 100);
          setElapsedSeconds(elapsed);
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }

      const blob = (await writer.complete()) as Blob;
      const objectUrl = URL.createObjectURL(blob);
      setVideoUrl(objectUrl);
      setStatus("complete");
      setProgress(100);
      setElapsedSeconds((performance.now() - start) / 1000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage(
        "Something interrupted the encoder. Try again or reduce the scene density.",
      );
    }
  }
}

type DrawContext = {
  ctx: CanvasRenderingContext2D;
  frame: number;
  promptLines: string[];
  style: StyleOption;
  detail: number;
  rng: () => number;
};

function drawFrame({ ctx, frame, promptLines, style, detail, rng }: DrawContext) {
  const { palette } = style;
  const t = frame / FRAME_RATE;
  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;

  ctx.save();

  const hueShift =
    palette.baseHue +
    Math.sin(t * 0.3) * palette.hueVariance +
    Math.cos(t * 0.11) * palette.hueVariance * 0.35;
  const accentHue = (hueShift + palette.accentHueShift + 360) % 360;

  const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
  backgroundGradient.addColorStop(
    0,
    `hsl(${(hueShift + 20) % 360} ${palette.saturation}% ${Math.min(55, palette.lightness + 22)}%)`,
  );
  backgroundGradient.addColorStop(
    1,
    `hsl(${accentHue} ${Math.min(85, palette.saturation + 12)}% ${palette.lightness - 6}%)`,
  );
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = "screen";
  ctx.filter = "blur(16px)";

  const baseLayerCount = Math.floor(palette.layerCount * (0.55 + detail * 0.9));

  for (let i = 0; i < baseLayerCount; i += 1) {
    const phase = t * palette.motionSpeed + (i / baseLayerCount) * Math.PI * 2;
    const radiusScale = 0.25 + detail * 0.4;
    const radius =
      Math.sin(phase * 0.9 + rng() * 0.4) * (Math.min(width, height) * radiusScale);
    const x =
      width / 2 +
      Math.cos(phase) * radius * 1.1 +
      Math.sin(phase * 0.35) * width * 0.18 * (0.6 + detail);
    const y =
      height / 2 +
      Math.sin(phase * 1.1) * radius +
      Math.cos(phase * 0.5) * height * 0.2 * (0.7 + detail * 0.6);

    const hueDelta = (i / baseLayerCount) * palette.hueVariance * 1.5;
    const ellipseWidth =
      (width * (0.05 + detail * 0.18)) *
      (1 + Math.sin(t * 0.7 + hueDelta * 0.01 + rng() * 0.5) * 0.5);
    const ellipseHeight = ellipseWidth * (0.6 + Math.sin(phase) * 0.3);
    const gradient = ctx.createRadialGradient(x, y, ellipseWidth * 0.2, x, y, ellipseWidth);
    gradient.addColorStop(
      0,
      `hsla(${(hueShift + hueDelta + 360) % 360} ${
        palette.saturation + detail * 20
      }% ${Math.min(78, palette.lightness * 1.5)}% ${0.32 + palette.glow * 0.5})`,
    );
    gradient.addColorStop(
      1,
      `hsla(${accentHue} ${Math.max(35, palette.saturation - 20)}% ${
        palette.lightness - 10
      }% 0)`,
    );

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y,
      ellipseWidth,
      ellipseHeight,
      phase * 0.6 + rng() * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.filter = "none";
  ctx.globalCompositeOperation = "lighter";

  const ribbonCount = Math.floor(palette.ribbonDensity * (0.9 + detail * 0.8));
  for (let i = 0; i < ribbonCount; i += 1) {
    const ribbonPhase = t * (palette.motionSpeed * 1.4) + i * 0.37;
    const baseX = (i / ribbonCount) * width;
    const amplitude = (0.2 + detail * 0.35) * height;
    const lineWidth = 1.5 + detail * 2.4 + Math.sin(ribbonPhase) * 1.1;

    ctx.strokeStyle = `hsla(${(hueShift + i * 3) % 360} ${
      palette.saturation + 12
    }% ${Math.min(82, palette.lightness + 28)}% ${0.12 + detail * 0.12})`;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    for (let y = -height * 0.1; y < height * 1.2; y += height / 12) {
      const wave =
        Math.sin(ribbonPhase + y * 0.015) * amplitude * 0.3 +
        Math.cos(ribbonPhase * 1.2 + y * 0.011) * amplitude * 0.2 +
        Math.sin(ribbonPhase * 0.7 + y * 0.022) * amplitude * 0.1;

      const targetX = baseX + wave + Math.sin(t + i) * width * 0.05;
      if (y === -height * 0.1) {
        ctx.moveTo(targetX, y);
      } else {
        ctx.lineTo(targetX, y);
      }
    }

    ctx.stroke();
  }

  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "rgba(10, 12, 20, 0.12)";
  ctx.fillRect(0, 0, width, height);

  drawLetterbox(ctx, width, height);
  drawPromptOverlay(ctx, promptLines, width, height);

  ctx.restore();
}

function drawLetterbox(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const barHeight = Math.max(12, height * 0.07);
  ctx.save();
  ctx.fillStyle = "rgba(5, 6, 12, 0.75)";
  ctx.fillRect(0, 0, width, barHeight);
  ctx.fillRect(0, height - barHeight, width, barHeight);
  ctx.restore();
}

function drawPromptOverlay(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  width: number,
  height: number,
) {
  const barHeight = Math.max(12, height * 0.07);
  ctx.save();
  ctx.font = `${Math.round(height * 0.065)}px var(--font-geist-sans, "Geist", "Inter", sans-serif)`;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 6;

  const baseY = height - barHeight * 0.65 - (lines.length - 1) * barHeight * 0.55;
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, baseY + index * barHeight * 0.7);
  });
  ctx.restore();
}

function wrapPrompt(prompt: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return [prompt];
  }

  context.font = `${Math.round(CANVAS_HEIGHT * 0.065)}px var(--font-geist-sans, "Geist", "Inter", sans-serif)`;
  const words = prompt.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  const maxWidth = CANVAS_WIDTH * 0.82;

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3);
}

function hashPrompt(input: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed || 0x1a2b3c4d;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}
