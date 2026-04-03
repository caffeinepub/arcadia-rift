import { RefreshCw } from "lucide-react";
import type { LeaderboardEntry } from "../backend";

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { username: "NeonViper", rank: 1n, wins: 42n, bestScore: 320n, level: 18n },
  { username: "CyberShade", rank: 2n, wins: 38n, bestScore: 290n, level: 16n },
  { username: "RiftWalker", rank: 3n, wins: 35n, bestScore: 270n, level: 15n },
  { username: "GlitchByte", rank: 4n, wins: 29n, bestScore: 240n, level: 13n },
  { username: "NullPoint3r", rank: 5n, wins: 24n, bestScore: 200n, level: 11n },
  { username: "VoidRunner", rank: 6n, wins: 19n, bestScore: 170n, level: 9n },
  { username: "ArcanePulse", rank: 7n, wins: 15n, bestScore: 150n, level: 8n },
];

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  onRefresh: () => void;
}

const RANK_GLOW: Record<
  number,
  { border: string; shadow: string; labelColor: string }
> = {
  1: {
    border: "#E6C15A",
    shadow: "0 0 10px #E6C15A, 0 0 20px rgba(230,193,90,0.27)",
    labelColor: "#E6C15A",
  },
  2: {
    border: "#27D6FF",
    shadow: "0 0 10px #27D6FF, 0 0 20px rgba(39,214,255,0.27)",
    labelColor: "#27D6FF",
  },
  3: {
    border: "#D84CFF",
    shadow: "0 0 10px #D84CFF, 0 0 20px rgba(216,76,255,0.27)",
    labelColor: "#D84CFF",
  },
};

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function AvatarInitials({ name, rank }: { name: string; rank: number }) {
  const glow = RANK_GLOW[rank];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold flex-shrink-0"
      style={{
        background: glow
          ? `radial-gradient(circle, ${glow.border}33, transparent)`
          : "rgba(42,47,90,0.5)",
        border: `1px solid ${glow ? glow.border : "rgba(42,47,90,0.8)"}`,
        color: glow ? glow.labelColor : "#A9AFD6",
        boxShadow: glow ? glow.shadow : "none",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

export default function LeaderboardCard({
  entries,
  isLoading,
  onRefresh,
}: LeaderboardCardProps) {
  const displayEntries = entries.length > 0 ? entries : MOCK_LEADERBOARD;

  return (
    <div data-ocid="leaderboard.card" className="game-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-display font-bold text-sm uppercase tracking-widest"
          style={{
            color: "#E6C15A",
            textShadow: "0 0 6px rgba(230,193,90,0.4)",
          }}
        >
          TOP RIFTERS
        </h3>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded overflow-hidden"
            style={{ border: "1px solid rgba(42,47,90,0.8)" }}
          >
            <button
              type="button"
              data-ocid="leaderboard.tab"
              className="px-3 py-1 text-xs font-mono uppercase tracking-wider"
              style={{
                background: "rgba(39,214,255,0.15)",
                color: "#27D6FF",
                borderRight: "1px solid rgba(42,47,90,0.8)",
              }}
            >
              Global
            </button>
          </div>
          <button
            type="button"
            data-ocid="leaderboard.secondary_button"
            onClick={onRefresh}
            className="p-1.5 rounded transition-colors hover:text-white"
            style={{
              color: "#8D94C6",
              border: "1px solid rgba(42,47,90,0.6)",
            }}
            title="Refresh"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-12 gap-1 text-xs font-mono pb-2 mb-2"
        style={{
          color: "#8D94C6",
          borderBottom: "1px solid rgba(42,47,90,0.5)",
          letterSpacing: "0.08em",
        }}
      >
        <span className="col-span-1">#</span>
        <span className="col-span-5">PLAYER</span>
        <span className="col-span-3 text-right">SCORE</span>
        <span className="col-span-3 text-right">WINS</span>
      </div>

      {/* Rows */}
      {isLoading ? (
        <div data-ocid="leaderboard.loading_state" className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 rounded animate-pulse"
              style={{ background: "rgba(42,47,90,0.3)" }}
            />
          ))}
        </div>
      ) : (
        <div data-ocid="leaderboard.list" className="space-y-1.5">
          {displayEntries.map((entry) => {
            const rank = Number(entry.rank);
            const glow = RANK_GLOW[rank];
            return (
              <div
                key={entry.username}
                data-ocid={`leaderboard.item.${rank}`}
                className="grid grid-cols-12 gap-1 items-center px-2.5 py-2 rounded"
                style={{
                  background: glow
                    ? `rgba(${rank === 1 ? "230,193,90" : rank === 2 ? "39,214,255" : "216,76,255"},0.06)`
                    : "rgba(42,47,90,0.15)",
                  border: `1px solid ${glow ? glow.border : "rgba(42,47,90,0.4)"}`,
                  boxShadow: glow ? glow.shadow : "none",
                  transition: "all 0.2s",
                }}
              >
                <span
                  className="col-span-1 font-mono font-bold text-xs"
                  style={{ color: glow ? glow.labelColor : "#8D94C6" }}
                >
                  {rank}
                </span>
                <div className="col-span-5 flex items-center gap-2">
                  <AvatarInitials name={entry.username} rank={rank} />
                  <span
                    className="text-xs font-mono truncate"
                    style={{ color: "#E9ECFF" }}
                  >
                    {entry.username}
                  </span>
                </div>
                <span
                  className="col-span-3 text-right text-xs font-mono font-bold"
                  style={{ color: glow ? glow.labelColor : "#A9AFD6" }}
                >
                  {Number(entry.bestScore)}
                </span>
                <span
                  className="col-span-3 text-right text-xs font-mono"
                  style={{ color: "#8D94C6" }}
                >
                  {Number(entry.wins)}W
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
