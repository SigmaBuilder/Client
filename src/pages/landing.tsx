import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Footer from "../components/shared/Footer";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[800px] -z-10"
        style={{
          background: "radial-gradient(ellipse 90% 60% at 50% -10%, oklch(0.546 0.245 262.9 / 22%) 0%, transparent 80%)"
        }}
      ></div>
      <Navbar />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
