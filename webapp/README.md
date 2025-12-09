## Agentic Video Studio

Agentic Video Studio is a free, client-side AI video generator that renders cinematic 200-second WebM videos directly in the browser. Describe a scene, pick a motion palette, and the app synthesizes layered gradients, particle ribbons, and animated captions with zero server costs.

### ✨ Features

- 200-second WebM renders at 12fps with customizable motion density
- Four curated color/motion palettes (Aurora Cascade, Zenith Bloom, Neon Flux, Terra Drift)
- Live canvas preview while frames encode locally with `webm-writer`
- Prompt captioning with letterboxed overlays for ready-to-share storytelling
- Purely client-side — no API keys, credits, or backend costs

### 🛠️ Tech stack

- Next.js App Router (TypeScript) with Tailwind CSS 4
- `webm-writer` for browser-side WebM (VP8) encoding
- Dynamic procedural visuals rendered on `<canvas>` using motion palettes derived from prompts

### 🚀 Local development

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Visit `http://localhost:3000` to use the generator

### ✅ Quality checks

- `npm run lint` – ESLint
- `npm run build` – Next.js production build

### 📦 Production build

Run `npm run build` to generate the optimized Next.js output. The app is fully static and deploys cleanly to Vercel.

### 🌐 Deployment

Deploy to Vercel with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-d4029ca2
```

After deployment, verify with:

```bash
curl https://agentic-d4029ca2.vercel.app
```

Enjoy generating immersive videos for free!
