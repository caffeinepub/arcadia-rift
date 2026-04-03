import { Loader2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useRegisterProfile } from "../hooks/useQueries";

interface RegisterPageProps {
  onComplete: (username: string) => void;
}

export default function RegisterPage({ onComplete }: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const register = useRegisterProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (trimmed.length > 20) {
      setError("Username must be 20 characters or less");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError("Only letters, numbers, underscores and hyphens allowed");
      return;
    }
    setError("");
    try {
      await register.mutateAsync(trimmed);
      onComplete(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #070A16, #0B0F22)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        data-ocid="register.modal"
        className="w-full max-w-sm game-card p-8"
      >
        <div className="text-center mb-6">
          <p className="logo-text text-2xl mb-1">ARCADIA RIFT</p>
          <h2
            className="font-display font-bold text-base mb-1"
            style={{ color: "#E9ECFF" }}
          >
            CREATE YOUR RIFTER
          </h2>
          <p className="text-xs font-mono" style={{ color: "#8D94C6" }}>
            Choose a callsign to enter the grid
          </p>
        </div>

        <form
          data-ocid="register.card"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-mono uppercase tracking-widest mb-2"
              style={{ color: "#A9AFD6" }}
            >
              CALLSIGN
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#8D94C6" }}
              />
              <input
                id="username"
                data-ocid="register.input"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="e.g. NeonViper"
                maxLength={20}
                className="w-full pl-9 pr-4 py-2.5 rounded text-sm font-mono outline-none transition-all"
                style={{
                  background: "rgba(42,47,90,0.3)",
                  border: error
                    ? "1px solid #ff4444"
                    : "1px solid rgba(42,47,90,0.8)",
                  color: "#E9ECFF",
                  caretColor: "#27D6FF",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1px solid #27D6FF";
                  e.target.style.boxShadow = "0 0 10px rgba(39,214,255,0.2)";
                }}
                onBlur={(e) => {
                  if (!error) {
                    e.target.style.border = "1px solid rgba(42,47,90,0.8)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>
            {error && (
              <p
                data-ocid="register.error_state"
                className="text-xs mt-1.5 font-mono"
                style={{ color: "#ff6b6b" }}
              >
                {error}
              </p>
            )}
          </div>

          <button
            data-ocid="register.submit_button"
            type="submit"
            disabled={register.isPending || username.trim().length < 3}
            className="w-full py-3 rounded font-display font-bold text-sm uppercase tracking-widest transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, rgba(39,214,255,0.2), rgba(216,76,255,0.15))",
              border: "1px solid #27D6FF",
              color: "#27D6FF",
              boxShadow: "0 0 15px rgba(39,214,255,0.2)",
            }}
          >
            {register.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : null}
            {register.isPending ? "ENTERING RIFT..." : "ENTER THE GRID"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
