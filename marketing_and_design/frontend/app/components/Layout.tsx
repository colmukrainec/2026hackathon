'use client';
import { motion } from 'motion/react';
import { Rocket, Zap, Globe, Shield } from 'lucide-react';

export const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-transparent backdrop-blur-sm border-b border-white/5">
    <div className="flex items-center gap-2">
      <div className="grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 bg-sky-blue rounded-full shadow-[0_0_5px_#3DA9FF]" />
        ))}
      </div>
      <span className="text-xl font-bold tracking-tighter">SKYCANVAS</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
      <a href="#" className="hover:text-white transition-colors">Technology</a>
      <a href="#" className="hover:text-white transition-colors">Campaigns</a>
      <a href="#" className="hover:text-white transition-colors">Safety</a>
      <a href="#" className="hover:text-white transition-colors">Pricing</a>
    </div>
    <button className="px-5 py-2 bg-white text-sky-dark text-sm font-bold rounded-full hover:bg-sky-blue hover:text-white transition-all">
      Get Started
    </button>
  </nav>
);

export const Hero = () => (
  <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="z-10 max-w-4xl"
    >
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
        BILLBOARDS <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-blue to-sky-purple">CAN'T FLY.</span> <br />
        YOUR ADS CAN.
      </h1>
      <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto font-medium">
        Drone-powered aerial displays that turn the sky into the world's largest advertising canvas.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button className="w-full sm:w-auto px-8 py-4 bg-sky-blue text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(61,169,255,0.5)] transition-all">
          Launch a Sky Campaign
        </button>
        <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all">
          Watch Showreel
        </button>
      </div>
    </motion.div>
  </section>
);

export const Features = () => {
  const features = [
    {
      icon: <Rocket className="w-6 h-6 text-sky-blue" />,
      title: "Rapid Deployment",
      description: "Go from concept to sky-ready in under 48 hours with our automated flight paths."
    },
    {
      icon: <Zap className="w-6 h-6 text-sky-purple" />,
      title: "High Visibility",
      description: "Visible from up to 5 miles away, reaching thousands of eyes simultaneously."
    },
    {
      icon: <Globe className="w-6 h-6 text-sky-blue" />,
      title: "Global Reach",
      description: "Operating in 40+ major cities worldwide with full regulatory compliance."
    },
    {
      icon: <Shield className="w-6 h-6 text-sky-purple" />,
      title: "Safety First",
      description: "Redundant systems and geofencing ensure every show is 100% safe and secure."
    }
  ];

  return (
    <section className="py-24 px-8 bg-sky-dark/50 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-blue/50 transition-colors group"
            >
              <div className="mb-4 p-3 bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Footer = () => (
  <footer className="py-12 px-8 border-t border-white/5 text-center text-white/30 text-sm">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-3 gap-1 opacity-50">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full" />
          ))}
        </div>
        <span className="font-bold tracking-tighter">SKYCANVAS</span>
      </div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-white">Twitter</a>
        <a href="#" className="hover:text-white">Instagram</a>
        <a href="#" className="hover:text-white">LinkedIn</a>
      </div>
      <p>© 2026 SkyCanvas Aerial Advertising. All rights reserved.</p>
    </div>
  </footer>
);
