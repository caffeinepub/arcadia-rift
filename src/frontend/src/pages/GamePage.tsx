import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PlayerStats } from "../backend";
import LeaderboardCard from "../components/LeaderboardCard";
import Navbar from "../components/Navbar";
import PlayerStatsCard from "../components/PlayerStatsCard";
import SnakeGame from "../components/SnakeGame";
import {
  useLeaderboard,
  usePlayerStats,
  useSubmitGameResult,
} from "../hooks/useQueries";

type NavPage = "home" | "play" | "leaderboard";

interface GamePageProps {
  username: string;
  onNavigate: (page: NavPage) => void;
  onLogout: () => void;
  playerStats: PlayerStats | null | undefined;
  statsLoading: boolean;
}

export default function GamePage({
  username,
  onNavigate,
  onLogout,
  playerStats,
  statsLoading,
}: GamePageProps) {
  const {
    data: leaderboard,
    isLoading: lbLoading,
    refetch: refetchLb,
  } = useLeaderboard();
  const submitResult = useSubmitGameResult();
  const level = playerStats ? Number(playerStats.level) : 1;
  const coins = playerStats ? Number(playerStats.coins) : 0;

  const handleGameEnd = useCallback(
    async (score: number, won: boolean) => {
      try {
        await submitResult.mutateAsync({ score: BigInt(score), won });
        if (won) {
          toast.success(`Mission complete! Score: ${score}`);
        } else {
          toast.error(`Game over. Score: ${score}`);
        }
      } catch {
        toast.error("Failed to submit score");
      }
    },
    [submitResult],
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #070A16, #0B0F22)" }}
    >
      <Navbar
        currentPage="play"
        onNavigate={onNavigate}
        username={username}
        level={level}
        coins={coins}
        onLogout={onLogout}
      />

      <main className="flex-1 px-4 lg:px-6 py-6 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Game Card */}
            <div data-ocid="game.card" className="game-card p-4">
              <div className="scanline-overlay" />
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="font-display font-bold text-xs uppercase tracking-widest"
                  style={{
                    color: "#27D6FF",
                    textShadow: "0 0 6px rgba(39,214,255,0.4)",
                  }}
                >
                  GAME ARENA
                </h2>
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(39,214,255,0.1)",
                    border: "1px solid rgba(39,214,255,0.3)",
                    color: "#27D6FF",
                  }}
                >
                  SNAKE v2.1
                </span>
              </div>
              <div className="flex justify-center">
                <SnakeGame onGameEnd={handleGameEnd} />
              </div>
            </div>

            {/* Player Stats */}
            <PlayerStatsCard stats={playerStats} isLoading={statsLoading} />
          </motion.div>

          {/* Right column: Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <LeaderboardCard
              entries={leaderboard ?? []}
              isLoading={lbLoading}
              onRefresh={() => refetchLb()}
            />
          </motion.div>
        </div>
      </main>

      <footer
        className="py-4 text-center mt-auto"
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
