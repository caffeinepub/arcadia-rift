import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameResult, LeaderboardEntry, PlayerStats } from "../backend";
import { useActor } from "./useActor";

export function usePlayerStats() {
  const { actor, isFetching } = useActor();
  return useQuery<PlayerStats | null>({
    queryKey: ["playerStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPlayerStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOwnProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerOrUpdateProfile(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["playerStats"] });
    },
  });
}

export function useSubmitGameResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (result: GameResult) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitGameResult(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerStats"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
