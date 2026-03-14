import { Navbar, Hero, Features, Footer } from './components/Layout';
import { DroneVisual } from './components/DroneVisual';

export default function App() {
  return (
    <div className="min-h-screen bg-sky-dark selection:bg-sky-blue selection:text-white">
      <Navbar />
      <main>
        <div className="relative">
          <DroneVisual />
          <Hero />
        </div>
        <Features />
        
        {/* Call to Action Section */}
        <section className="py-24 px-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-blue/5 to-transparent" />
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
              READY TO OWN THE SKY?
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Join the world's most innovative brands and launch your first aerial campaign today.
            </p>
            <button className="px-10 py-5 bg-white text-sky-dark font-black rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              BOOK A CONSULTATION
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
