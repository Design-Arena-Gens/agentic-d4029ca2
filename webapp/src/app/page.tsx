import { VideoGenerator } from "@/components/video-generator";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 font-sans">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.25),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.92)_0%,_rgba(2,6,23,0.97)_45%,_rgba(8,51,68,0.85)_100%)]" />
      </div>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 lg:px-12 lg:py-20">
        <VideoGenerator />
      </div>
    </main>
  );
}
