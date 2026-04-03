import { ChevronRight, Shield, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const FEATURES = [
  {
    icon: Zap,
    title: "Neon Snake Combat",
    desc: "Pilot your cyber-serpent through a glowing grid, eat energy nodes and grow your trail.",
    accent: "#27D6FF",
  },
  {
    icon: Shield,
    title: "Lives & Boost System",
    desc: "Three lives per run. Use your Boost meter to recover from close calls in the Rift.",
    accent: "#D84CFF",
  },
  {
    icon: Trophy,
    title: "Global Leaderboards",
    desc: "Compete with Rifters worldwide. Climb the ranks and earn legendary status.",
    accent: "#E6C15A",
  },
];

export default function LandingPage({
  onLogin,
  isLoggingIn,
}: LandingPageProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #070A16, #0B0F22)" }}
    >
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-16 relative">
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('/assets/generated/hero-arcadia-rift.dim_1200x400.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage:
              "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="logo-text text-6xl md:text-7xl mb-4 animate-flicker">
              ARCADIA RIFT
            </h1>
            <p
              className="text-lg md:text-xl mb-2 font-mono"
              style={{ color: "#A9AFD6", letterSpacing: "0.15em" }}
            >
              ENTER THE NEON GRID
            </p>
            <p
              className="text-sm mb-8 max-w-md mx-auto"
              style={{ color: "#8D94C6" }}
            >
              A cyberpunk snake game for true Rifters. Navigate the matrix,
              devour data nodes, and claim your place at the top of the
              leaderboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              type="button"
              data-ocid="landing.primary_button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="group flex items-center gap-2 px-8 py-3.5 rounded font-display font-bold uppercase tracking-widest text-sm transition-all duration-200 hover:scale-105 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, rgba(39,214,255,0.25), rgba(216,76,255,0.15))",
                border: "1px solid #27D6FF",
                color: "#27D6FF",
                boxShadow:
                  "0 0 20px rgba(39,214,255,0.3), 0 0 40px rgba(39,214,255,0.1)",
              }}
            >
              {isLoggingIn ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              PLAY NOW
              <ChevronRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 flex gap-8 mt-12"
        >
          {[
            { label: "ACTIVE RIFTERS", value: "1,247" },
            { label: "GAMES PLAYED", value: "89,412" },
            { label: "TOP SCORE", value: "320" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-display font-bold text-neon-cyan">
                {stat.value}
              </p>
              <p
                className="text-xs font-mono"
                style={{ color: "#8D94C6", letterSpacing: "0.1em" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Features */}
      <section className="px-4 pb-16 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2
            className="text-center font-display font-bold text-sm uppercase tracking-widest mb-8"
            style={{ color: "#8D94C6" }}
          >
            CORE SYSTEMS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                data-ocid={`landing.item.${i + 1}`}
                className="game-card p-5 transition-all duration-200"
                style={{ cursor: "default" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: `${f.accent}18`,
                    border: `1px solid ${f.accent}44`,
                  }}
                >
                  <f.icon size={18} style={{ color: f.accent }} />
                </div>
                <h3
                  className="font-display font-bold text-sm mb-1.5"
                  style={{ color: "#E9ECFF" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#8D94C6" }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="py-4 text-center"
        style={{ borderTop: "1px solid rgba(42,47,90,0.4)" }}
      >
        <p
          className="text-xs font-mono"
          style={{ color: "rgba(141,148,198,0.4)" }}
        >
          © {new Date().getFullYear()}. Built with ❤ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#27D6FF", textDecoration: "none" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
