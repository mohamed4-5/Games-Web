import { useEffect, useState } from "react";
import PageWrapper from "../../PageWrapper";

const BOARD_HEIGHT = 600;
const MAX_SPEED = 10; // أقصى سرعة ممكنة

export default function PianoTiles() {
  const [tiles, setTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(6);
  const [spawnRate, setSpawnRate] = useState(900);
  const [gameOver, setGameOver] = useState(false);

  /* ================= ⬇ تحريك الطوب ================= */
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setTiles((prev) =>
        prev.map((t) => ({
          ...t,
          y: t.y + speed,
        }))
      );
    }, 16);

    return () => clearInterval(interval);
  }, [speed, gameOver]);

  /* ================= 🧱 إنشاء الطوب ================= */
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const col = Math.floor(Math.random() * 4);
      setTiles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          col,
          y: -150,
        },
      ]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [spawnRate, gameOver]);

  /* ================= 💀 شروط الخسارة (تجاوز الشاشة) ================= */
  useEffect(() => {
    tiles.forEach((t) => {
      if (t.y > BOARD_HEIGHT - 50) {
        setGameOver(true);
      }
    });
  }, [tiles]);

  /* ================= 🔥 زيادة الصعوبة وتثبيت السرعة ================= */
  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setSpeed((s) => Math.min(s + 0.6, MAX_SPEED));
      setSpawnRate((r) => Math.max(r - 150, 300));
    }
  }, [score]);

  /* ================= ✅ الضغط الصحيح على الطوبة ================= */
  const hitTile = (id) => {
    if (gameOver) return;

    setTiles((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (!exists) return prev;

      setScore((s) => s + 1);
      return prev.filter((t) => t.id !== id);
    });
  };

  /* ================= ⌨ التحكم بالكيبورد ================= */
  const hitColumn = (col) => {
    if (gameOver) return;

    setTiles((prev) => {
      const columnTiles = prev
        .filter((t) => t.col === col)
        .sort((a, b) => b.y - a.y);

      if (columnTiles.length === 0) {
        // لو داس كيبورد ومفيش طوبة في العمود ده يخسر
        setGameOver(true);
        return prev;
      }
      
      if (columnTiles[0].y < -100) return prev; 

      setScore((s) => s + 1);
      return prev.filter((t) => t.id !== columnTiles[0].id);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || gameOver) return;
      const key = e.key.toLowerCase();
      if (key === "a") hitColumn(0);
      if (key === "s") hitColumn(1);
      if (key === "k") hitColumn(2);
      if (key === "l") hitColumn(3);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, tiles]); // أضفت tiles لضمان دقة الكيبورد

  /* ================= 🔄 إعادة اللعب ================= */
  const resetGame = () => {
    setTiles([]);
    setScore(0);
    setSpeed(6); // القيمة الابتدائية عند الريستارت
    setSpawnRate(900);
    setGameOver(false);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center relative touch-none select-none overflow-hidden">

         {/* Title */}
        <h1 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Piano
        </h1>
        
        <div className=" text-cyan-400 text-xl font-bold z-10 mb-4">
          SCORE: {score}
        </div>

        {/* Board Container */}
        <div
          // 🛑 الخسارة عند الضغط في أي مكان فاضي بالبوردة
          onPointerDown={() => {
            if (!gameOver) setGameOver(true);
          }}
          className="relative rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black/40 cursor-pointer"
          style={{ 
            height: BOARD_HEIGHT, 
            width: '100%', 
            maxWidth: '400px',
            touchAction: 'none' 
          }}
        >
          {/* Columns Lines */}
          <div className="absolute inset-0 flex h-full w-full pointer-events-none z-0">
            {[0, 1, 2, 3].map((col) => (
              <div key={col} className="flex-1 border-r border-white/10 last:border-r-0 h-full relative">
                <div className="hidden md:block absolute bottom-4 w-full text-center text-white/10 font-bold">
                  {["A", "S", "K", "L"][col]}
                </div>
              </div>
            ))}
          </div>

          {/* Tiles */}
          {tiles.map((tile) => (
            <div
              key={tile.id}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation(); // ✅ يمنع وصول الضغطة للبوردة فلا تخسر
                hitTile(tile.id);
              }}
              className="absolute p-1 z-10 pointer-events-auto"
              style={{
                width: '25%', 
                left: `${tile.col * 25}%`,
                height: 140,
                top: tile.y,
                touchAction: 'none',
              }}
            >
                <div className="w-full h-full rounded-lg bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.4)] border border-white/20 active:brightness-125 transition-all"></div>
            </div>
          ))}

          {/* Game Over Screen */}
          {gameOver && (
            <div 
              onPointerDown={(e) => e.stopPropagation()} // منع التفاعل مع البوردة أثناء القائمة
              className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-md"
            >
              <h1 className="text-5xl font-bold text-red-500 animate-bounce">GAME OVER!</h1>
              <div className="text-center">
                <p className="text-white/60 text-sm">FINAL SCORE</p>
                <p className="text-4xl text-white font-mono">{score}</p>
              </div>
              
              <button
                onClick={resetGame}
                className="px-9 py-3 rounded-full border-2 border-cyan-400 text-cyan-400 font-bold text-lg hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] active:scale-95 cursor-pointer z-50"
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