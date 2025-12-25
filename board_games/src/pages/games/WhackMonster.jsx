import { useEffect, useRef, useState } from "react";
import PageWrapper from "../../PageWrapper";

export default function WhackMonster() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isBad, setIsBad] = useState(false); // دي عشان لون الوحش في الشاشة
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(0);

  // بنستخدم Refs عشان نضمن ان التايمر واللعبة يقروا القيم الصح دايماً
  const timerRef = useRef(null);
  const gameIntervalRef = useRef(null);

  const MAX_LEVEL = 10;

  // معادلات السرعة
  const spawnSpeed = Math.max(500, 1200 - Math.min(level, MAX_LEVEL) * 60);
  const hideSpeed = Math.max(350, 900 - Math.min(level, MAX_LEVEL) * 40);

  /* ================= 🔥 DIFFICULTY ================= */
  useEffect(() => {
    const newLevel = Math.floor(score / 3);
    if (newLevel > level) setLevel(newLevel);
  }, [score]);

  /* ================= 👾 GAME LOOP ================= */
  useEffect(() => {
    if (gameOver) {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const startGameLoop = () => {
      gameIntervalRef.current = setInterval(() => {
        // 1. اختيار مكان عشوائي
        const index = Math.floor(Math.random() * 9);
        setActiveIndex(index);

        // 2. تحديد نوع الوحش (شرير ولا طيب) وتخزينه في متغير محلي
        // المتغير المحلي ده هو اللي الـ Timeout هيشوفه صح
        const isThisRoundBad = Math.random() < 0.25;
        setIsBad(isThisRoundBad);

        // 3. تنظيف أي تايمر قديم
        if (timerRef.current) clearTimeout(timerRef.current);

        // 4. ضبط تايمر اختفاء الوحش
        timerRef.current = setTimeout(() => {
          setActiveIndex(null); // اخفاء الوحش

          // اللحظة الحاسمة: الوحش هرب
          // لو الوحش كان "طيب" (مش شرير) -> نقص حياة
          if (!isThisRoundBad) {
            setLives((prevLives) => {
              const newLives = prevLives - 1;
              if (newLives <= 0) {
                setGameOver(true);
                return 0;
              }
              return newLives;
            });
          }
          // لو كان "شرير" وهرب -> مفيش حاجة تحصل (اللاعب ذكي انه مداسش)
          
        }, hideSpeed);
      }, spawnSpeed);
    };

    startGameLoop();

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [spawnSpeed, hideSpeed, gameOver, level]); // شيلنا lives من هنا عشان ميعملش ريستارت للوب

  /* ================= 👊 HIT MONSTER ================= */
  const hitMonster = (index) => {
    if (gameOver || index !== activeIndex) return;

    // أول حاجة نوقف تايمر الهروب فوراً عشان الـ lives متنقصش بالغلط
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setActiveIndex(null);

    if (isBad) {
      // ضربت وحش شرير -> نقص حياة
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameOver(true);
          return 0;
        }
        return newLives;
      });
    } else {
      // ضربت وحش طيب -> زود سكور
      setScore((s) => s + 1);
    }
  };

  /* ================= 🔄 RESET ================= */
  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setActiveIndex(null);
    setIsBad(false);
    setLevel(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
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
          <p className="mb-4 text-xl font-bold text-pink-400">
            Score: {score}
          </p>

          {/* القلوب بتعتمد على lives مباشرة */}
          <div className={`${gameOver ? "hidden" : "flex"} gap-1 text-red-500 text-xl`}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`transition-all duration-300 ${
                  i < lives ? "opacity-100 scale-100" : "opacity-0 scale-50"
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
                  className={"w-14 h-14 rounded-full glow-enemy z-10 pointer-events-auto cursor-pointer active:scale-95 transition"}
                  style={{
                    touchAction: "none",
                    backgroundColor: isBad ? "#1e40af" : "#ec4899", // أزرق للشرير، وردي للطيب
                  }}
                />
              )}
            </div>
          ))}

          {/* Game Over Screen */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-sm pointer-events-auto rounded-3xl">
              <h2 className="text-3xl font-bold text-red-500 animate-bounce">GAME OVER!</h2>
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