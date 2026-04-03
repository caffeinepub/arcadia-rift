import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { usePlayerStats, useProfile } from "./hooks/useQueries";
import GamePage from "./pages/GamePage";
import LandingPage from "./pages/LandingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import RegisterPage from "./pages/RegisterPage";

type NavPage = "home" | "play" | "leaderboard";
type AppState = "landing" | "registering" | "authenticated";

export default function App() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const [currentPage, setCurrentPage] = useState<NavPage>("play");
  const [appState, setAppState] = useState<AppState>("landing");
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(
    null,
  );

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: playerStats, isLoading: statsLoading } = usePlayerStats();

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || actorFetching || profileLoading;

  // Determine app state when identity/profile changes
  useEffect(() => {
    if (!isAuthenticated) {
      setAppState("landing");
      return;
    }
    if (!isLoading) {
      // Check if user has a profile (has a non-empty username)
      if (profile?.username && profile.username.length > 0) {
        setRegisteredUsername(profile.username);
        setAppState("authenticated");
      } else {
        setAppState("registering");
      }
    }
  }, [isAuthenticated, isLoading, profile]);

  const handleRegistrationComplete = (username: string) => {
    setRegisteredUsername(username);
    setAppState("authenticated");
  };

  const handleLogout = () => {
    clear();
    setAppState("landing");
    setRegisteredUsername(null);
  };

  const handleNavigate = (page: NavPage) => {
    setCurrentPage(page);
    if (page === "home" && appState !== "authenticated") {
      setAppState("landing");
    }
  };

  // Loading screen
  if ((isAuthenticated && isLoading) || isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #070A16, #0B0F22)" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="logo-text text-3xl mb-4">ARCADIA RIFT</p>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: "#27D6FF", animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: "#D84CFF", animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: "#E6C15A", animationDelay: "300ms" }}
            />
          </div>
          <p className="text-xs font-mono mt-3" style={{ color: "#8D94C6" }}>
            LOADING RIFT...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(14,19,48,0.95)",
            border: "1px solid rgba(42,47,90,0.8)",
            color: "#E9ECFF",
            fontFamily: "'GeneralSans', sans-serif",
          },
        }}
      />
      <AnimatePresence mode="wait">
        {appState === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onLogin={login} isLoggingIn={isLoggingIn} />
          </motion.div>
        )}

        {appState === "registering" && (
          <motion.div
            key="register"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RegisterPage onComplete={handleRegistrationComplete} />
          </motion.div>
        )}

        {appState === "authenticated" && currentPage === "play" && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GamePage
              username={registeredUsername ?? profile?.username ?? "Rifter"}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              playerStats={playerStats ?? null}
              statsLoading={statsLoading}
            />
          </motion.div>
        )}

        {appState === "authenticated" && currentPage === "leaderboard" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LeaderboardPage
              username={registeredUsername ?? profile?.username ?? "Rifter"}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
              playerStats={playerStats ?? null}
            />
          </motion.div>
        )}

        {appState === "authenticated" && currentPage === "home" && (
          <motion.div
            key="home-auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GamePage
              username={registeredUsername ?? profile?.username ?? "Rifter"}
              onNavigate={(page) => {
                setCurrentPage(page);
              }}
              onLogout={handleLogout}
              playerStats={playerStats ?? null}
              statsLoading={statsLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
