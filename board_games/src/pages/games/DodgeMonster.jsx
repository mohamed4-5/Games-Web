import { useEffect, useRef, useState } from "react";
import PageWrapper from "../../PageWrapper";

const BOARD_HEIGHT = 500;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 40;
const MONSTER_SIZE = 45;
const LANES = 6;
const MONSTER_SPEED = 6;
const PLAYER_SPEED = 7; // سرعة موحدة وسلسة

const BASE_SPAWN_TIME = 1000; // البداية (سهلة)
const MIN_SPAWN_TIME = 300;  // الحد الأدنى (أقصى صعوبة)
const SPAWN_REDUCE_RATE = 50; // كل سكورة تقل قد إيه

export default function DodgeMonsters() {
  const boardRef = useRef(null);
  const playerRef = useRef(null); // ريف للاعب
  const monstersContainerRef = useRef(null); // حاوية الوحوش
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [boardWidth, setBoardWidth] = useState(340);

  // مراجع للقيم المتغيرة (بدون State عشان السرعة)
  const gameState = useRef({
    playerX: 150,
    monsters: [],
    score: 0,
    moveDir: null,
    lastSpawn: 0,
  });

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const updateWidth = () => {
      if (boardRef.current) {
        const width = boardRef.current.offsetWidth;
        setBoardWidth(width);
        gameState.current.playerX = width / 2 - PLAYER_WIDTH / 2;
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  /* ================= CONTROLS ================= */
  const startMove = (dir) => (gameState.current.moveDir = dir);
  const stopMove = () => (gameState.current.moveDir = null);

  useEffect(() => {
    const down = (e) => {
      if (e.key === "ArrowLeft") startMove("left");
      if (e.key === "ArrowRight") startMove("right");
    };
    const up = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") stopMove();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* ================= GAME LOOP (THE ENGINE) ================= */
  useEffect(() => {
    if (gameOver) return;

    let animationId;
    const laneWidth = boardWidth / LANES;

    const update = (time) => {
      const state = gameState.current;

      // 1. تحريك اللاعب
      if (state.moveDir === "left") {
        state.playerX = Math.max(0, state.playerX - PLAYER_SPEED);
      } else if (state.moveDir === "right") {
        state.playerX = Math.min(boardWidth - PLAYER_WIDTH, state.playerX + PLAYER_SPEED);
      }
      if (playerRef.current) {
        playerRef.current.style.transform = `translateX(${state.playerX}px)`;
      }

      // 2. توليد الوحوش
      const spawnTime = Math.max(
      BASE_SPAWN_TIME - state.score * SPAWN_REDUCE_RATE,
      MIN_SPAWN_TIME
    );
      if (time - state.lastSpawn > spawnTime) {
  const lane = Math.floor(Math.random() * LANES);
  const monsterEl = document.createElement("div");

    monsterEl.className =
      "absolute bg-red-500 rounded-lg shadow-lg";

    monsterEl.style.width = `${MONSTER_SIZE}px`;
    monsterEl.style.height = `${MONSTER_SIZE}px`;

    const x = lane * laneWidth + (laneWidth - MONSTER_SIZE) / 2;
    const y = -MONSTER_SIZE;

    monsterEl.style.transform = `translate(${x}px, ${y}px)`;
    monsterEl.style.willChange = "transform";

    monstersContainerRef.current.appendChild(monsterEl);

    state.monsters.push({
      id: Date.now() + Math.random(),
      x,
      y,
      el: monsterEl,
    });

  state.lastSpawn = time;
}

      // 3. تحريك الوحوش وفحص التصادم
      state.monsters = state.monsters.filter((m) => {
        m.y += MONSTER_SPEED;

        // تحديث العنصر في الـ DOM مباشرة
        if (m.el) {
          m.el.style.transform = `translate(${m.x}px, ${m.y}px)`;
        }

        // فحص التصادم
        const hit =
          m.y + MONSTER_SIZE > BOARD_HEIGHT - PLAYER_HEIGHT - 20 &&
          m.y < BOARD_HEIGHT - 20 &&
          m.x < state.playerX + PLAYER_WIDTH &&
          m.x + MONSTER_SIZE > state.playerX;

        if (hit) {
          setGameOver(true);
          return false;
        }

        // خروج الوحش من الشاشة
        if (m.y > BOARD_HEIGHT) {
          state.score += 1;
          setScore(state.score);
          if (m.el) m.el.remove();
          return false;
        }
        return true;
      });

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, boardWidth]);

  const resetGame = () => {
    gameState.current = {
      playerX: boardWidth / 2 - PLAYER_WIDTH / 2,
      monsters: [],
      score: 0,
      moveDir: null,
      lastSpawn: 0,
    };
    if (monstersContainerRef.current) monstersContainerRef.current.innerHTML = "";
    setScore(0);
    setGameOver(false);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center text-white touch-none select-none pt-10">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
          Dodge
        </h1>
        <p className="mb-4 text-xl font-bold text-pink-400">Score: {score}</p>

        <div
          ref={boardRef}
          className="relative w-full max-w-[340px] bg-black/30 border border-cyan-400/30 rounded-xl shadow-2xl neon overflow-hidden"
          style={{ height: BOARD_HEIGHT }}
        >
          {/* Player - Using transform for performance */}
          <div
            ref={playerRef}
            className="absolute bottom-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg shadow-lg"
            style={{
              width: PLAYER_WIDTH,
              height: PLAYER_HEIGHT,
              willChange: "transform",
            }}
          />

          {/* Monsters Container */}
          <div ref={monstersContainerRef} className="absolute inset-0"/>

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-sm pointer-events-auto">
              <h2 className="text-3xl font-bold text-red-500">GAME OVER</h2>
              <p className="text-2xl">Score: {score}</p>

              <button
                onClick={resetGame}
                className="px-8 py-3 rounded-full cursor-pointer border-2 border-cyan-400 text-cyan-400 font-bold hover:bg-cyan-400 hover:text-black transition shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex gap-10 mt-10 sm:hidden">
          <button
            onPointerDown={() => startMove("left")}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            className="w-20 h-20 rounded-full bg-white/10 text-4xl border border-white/20 active:bg-white/30"
          >
            ←
          </button>
          <button
            onPointerDown={() => startMove("right")}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            className="w-20 h-20 rounded-full bg-white/10 text-4xl border border-white/20 active:bg-white/30"
          >
            →
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}