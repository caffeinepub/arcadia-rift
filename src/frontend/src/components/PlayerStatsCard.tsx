import type { PlayerStats } from "../backend";

interface PlayerStatsCardProps {
  stats: PlayerStats | null | undefined;
  isLoading: boolean;
}

export default function PlayerStatsCard({
  stats,
  isLoading,
}: PlayerStatsCardProps) {
  if (isLoading) {
    return (
      <div
        data-ocid="stats.loading_state"
        className="game-card p-5 animate-pulse"
      >
        <div
          className="h-4 w-32 rounded mb-4"
          style={{ background: "rgba(42,47,90,0.6)" }}
        />
        <div
          className="h-20 rounded"
          style={{ background: "rgba(42,47,90,0.4)" }}
        />
      </div>
    );
  }

  const xp = stats ? Number(stats.xp) : 0;
  const level = stats ? Number(stats.level) : 1;
  const gamesPlayed = stats ? Number(stats.gamesPlayed) : 0;
  const wins = stats ? Number(stats.wins) : 0;
  const bestScore = stats ? Number(stats.bestScore) : 0;
  const recentScores = stats ? stats.recentScores.map(Number) : [0, 0, 0, 0, 0];
  const xpPercent = xp % 500;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  const displayScores = [...recentScores].slice(-5);
  while (displayScores.length < 5) displayScores.unshift(0);
  const maxScore = Math.max(...displayScores, 10);

  return (
    <div data-ocid="stats.card" className="game-card p-5">
      <h3
        className="font-display font-bold text-sm uppercase tracking-widest mb-4"
        style={{ color: "#27D6FF", textShadow: "0 0 6px rgba(39,214,255,0.4)" }}
      >
        PLAYER STATS
      </h3>

      {/* Level + XP */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-mono" style={{ color: "#A9AFD6" }}>
            LEVEL {level}
          </span>
          <span className="text-xs font-mono" style={{ color: "#27D6FF" }}>
            {xpPercent}/500 XP
          </span>
        </div>
        <div className="hud-bar-bg h-2.5 rounded">
          <div
            className="h-full rounded transition-all duration-700"
            style={{
              width: `${(xpPercent / 500) * 100}%`,
              background: "linear-gradient(90deg, #3FE0FF, #3D7BFF)",
              boxShadow: "0 0 8px rgba(39,214,255,0.5)",
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div
          data-ocid="stats.panel"
          className="text-center p-2 rounded"
          style={{ background: "rgba(42,47,90,0.3)" }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: "#8D94C6" }}>
            XP TOTAL
          </p>
          <p
            className="font-display font-bold text-sm"
            style={{ color: "#E9ECFF" }}
          >
            {xp.toLocaleString()}
          </p>
        </div>
        <div
          data-ocid="stats.panel"
          className="text-center p-2 rounded"
          style={{ background: "rgba(42,47,90,0.3)" }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: "#8D94C6" }}>
            WIN RATE
          </p>
          <p className="font-display font-bold text-sm text-neon-cyan">
            {winRate}%
          </p>
        </div>
        <div
          data-ocid="stats.panel"
          className="text-center p-2 rounded"
          style={{ background: "rgba(42,47,90,0.3)" }}
        >
          <p className="text-xs font-mono mb-1" style={{ color: "#8D94C6" }}>
            GAMES
          </p>
          <p
            className="font-display font-bold text-sm"
            style={{ color: "#E9ECFF" }}
          >
            {gamesPlayed}
          </p>
        </div>
      </div>

      {/* Recent Activity Bar Chart */}
      <div>
        <p className="text-xs font-mono mb-2" style={{ color: "#8D94C6" }}>
          RECENT ACTIVITY
        </p>
        <div className="flex items-end gap-1.5 h-14">
          {displayScores.map((s, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static display array
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm transition-all duration-500"
                style={{
                  height: `${Math.max(4, (s / maxScore) * 52)}px`,
                  background:
                    i === displayScores.length - 1
                      ? "linear-gradient(180deg, #D84CFF, #7A3CFF)"
                      : "linear-gradient(180deg, #A45CFF, rgba(164,92,255,0.5))",
                  boxShadow:
                    i === displayScores.length - 1
                      ? "0 0 6px rgba(216,76,255,0.5)"
                      : "none",
                }}
              />
              <span
                className="text-xs font-mono"
                style={{ color: "rgba(141,148,198,0.6)" }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-3 pt-3"
        style={{ borderTop: "1px solid rgba(42,47,90,0.5)" }}
      >
        <span className="text-xs font-mono" style={{ color: "#8D94C6" }}>
          BEST SCORE:{" "}
        </span>
        <span className="text-xs font-display font-bold text-neon-gold">
          {bestScore}
        </span>
      </div>
    </div>
  );
}
