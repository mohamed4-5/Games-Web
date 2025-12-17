import { useEffect, useState } from "react";

import PageWrapper from "../../PageWrapper";

export default function Shooter() {
  // ⚙ الثابت الجديد لعرض اللعبة (520px / 2 = 260)
  const PLAYER_X = 260; 

  const [direction, setDirection] = useState("right");
  const [shots, setShots] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [lives, setLives] = useState(3);

  const [score, setScore] = useState(0);
  // 🔥 الصعوبة: السرعة الابتدائية 4
  const [enemySpeed, setEnemySpeed] = useState(4);
  // 🔥 الصعوبة: معدل الظهور 1500ms
  const [spawnRate, setSpawnRate] = useState(1500);

  const [canShoot, setCanShoot] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);

  /* ================= 🔫 SHOOT ================= */
  const shoot = () => {
    if (!canShoot || isGameOver) return;

    setCanShoot(false);
    setShots((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: PLAYER_X, // يستخدم PLAYER_X الجديد (260)
        dir: direction,
      },
    ]);

    setTimeout(() => setCanShoot(true), 250);
  };

  /* ================= 🎹 CONTROLS ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;

      if (e.key === "ArrowLeft") setDirection("left");
      if (e.key === "ArrowRight") setDirection("right");
      if (e.key === " ") shoot();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, canShoot, isGameOver]);

  /* ================= 👾 SPAWN ================= */
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      const side = Math.random() > 0.5 ? "left" : "right";
      const rand = Math.random();

      // Tank enemy
      if (rand < 0.35) {
        setEnemies((prev) => [
          ...prev,
          {
            id: Date.now(),
            side,
            // ⚙ مكان ظهور الأعداء: 0 لليسار و 480 لليمين (520 - 40 عرض العدو)
            x: side === "left" ? 0 : 480, 
            hp: 2,
          },
        ]);
        return;
      }

      // Normal enemy
      setEnemies((prev) => [
        ...prev,
        {
          id: Date.now(),
          side,
          // ⚙ مكان ظهور الأعداء: 0 لليسار و 480 لليمين
          x: side === "left" ? 0 : 480,
          hp: 1,
        },
      ]);
    }, spawnRate);

    return () => clearInterval(interval);
  }, [spawnRate, isGameOver]);

  /* ================= 🏃 MOVE ENEMIES ================= */
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setEnemies((prev) =>
        prev.map((e) => ({
          ...e,
          x: e.side === "left" ? e.x + enemySpeed : e.x - enemySpeed,
        }))
      );
    }, 60);

    return () => clearInterval(interval);
  }, [enemySpeed, isGameOver]);

  /* ================= 💥 MOVE SHOTS ================= */
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setShots((prev) =>
        prev
          .map((s) => ({
            ...s,
            x: s.dir === "right" ? s.x + 12 : s.x - 12,
          }))
          // ⚙ مدى اختفاء الطلقات: 520 (الحد الأقصى للعرض)
          .filter((s) => s.x > 0 && s.x < 520) 
      );
    }, 40);

    return () => clearInterval(interval);
  }, [isGameOver]);

  /* ================= 🎯 COLLISION ================= */
  useEffect(() => {
    if (isGameOver) return;

    // 1. تحديد التصادمات
    const hits = [];
    shots.forEach((shot) => {
      // يستخدم PLAYER_X الجديد (260)
      const enemy = enemies.find((e) => Math.abs(shot.x - e.x) < 15); 
      if (enemy) {
        hits.push({ shotId: shot.id, enemyId: enemy.id });
      }
    });

    if (hits.length === 0) return;

    // 2. تحديث الأعداء
    setEnemies((prev) =>
      prev
        .map((enemy) => {
          const isHit = hits.find((h) => h.enemyId === enemy.id);
          if (isHit) {
            const newHp = enemy.hp - 1;
            if (newHp <= 0) {
                setScore(s => s + 10);
            }
            return { ...enemy, hp: newHp };
          }
          return enemy;
        })
        .filter((e) => e.hp > 0)
    );

    // 3. إزالة الطلقات
    setShots((prev) =>
      prev.filter((shot) => !hits.find((h) => h.shotId === shot.id))
    );

  }, [shots, enemies, isGameOver]);

  /* ================= ❤ PLAYER HIT ================= */
  useEffect(() => {
    if (isGameOver) return;

    enemies.forEach((enemy) => {
      // يستخدم PLAYER_X الجديد (260)
      if (Math.abs(enemy.x - PLAYER_X) < 20) { 
        setEnemies((prev) => prev.filter((e) => e.id !== enemy.id));
        setLives((l) => {
          if (l - 1 <= 0) {
            setIsGameOver(true);
            return 0;
          }
          return l - 1;
        });
      }
    });
  }, [enemies]);

  /* ================= 🔥 DIFFICULTY ================= */
  useEffect(() => {
    if (score > 0 && score % 25 === 0) {
      setEnemySpeed((s) => Math.min(s + 1, 10));
      setSpawnRate((r) => Math.max(r - 200, 500));
    }
  }, [score]);

  /* ================= 🔄 RESET ================= */
  const resetGame = () => {
    setDirection("right");
    setShots([]);
    setEnemies([]);
    setLives(3);
    setScore(0);
    setEnemySpeed(4);
    setSpawnRate(1500);
    setIsGameOver(false);
  };

  return (
    <PageWrapper>
      {/* ⚙ Padding سفلي للشاشات الصغيرة لتجنب إخفاء الأزرار */}
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center justify-center relative overflow-hidden pb-40 sm:pb-0"> 
        
        {/* Title */}
        <h1 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          Shooter
        </h1>
        <div className="flex flex-col gap-0">
          {/* HUD */}
          <div className=" text-cyan-400 text-xl font-bold z-10">
            SCORE: {score}
          </div>

          <div className=" text-red-400 text-xl z-10">
            {"❤".repeat(lives)}
          </div>
        </div>
        {/* GAME CARD */}
        {/* ⚙ العرض 520px وتم تطبيق responsive scale-90 */}
        <div className="relative w-[520px] h-[520px] mt-10 bg-[#0d1323] rounded-3xl border border-cyan-500/30 neon overflow-hidden transform scale-70 sm:scale-100 origin-center transition-transform">

          {/* Player (استخدام clip-path) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-14 h-14 bg-cyan-400 glow-player transition-transform duration-100`}
              style={{
                clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
                transform: `rotate(${direction === "left" ? "0deg" : "180deg"})`
              }}
            />
          </div>

          {/* Enemies */}
          {enemies.map((e) => (
            <div
              key={e.id}
              className={`absolute top-1/2 -translate-y-1/2 rounded-full ${
                e.hp === 2
                  ? "w-12 h-12 bg-red-500"
                  : "w-10 h-10 bg-pink-500"
              }`}
              style={{ left: e.x }}
            />
          ))}

          {/* Shots */}
          {shots.map((s) => (
            <div
              key={s.id}
              className="absolute top-1/2 w-3 h-3 bg-yellow-400 rounded-full"
              style={{ left: s.x }}
            />
          ))}

          {isGameOver && (
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
        
        
        {/* ================= 🎮 MOBILE TOUCH CONTROLS ================= */}
        {/* ⚙ تظهر فقط على الشاشات الأصغر من SM */}
        <div className="sm:hidden fixed bottom-0 w-full flex justify-between items-center p-4 bg-[#0d1323]/50 backdrop-blur-sm z-30">
            
            {/* أزرار الاتجاهات (Left/Right) */}
            <div className="flex gap-4">
                <button
                    onClick={() => setDirection("left")}
                    className="w-16 h-16 bg-cyan-600/50 hover:bg-cyan-600 active:bg-cyan-700 text-white text-3xl rounded-full border border-cyan-400 flex items-center justify-center transition"
                    aria-label="Move Left"
                    disabled={isGameOver}
                >
                    &larr;
                </button>
                <button
                    onClick={() => setDirection("right")}
                    className="w-16 h-16 bg-cyan-600/50 hover:bg-cyan-600 active:bg-cyan-700 text-white text-3xl rounded-full border border-cyan-400 flex items-center justify-center transition"
                    aria-label="Move Right"
                    disabled={isGameOver}
                >
                    &rarr;
                </button>
            </div>

            {/* زر إطلاق النار (Fire) */}
            <button
                onClick={shoot}
                className={`w-20 h-20 text-xl font-bold rounded-full border-4 border-red-500 transition 
                ${canShoot && !isGameOver ? "bg-red-700/70 text-white shadow-red-500/50 shadow-lg active:bg-red-600" : "bg-gray-700/50 text-gray-500 cursor-not-allowed"}`}
                aria-label="Shoot"
                disabled={!canShoot || isGameOver}
            >
                FIRE
            </button>
        </div>

      </div>
    </PageWrapper>
  );
}