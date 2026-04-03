import { motion } from "motion/react";
import type { PlayerStats } from "../backend";
import LeaderboardCard from "../components/LeaderboardCard";
import Navbar from "../components/Navbar";
import { useLeaderboard } from "../hooks/useQueries";

type NavPage = "home" | "play" | "leaderboard";

interface LeaderboardPageProps {
  username: string;
  onNavigate: (page: NavPage) => void;
  onLogout: () => void;
  playerStats: PlayerStats | null | undefined;
}

export default function LeaderboardPage({
  username,
  onNavigate,
  onLogout,
  playerStats,
}: LeaderboardPageProps) {
  const { data: leaderboard, isLoading, refetch } = useLeaderboard();
  const level = playerStats ? Number(playerStats.level) : 1;
  const coins = playerStats ? Number(playerStats.coins) : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #070A16, #0B0F22)" }}
    >
      <Navbar
        currentPage="leaderboard"
        onNavigate={onNavigate}
        username={username}
        level={level}
        coins={coins}
        onLogout={onLogout}
      />
      <main className="flex-1 px-4 lg:px-6 py-8 max-w-[800px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            className="font-display font-bold text-2xl uppercase tracking-widest mb-6"
            style={{
              color: "#E9ECFF",
              textShadow: "0 0 10px rgba(39,214,255,0.2)",
            }}
          >
            GLOBAL RANKINGS
          </h1>
          <LeaderboardCard
            entries={leaderboard ?? []}
            isLoading={isLoading}
            onRefresh={() => refetch()}
          />
        </motion.div>
      </main>
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
