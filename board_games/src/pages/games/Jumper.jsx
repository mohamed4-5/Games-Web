import { useEffect, useRef, useState } from "react";
import PageWrapper from "../../PageWrapper";
import Robot from "../Robot";

/* ================= CONSTANTS ================= */
const WIDTH = 340;
const HEIGHT = 500;
const PLAYER_SIZE = 40;
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const PLATFORM_W = 70;
const PLATFORM_H = 14;

/* ✅ LIMITS */
const MAX_GAP = 130;     // أقصى مسافة بين البلاطات
const MIN_WIDTH = 65;   // أقل عرض للبلاطة

const BASE_PLATFORM_SPEED = 1.2;
const MAX_PLATFORM_SPEED = 3;

export default function PlatformerGame() {
  const animationRef = useRef(null);
  const [gameStatus, setGameStatus] = useState("playing");
  
  // نستخدم Refs للإدخال والحسابات الفيزيائية لتجنب إعادة الرندر
  const keys = useRef({});
  
  const physics = useRef({
    x: WIDTH / 2 - PLAYER_SIZE / 2,
    y: HEIGHT - 150,
    vx: 0,
    vy: 0,
    platforms: [],
    score: 0,
    gameOver: false,
  });

  // State للرندر فقط (يحتوي على القيم النهائية للعرض)
  const [renderState, setRenderState] = useState({
    playerX: WIDTH / 2 - PLAYER_SIZE / 2,
    playerY: HEIGHT - 150,
    rotation: 0, 
    platforms: [],
    score: 0,
    gameOver: false,
  });

  // دالة إنشاء المنصات مع معرفات فريدة (Unique IDs) لمنع اللاج
  const createPlatform = (y, id) => {
    return {
      x: Math.random() * (WIDTH - PLATFORM_W),
      y: y,
      w: PLATFORM_W,
      type: 'static',
      dir: Math.random() > 0.5 ? 1 : -1,
      id: id
    };
  };

  const initGame = () => {
    const plats = [];
    // منصة البداية
    plats.push({ x: WIDTH / 2 - PLATFORM_W / 2, y: HEIGHT - 60, w: PLATFORM_W, type: 'static', id: 'start' });
    
    // توليد منصات أولية
    for (let i = 1; i < 7; i++) {
      plats.push(createPlatform(HEIGHT - 60 - (i * 90), `init-${i}`));
    }

    physics.current = {
      x: WIDTH / 2 - PLAYER_SIZE / 2,
      y: HEIGHT - 150,
      vx: 0,
      vy: 0,
      platforms: plats,
      score: 0,
      gameOver: false,
    };
  };

  useEffect(() => {
    initGame();
    
    const down = (e) => (keys.current[e.key] = true);
    const up = (e) => (keys.current[e.key] = false);
    
    const touchStart = (key) => (keys.current[key] = true);
    const touchEnd = (key) => (keys.current[key] = false);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const startGameLoop = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const update = () => {
      const p = physics.current;
      
      if (p.gameOver) {
        return;
      }

      // 1. حساب الدوران والحركة الأفقية
      let currentRotation = 0;
      if (keys.current["ArrowLeft"]) {
        p.vx = -6;
        currentRotation = -10;
      } else if (keys.current["ArrowRight"]) {
        p.vx = 6;
        currentRotation = 10;
      } else {
        p.vx *= 0.8; // Friction
        currentRotation = 0;
      }

      p.x += p.vx;

      // Wrap-around
      if (p.x > WIDTH) p.x = -PLAYER_SIZE;
      if (p.x < -PLAYER_SIZE) p.x = WIDTH;

      // 2. الجاذبية
      p.vy += GRAVITY;
      p.y += p.vy;

      // 3. منطق الكاميرا (Scrolling)
      if (p.y < HEIGHT / 2) {
        const offset = (HEIGHT / 2) - p.y;
        p.y = HEIGHT / 2;
        p.score += offset; 
        
        p.platforms.forEach(plat => plat.y += offset);
      }

      // 4. التصادم (Collision)
      if (p.vy > 0) {
        p.platforms.forEach(plat => {
          if (
            p.x + PLAYER_SIZE * 0.6 > plat.x && 
            p.x + PLAYER_SIZE * 0.4 < plat.x + plat.w &&
            p.y + PLAYER_SIZE > plat.y &&
            p.y + PLAYER_SIZE < plat.y + PLATFORM_H + p.vy + 2
          ) {
            p.vy = JUMP_FORCE;
          }
        });
      }

      // 5. إدارة المنصات (إضافة وحذف)
      p.platforms = p.platforms.filter(plat => plat.y < HEIGHT); // حذف ما خرج من الشاشة

      const realScore = Math.floor(p.score / 10);
      const difficulty = Math.min(realScore / 500, 1);

      while (p.platforms.length < 7) {
        const lastPlat = p.platforms[p.platforms.length - 1];
        
                /* ✅ FIXED GAP & WIDTH */
        const rawGap = 90 + difficulty * 70;
        const gap = Math.min(rawGap, MAX_GAP);

        const rawWidth = PLATFORM_W - difficulty * 25;
        const w = Math.max(rawWidth, MIN_WIDTH);

        
        // --- التعديل هنا: منع المنصات المتحركة المتتالية ---
        let isMoving = false;
        
        // فقط لو المنصة السابقة كانت ثابتة، نفكر نعمل دي متحركة
        if (lastPlat.type !== 'moving') {
            isMoving = realScore > 100 && Math.random() < (0.3 + difficulty * 0.4);
        }
        
        const newPlat = {
            x: Math.random() * (WIDTH - w),
            y: lastPlat.y - gap,
            w: w,
            type: isMoving ? 'moving' : 'static',
            dir: Math.random() > 0.5 ? 1 : -1,
            id: `plat-${Math.random()}`
        };

        p.platforms.push(newPlat);
      }

      // تحريك المنصات المتحركة
      p.platforms.forEach(plat => {
        if (plat.type === 'moving') {
          const speed = BASE_PLATFORM_SPEED + difficulty * (MAX_PLATFORM_SPEED - BASE_PLATFORM_SPEED);

          plat.x += plat.dir * speed;
          if (plat.x <= 0 || plat.x >= WIDTH - plat.w) plat.dir *= -1;
        }
      });

      // 6. التحقق من الخسارة
      if (p.y > HEIGHT) {
        p.gameOver = true;
        setGameStatus("lose");
        setRenderState(prev => ({ ...prev, gameOver: true }));
        return;
      }

      // 7. تحديث الرندر
      setRenderState({
        playerX: p.x,
        playerY: p.y,
        rotation: currentRotation,
        platforms: p.platforms,
        score: realScore,
        gameOver: false
      });

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    startGameLoop();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const reset = () => {
    initGame();
    setGameStatus("playing");
    setRenderState(prev => ({ ...prev, gameOver: false, score: 0 }));
    startGameLoop();
  };

  const handleTouchStart = (key) => (keys.current[key] = true);
  const handleTouchEnd = (key) => (keys.current[key] = false);

  return (
    <PageWrapper>
      <Robot mode="game" gameStatus={gameStatus} />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white p-4 select-none font-sans">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">The Jumper</h1>
          <div className="text-4xl font-mono font-black text-cyan-400 tabular-nums drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
            {renderState.score}<span className="text-sm ml-1 text-cyan-200">m</span>
          </div>
        </div>

        {/* Game Container */}
        <div className="relative bg-slate-900 border-4 border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl" 
             style={{ width: WIDTH, height: HEIGHT }}>
          
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', 
                 backgroundSize: '30px 30px',
                 backgroundPosition: `0px ${renderState.score % 30}px` 
               }} />

          {/* PLAYER */}
          <div className="absolute bg-gradient-to-tr from-pink-500 to-rose-400 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.6)] z-20 flex flex-col items-center justify-center border-2 border-pink-300/30 will-change-transform"
               style={{ 
                 width: PLAYER_SIZE, 
                 height: PLAYER_SIZE, 
                 left: renderState.playerX, 
                 top: renderState.playerY,
                 transform: `rotate(${renderState.rotation}deg)`
               }} 
          >
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" />
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" />
            </div>
            <div className="w-3 h-1 bg-black/20 rounded-full mt-1" />
          </div>
          
          {/* PLATFORMS */}
          {renderState.platforms.map((p) => (
            <div key={p.id}
                 className={`absolute rounded-full border-b-[6px] transition-transform will-change-transform ${
                    p.type === 'moving' 
                    ? "bg-cyan-400 border-cyan-700 shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
                    : "bg-emerald-400 border-emerald-700 shadow-lg"
                 }`}
                 style={{ width: p.w, height: PLATFORM_H, left: p.x, top: p.y }} 
            />
          ))}

          {/* Game Over Screen */}
          {renderState.gameOver && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-6 z-50 backdrop-blur-sm animate-in fade-in duration-300">
              <h2 className="text-5xl font-black text-white italic drop-shadow-[0_4px_0_rgba(0,0,0,1)]">CRASHED!</h2>
              <div className="text-xl font-mono text-cyan-400 font-bold bg-slate-800/50 px-4 py-2 rounded-lg">
                SCORE: {renderState.score}m
              </div>
              <button onClick={reset} className="px-10 py-4 cursor-pointer bg-yellow-400 text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                TRY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex gap-4 mt-8 w-full max-w-[340px] h-20 md:hidden">
          <button 
            onPointerDown={() => handleTouchStart("ArrowLeft")} 
            onPointerUp={() => handleTouchEnd("ArrowLeft")}
            onPointerLeave={() => handleTouchEnd("ArrowLeft")}
            className="flex-1 bg-slate-800 rounded-2xl text-4xl active:bg-slate-700 touch-none border-b-4 border-slate-950 flex items-center justify-center shadow-lg text-white"
          >⬅</button>
          <button 
            onPointerDown={() => handleTouchStart("ArrowRight")} 
            onPointerUp={() => handleTouchEnd("ArrowRight")} 
            onPointerLeave={() => handleTouchEnd("ArrowRight")}
            className="flex-1 bg-slate-800 rounded-2xl text-4xl active:bg-slate-700 touch-none border-b-4 border-slate-950 flex items-center justify-center shadow-lg text-white"
          >➡</button>
        </div>
      </div>
    </PageWrapper>
  );
}