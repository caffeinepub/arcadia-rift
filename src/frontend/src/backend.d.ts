import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    xp: bigint;
    username: string;
    gamesPlayed: bigint;
    playerId: Principal;
    coins: bigint;
    wins: bigint;
    bestScore: bigint;
    recentScores: Array<bigint>;
}
export interface LeaderboardEntry {
    username: string;
    rank: bigint;
    wins: bigint;
    bestScore: bigint;
    level: bigint;
}
export interface GameResult {
    won: boolean;
    score: bigint;
}
export interface PlayerStats {
    xp: bigint;
    gamesPlayed: bigint;
    coins: bigint;
    wins: bigint;
    bestScore: bigint;
    level: bigint;
    recentScores: Array<bigint>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getOwnLevel(): Promise<bigint>;
    getOwnProfile(): Promise<Player>;
    getOwnWinRatePercentage(): Promise<bigint>;
    getPlayerProfile(user: Principal): Promise<Player>;
    getPlayerStats(): Promise<PlayerStats>;
    isCallerAdmin(): Promise<boolean>;
    registerOrUpdateProfile(username: string): Promise<void>;
    submitGameResult(gameResult: GameResult): Promise<void>;
}
