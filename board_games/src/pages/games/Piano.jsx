import { useEffect, useState } from "react";
import PageWrapper from "../../PageWrapper";

const BOARD_HEIGHT = 600;

export default function PianoTiles() {
  const [tiles, setTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(3);
  const [spawnRate, setSpawnRate] = useState(1200);
  const [gameOver, setGameOver] = useState(false);

  // ⬇ Move tiles
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

  // 🧱 Spawn tiles
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      const col = Math.floor(Math.random() * 4);

      setTiles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(), // Unique ID
          col,
          y: -150,
        },
      ]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [spawnRate, gameOver]);

  // 💀 Lose condition
  useEffect(() => {
    tiles.forEach((t) => {
      if (t.y > BOARD_HEIGHT - 50) {
        setGameOver(true);
      }
    });
  }, [tiles]);

  // 🔥 Difficulty
  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setSpeed((s) => s + 0.6);
      setSpawnRate((r) => Math.max(r - 150, 400));
    }
  }, [score]);

  // ✅ الدالة الموحدة لللمس والماوس (الأكثر دقة)
  const hitTile = (id) => {
    if (gameOver) return;

    setTiles((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (!exists) return prev;

      setScore((s) => s + 1);
      
      // نرجع المصفوفة الجديدة من غير الطوبة اللي اتداست
      return prev.filter((t) => t.id !== id);
    });
  };

  // ⌨ Keyboard hit
  const hitColumn = (col) => {
    if (gameOver) return;

    setTiles((prev) => {
      const columnTiles = prev
        .filter((t) => t.col === col)
        .sort((a, b) => b.y - a.y);

      if (columnTiles.length === 0) return prev;
      // سماحية بسيطة عشان لو الطوبة لسه بتدخل الشاشة
      if (columnTiles[0].y < -100) return prev; 

      setScore((s) => s + 1);
      return prev.filter((t) => t.id !== columnTiles[0].id);
    });
  };

  // 🎹 Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === "a") hitColumn(0);
      if (key === "s") hitColumn(1);
      if (key === "k") hitColumn(2);
      if (key === "l") hitColumn(3);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver]);

  // 🔄 Reset
  const resetGame = () => {
    setTiles([]);
    setScore(0);
    setSpeed(3);
    setSpawnRate(1200);
    setGameOver(false);
  };

  return (
    <PageWrapper>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center justify-center relative touch-none select-none">

        {/* Title */}
        <h1 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Piano
        </h1>
        
        <div className=" text-cyan-400 text-xl font-bold z-10 mb-4">
          SCORE: {score}
        </div>

        {/* Board Container */}
        <div
          className="relative rounded-xl overflow-hidden border border-cyan-400/30 shadow-2xl neon bg-black/20"
          style={{ 
            height: BOARD_HEIGHT, 
            width: '100%', 
            maxWidth: '420px'
          }}
        >
          {/* ✅ Columns Grid 
             أضفنا pointer-events-none عشان نتأكد إن الخلفية والخطوط 
             مبتمنعش التاتش عن الطوب اللي فوقيها
          */}
          <div className="absolute inset-0 flex h-full w-full pointer-events-none z-0">
            {[0, 1, 2, 3].map((col) => (
              <div
                key={col}
                className="relative flex-1 border-r border-white/5 last:border-r-0 h-full"
              >
                {/* الحروف: تظهر فقط في الكمبيوتر (md) */}
                <div className="hidden md:block absolute bottom-4 w-full text-center text-white/20 font-bold text-xl">
                  {["A", "S", "K", "L"][col]}
                </div>
              </div>
            ))}
          </div>

          {/* Tiles */}
          {tiles.map((tile) => (
            <div
              key={tile.id}
              // ✅ استخدام onPointerDown هو الحل السحري للموبايل والماوس معاً
              onPointerDown={(e) => {
                e.preventDefault(); // يمنع أي زوم أو سكرول
                e.stopPropagation(); // يمنع الحدث يوصل للي تحته
                hitTile(tile.id);
              }}
              
              // ✅ z-index 10 and pointer-events-auto
              className="absolute rounded-lg cursor-pointer z-10 pointer-events-auto"
              style={{
                width: '25%', 
                left: `${tile.col * 25}%`,
                padding: '4px', // مسافة عشان التاتش ميبقاش لازق في بعضه
                height: 120, // طولتها شوية عشان يبقى الضغط أسهل
                top: tile.y,
                touchAction: 'none', // مهم جداً للموبايل
              }}
            >
                {/* الشكل الجمالي للطوبة */}
                <div className="w-full h-full rounded-md bg-gradient-to-br from-[#22d3ee] to-[#ec4899] shadow-lg shadow-cyan-500/50"></div>
            </div>
          ))}

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-sm">
              <h1 className="text-4xl font-bold text-red-500 tracking-wider">GAME OVER</h1>
              <p className="text-2xl text-white font-mono">Score: {score}</p>
              
              <button
                onClick={resetGame}
                className="px-8 py-3 rounded-full border-2 border-cyan-400 text-cyan-400 font-bold text-lg hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] active:scale-95 cursor-pointer z-50"
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