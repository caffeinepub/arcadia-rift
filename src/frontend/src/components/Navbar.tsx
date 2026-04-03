import { Coins, LogOut, Zap } from "lucide-react";

type NavPage = "home" | "play" | "leaderboard";

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  username: string;
  level: number;
  coins: number;
  onLogout: () => void;
}

export default function Navbar({
  currentPage,
  onNavigate,
  username,
  level,
  coins,
  onLogout,
}: NavbarProps) {
  const initials = username.slice(0, 2).toUpperCase() || "?";

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        background: "rgba(7,10,22,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(42,47,90,0.6)",
        boxShadow: "0 1px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Logo */}
      <button
        type="button"
        data-ocid="nav.link"
        onClick={() => onNavigate("home")}
        className="logo-text text-xl tracking-wider"
        style={{
          textDecoration: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        ARCADIA RIFT
      </button>

      {/* Nav Links */}
      <nav className="flex items-center gap-7">
        {(["home", "play", "leaderboard"] as NavPage[]).map((page) => (
          <button
            key={page}
            type="button"
            data-ocid={`nav.${page}.link`}
            onClick={() => onNavigate(page)}
            className={`nav-link ${currentPage === page ? "active" : ""}`}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            {page.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* User Area */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-bold glow-cyan"
          style={{
            background:
              "linear-gradient(135deg, rgba(39,214,255,0.2), rgba(216,76,255,0.15))",
            border: "1px solid #27D6FF",
            color: "#27D6FF",
          }}
        >
          {initials}
        </div>

        {/* Username + level */}
        <div className="flex flex-col">
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: "#E9ECFF" }}
          >
            {username}
          </span>
          <div className="flex items-center gap-1">
            <Zap size={9} style={{ color: "#D84CFF" }} />
            <span className="text-xs font-mono" style={{ color: "#D84CFF" }}>
              LVL {level}
            </span>
          </div>
        </div>

        {/* Coins */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded"
          style={{
            background: "rgba(230,193,90,0.1)",
            border: "1px solid rgba(230,193,90,0.3)",
          }}
        >
          <Coins size={11} style={{ color: "#E6C15A" }} />
          <span
            className="text-xs font-mono font-bold"
            style={{ color: "#E6C15A" }}
          >
            {coins.toLocaleString()}
          </span>
        </div>

        {/* Logout */}
        <button
          type="button"
          data-ocid="nav.logout.button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all hover:opacity-80"
          style={{
            background: "rgba(216,76,255,0.12)",
            border: "1px solid rgba(216,76,255,0.4)",
            color: "#D84CFF",
          }}
        >
          <LogOut size={11} />
          Logout
        </button>
      </div>
    </header>
  );
}
