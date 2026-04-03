import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const GRID_COLS = 28;
const GRID_ROWS = 18;
const CANVAS_W = 560;
const CANVAS_H = 360;
const CELL_W = CANVAS_W / GRID_COLS;
const CELL_H = CANVAS_H / GRID_ROWS;
const TICK_MS = 125; // 8 cells/sec
const WIN_SCORE = 50;

type Point = { x: number; y: number };
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";

type GameState = "idle" | "playing" | "paused" | "over";

interface SnakeGameProps {
  onGameEnd: (score: number, won: boolean) => void;
}

function randomFood(snake: Point[]): Point {
  let pos: Point;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_COLS),
      y: Math.floor(Math.random() * GRID_ROWS),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function SnakeGame({ onGameEnd }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniMapRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const stateRef = useRef<GameState>("idle");

  const snakeRef = useRef<Point[]>([
    { x: 14, y: 9 },
    { x: 13, y: 9 },
    { x: 12, y: 9 },
  ]);
  const dirRef = useRef<Dir>("RIGHT");
  const nextDirRef = useRef<Dir>("RIGHT");
  const foodRef = useRef<Point>({ x: 20, y: 9 });
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);
  const elapsedRef = useRef<number>(0);
  const boostRef = useRef<number>(100);

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [boost, setBoost] = useState(100);
  const [finalScore, setFinalScore] = useState(0);
  const [won, setWon] = useState(false);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 14, y: 9 },
      { x: 13, y: 9 },
      { x: 12, y: 9 },
    ];
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    foodRef.current = randomFood(snakeRef.current);
    scoreRef.current = 0;
    livesRef.current = 3;
    elapsedRef.current = 0;
    boostRef.current = 100;
    setScore(0);
    setLives(3);
    setElapsed(0);
    setBoost(100);
  }, []);

  const endGame = useCallback(() => {
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    const s = scoreRef.current;
    const w = s >= WIN_SCORE;
    stateRef.current = "over";
    setGameState("over");
    setFinalScore(s);
    setWon(w);
    onGameEnd(s, w);
  }, [onGameEnd]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.fillStyle = "rgba(7, 10, 22, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = "rgba(42, 47, 90, 0.4)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_W * dpr, 0);
      ctx.lineTo(x * CELL_W * dpr, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_H * dpr);
      ctx.lineTo(canvas.width, y * CELL_H * dpr);
      ctx.stroke();
    }

    const snake = snakeRef.current;
    const food = foodRef.current;

    // Food with glow
    const fx = food.x * CELL_W * dpr;
    const fy = food.y * CELL_H * dpr;
    const fw = CELL_W * dpr;
    const fh = CELL_H * dpr;
    ctx.save();
    ctx.shadowColor = "#D84CFF";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#D84CFF";
    ctx.beginPath();
    ctx.arc(fx + fw / 2, fy + fh / 2, fw * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Snake body
    snake.forEach((seg, i) => {
      const sx = seg.x * CELL_W * dpr + 1;
      const sy = seg.y * CELL_H * dpr + 1;
      const sw = CELL_W * dpr - 2;
      const sh = CELL_H * dpr - 2;
      const alpha = i === 0 ? 1 : Math.max(0.4, 1 - (i / snake.length) * 0.5);

      ctx.save();
      if (i === 0) {
        ctx.shadowColor = "#27D6FF";
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle =
        i === 0
          ? `rgba(39, 214, 255, ${alpha})`
          : `rgba(61, 123, 255, ${alpha})`;
      const r = Math.min(3, sw / 3);
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, r);
      ctx.fill();
      ctx.restore();
    });

    // Mini-map
    const mm = miniMapRef.current;
    if (mm) {
      const mctx = mm.getContext("2d");
      if (mctx) {
        const mw = mm.width;
        const mh = mm.height;
        mctx.clearRect(0, 0, mw, mh);
        mctx.fillStyle = "rgba(7,10,22,0.85)";
        mctx.fillRect(0, 0, mw, mh);
        mctx.strokeStyle = "rgba(42,47,90,0.6)";
        mctx.lineWidth = 0.5;
        mctx.strokeRect(0.5, 0.5, mw - 1, mh - 1);

        const cw = mw / GRID_COLS;
        const ch = mh / GRID_ROWS;

        // food
        mctx.fillStyle = "#D84CFF";
        mctx.fillRect(food.x * cw, food.y * ch, cw, ch);

        // snake
        snake.forEach((seg, i) => {
          mctx.fillStyle = i === 0 ? "#27D6FF" : "rgba(61,123,255,0.7)";
          mctx.fillRect(seg.x * cw, seg.y * ch, cw, ch);
        });
      }
    }
  }, []);

  const tick = useCallback(
    (ts: number) => {
      if (stateRef.current !== "playing") return;

      if (ts - lastTickRef.current >= TICK_MS) {
        lastTickRef.current = ts;
        elapsedRef.current += TICK_MS / 1000;

        // Regen boost slowly
        boostRef.current = Math.min(100, boostRef.current + 1);

        const snake = snakeRef.current;
        dirRef.current = nextDirRef.current;
        const head = snake[0];
        const dir = dirRef.current;

        const newHead: Point = {
          x:
            dir === "LEFT" ? head.x - 1 : dir === "RIGHT" ? head.x + 1 : head.x,
          y: dir === "UP" ? head.y - 1 : dir === "DOWN" ? head.y + 1 : head.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_COLS ||
          newHead.y < 0 ||
          newHead.y >= GRID_ROWS
        ) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            endGame();
            return;
          }
          // Reset position
          snakeRef.current = [
            { x: 14, y: 9 },
            { x: 13, y: 9 },
            { x: 12, y: 9 },
          ];
          nextDirRef.current = "RIGHT";
          dirRef.current = "RIGHT";
          gameLoopRef.current = requestAnimationFrame(tick);
          drawGame();
          return;
        }

        // Self collision (skip first 3)
        const selfHit = snake
          .slice(1)
          .some((s) => s.x === newHead.x && s.y === newHead.y);
        if (selfHit) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            endGame();
            return;
          }
          snakeRef.current = [
            { x: 14, y: 9 },
            { x: 13, y: 9 },
            { x: 12, y: 9 },
          ];
          nextDirRef.current = "RIGHT";
          dirRef.current = "RIGHT";
          gameLoopRef.current = requestAnimationFrame(tick);
          drawGame();
          return;
        }

        const ateFood =
          newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
        const newSnake = [newHead, ...snake];
        if (!ateFood) newSnake.pop();
        else {
          scoreRef.current += 10;
          setScore(scoreRef.current);
          foodRef.current = randomFood(newSnake);
          if (scoreRef.current >= WIN_SCORE) {
            snakeRef.current = newSnake;
            drawGame();
            endGame();
            return;
          }
        }

        snakeRef.current = newSnake;
        setElapsed(Math.floor(elapsedRef.current));
        setBoost(Math.floor(boostRef.current));
      }

      drawGame();
      gameLoopRef.current = requestAnimationFrame(tick);
    },
    [drawGame, endGame],
  );

  const startGame = useCallback(() => {
    resetGame();
    stateRef.current = "playing";
    setGameState("playing");
    lastTickRef.current = 0;
    gameLoopRef.current = requestAnimationFrame(tick);
  }, [resetGame, tick]);

  // Setup canvas resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    drawGame();
  }, [drawGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (stateRef.current !== "playing") return;
      const cur = dirRef.current;
      if (
        (e.key === "ArrowUp" || e.key === "w" || e.key === "W") &&
        cur !== "DOWN"
      ) {
        e.preventDefault();
        nextDirRef.current = "UP";
      } else if (
        (e.key === "ArrowDown" || e.key === "s" || e.key === "S") &&
        cur !== "UP"
      ) {
        e.preventDefault();
        nextDirRef.current = "DOWN";
      } else if (
        (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") &&
        cur !== "RIGHT"
      ) {
        e.preventDefault();
        nextDirRef.current = "LEFT";
      } else if (
        (e.key === "ArrowRight" || e.key === "d" || e.key === "D") &&
        cur !== "LEFT"
      ) {
        e.preventDefault();
        nextDirRef.current = "RIGHT";
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current !== null)
        cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  const hpPercent = (lives / 3) * 100;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full">
      {/* HUD Top */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span
              className="text-xs font-mono"
              style={{ color: "#A9AFD6", letterSpacing: "0.1em" }}
            >
              HP
            </span>
            <div className="hud-bar-bg w-24 h-2">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${hpPercent}%`,
                  background:
                    hpPercent > 60
                      ? "linear-gradient(90deg, #3FE0FF, #3D7BFF)"
                      : hpPercent > 30
                        ? "#E6C15A"
                        : "#ff4444",
                  boxShadow: `0 0 6px ${
                    hpPercent > 60
                      ? "#27D6FF"
                      : hpPercent > 30
                        ? "#E6C15A"
                        : "#ff4444"
                  }`,
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span
              className="text-xs font-mono"
              style={{ color: "#A9AFD6", letterSpacing: "0.1em" }}
            >
              BOOST
            </span>
            <div className="hud-bar-bg w-20 h-2">
              <div
                className="h-full transition-all duration-100"
                style={{
                  width: `${boost}%`,
                  background: "linear-gradient(90deg, #7A3CFF, #D84CFF)",
                  boxShadow: "0 0 6px #D84CFF",
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span
              className="text-xs block font-mono"
              style={{ color: "#A9AFD6" }}
            >
              SCORE
            </span>
            <span className="text-neon-cyan font-display font-bold text-lg">
              {score}
            </span>
          </div>
          <div className="text-center">
            <span
              className="text-xs block font-mono"
              style={{ color: "#A9AFD6" }}
            >
              TIME
            </span>
            <span className="font-mono text-sm" style={{ color: "#E9ECFF" }}>
              {formatTime(elapsed)}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas + minimap */}
      <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
        <canvas
          ref={canvasRef}
          data-ocid="game.canvas_target"
          className="block rounded-lg"
          style={{ border: "1px solid rgba(42,47,90,0.7)" }}
        />
        {/* Mini-map overlay */}
        <canvas
          ref={miniMapRef}
          width={84}
          height={54}
          className="absolute bottom-2 right-2 rounded"
          style={{ border: "1px solid rgba(42,47,90,0.8)" }}
        />

        {/* Idle overlay */}
        <AnimatePresence>
          {gameState === "idle" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(7,10,22,0.85)" }}
            >
              <p className="logo-text text-4xl mb-2">ARCADIA RIFT</p>
              <p
                className="text-sm mb-6 font-mono"
                style={{ color: "#A9AFD6" }}
              >
                SNAKE EDITION
              </p>
              <p
                className="text-xs mb-4 font-mono"
                style={{ color: "#8D94C6" }}
              >
                Use WASD or Arrow Keys to control
              </p>
              <button
                type="button"
                data-ocid="game.primary_button"
                onClick={startGame}
                className="px-8 py-3 rounded font-display font-bold text-sm uppercase tracking-widest transition-all duration-200 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(39,214,255,0.2), rgba(216,76,255,0.2))",
                  border: "1px solid #27D6FF",
                  color: "#27D6FF",
                  boxShadow: "0 0 15px rgba(39,214,255,0.3)",
                }}
              >
                START GAME
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over overlay */}
        <AnimatePresence>
          {gameState === "over" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              data-ocid="game.modal"
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: "rgba(7,10,22,0.92)" }}
            >
              <p
                className="text-2xl font-display font-bold mb-1"
                style={{
                  color: won ? "#27D6FF" : "#D84CFF",
                  textShadow: `0 0 20px ${won ? "#27D6FF" : "#D84CFF"}`,
                }}
              >
                {won ? "MISSION COMPLETE" : "GAME OVER"}
              </p>
              <p
                className="text-xs font-mono mb-4"
                style={{ color: "#8D94C6" }}
              >
                {won
                  ? "You reached the target score!"
                  : "Better luck next time, Rifter"}
              </p>
              <div className="text-center mb-5">
                <p className="text-sm font-mono" style={{ color: "#A9AFD6" }}>
                  FINAL SCORE
                </p>
                <p className="text-neon-cyan font-display font-bold text-4xl">
                  {finalScore}
                </p>
              </div>
              <button
                type="button"
                data-ocid="game.confirm_button"
                onClick={startGame}
                className="px-6 py-2.5 rounded font-display font-bold text-sm uppercase tracking-widest transition-all hover:scale-105"
                style={{
                  background: won
                    ? "linear-gradient(135deg, rgba(39,214,255,0.25), rgba(39,214,255,0.1))"
                    : "linear-gradient(135deg, rgba(216,76,255,0.25), rgba(216,76,255,0.1))",
                  border: `1px solid ${won ? "#27D6FF" : "#D84CFF"}`,
                  color: won ? "#27D6FF" : "#D84CFF",
                  boxShadow: `0 0 12px ${
                    won ? "rgba(39,214,255,0.3)" : "rgba(216,76,255,0.3)"
                  }`,
                }}
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls hint */}
      {gameState === "playing" && (
        <p
          className="text-center text-xs mt-2 font-mono"
          style={{ color: "rgba(141,148,198,0.5)" }}
        >
          WASD / Arrow Keys · Reach 50pts to win
        </p>
      )}
    </div>
  );
}
