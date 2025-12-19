import { useEffect, useRef, useState } from "react";
import PageWrapper from "../../PageWrapper";

export default function WhackMonster() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const hideTimer = useRef(null);

  // السرعة بتزيد مع السكور
  const spawnSpeed = Math.max(500, 1200 - score * 60);
  const hideSpeed = Math.max(350, 900 - score * 40);

  // 👾 Spawn monster
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * 9);
      setActiveIndex(index);

      if (hideTimer.current) clearTimeout(hideTimer.current);

      hideTimer.current = setTimeout(() => {
        setActiveIndex(null);
        setMisses((m) => {
          if (m + 1 >= 3) {
            setGameOver(true);
            return m;
          }
          return m + 1;
        });
      }, hideSpeed);
    }, spawnSpeed);

    return () => {
      clearInterval(interval);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [score, gameOver]);

  // 👊 Hit
  const hitMonster = (index) => {
    if (gameOver) return;
    if (index !== activeIndex) return;

    if (hideTimer.current) clearTimeout(hideTimer.current);

    setScore((s) => s + 1);
    setActiveIndex(null);
  };

  // 🔄 Reset
  const resetGame = () => {
    setScore(0);
    setMisses(0);
    setGameOver(false);
    setActiveIndex(null);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center pt-16 text-white select-none touch-none">

        {/* Title */}
        <h1 className="text-4xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Whack
        </h1>

        {/* HUD */}
        <div className="flex gap-20 mb-6 pointer-events-none">
          <p className="mb-4 text-xl font-bold text-pink-400">Score: {score}</p>

          <div className={`${gameOver ? "hidden" : "flex"} gap-1 text-red-500 text-xl`}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`transition-all duration-300 ${
                  i < 3 - misses ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              >
                ❤
              </span>
            ))}
          </div>
        </div>

        {/* Board */}
        <div className="relative grid grid-cols-3 gap-4 p-6 bg-[#0d1323] rounded-3xl shadow-xl neon pointer-events-none">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="w-24 h-24 bg-[#141a2e] rounded-2xl flex items-center justify-center"
            >
              {activeIndex === index && (
                <div
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    hitMonster(index);
                  }}
                  className="w-14 h-14 bg-pink-500 rounded-full glow-enemy z-10 pointer-events-auto cursor-pointer active:scale-95 transition"
                  style={{ touchAction: "none" }}
                />
              )}
            </div>
          ))}

          {/* Game Over */}
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
      </div>
    </PageWrapper>
  );
}