# Arcadia Rift - Online Browser Game

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Online browser game with a cyberpunk/neon sci-fi aesthetic
- Player authentication (login/register)
- A playable Snake-style game in the browser
- Player stats tracking: level, XP, win rate, games played
- Global leaderboard showing top players with rank, score, wins
- Player profile with avatar placeholder, coins, level display
- Navigation: Home, Play, Leaderboard sections

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- Player profile: principal-based identity, username, level, XP, coins, games played, wins
- Game session: record game results (score, outcome)
- Leaderboard: query top 10 players by score
- Stats: compute win rate, level from XP thresholds

### Frontend (React/Tailwind)
- Dark cyberpunk theme (deep navy background, neon cyan/magenta/purple accents)
- Top navigation bar with logo, nav links, user profile cluster
- Home/landing screen with call-to-action
- Game area: embedded Snake game with HUD overlays (HP/boost bars, score, timer, mini-map)
- Player stats card: level progress bar, XP/win rate/games played metrics, recent activity chart
- Leaderboard card: ranked table with neon glow rows for top 3, global/weekly toggle
- Login/register modal using authorization component
