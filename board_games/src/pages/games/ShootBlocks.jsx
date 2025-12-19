import { useEffect, useRef, useState } from "react";
import PageWrapper from "../../PageWrapper";

const BOARD_HEIGHT = 500;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 40;
const ENEMY_SIZE = 40;
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 14;

// قللت السرعة شوية لأننا هنحرك في كل فريم (كان 10 خليته 7)
const PLAYER_SPEED = 6; 

const BULLET_SPEED = 3;
const ENEMY_SPEED = 2;
const SHOOT_INTERVAL = 600; 

export default function ShootBlocks() {
  const boardRef = useRef(null);
  const animationRef = useRef(null);
  const shootRef = useRef(null);
  
  const playerXRef = useRef(125); 

  // Ref للموبايل
  const moveControl = useRef(null); 
  // Ref للكيبورد (عشان نخزن حالة الزرار مضغوط ولا لأ)
  const keysPressed = useRef({ left: false, right: false });

  const [boardWidth, setBoardWidth] = useState(300);
  const [playerX, setPlayerX] = useState(125);

  const [enemies, setEnemies] = useState([]);
  const [bullets, setBullets] = useState([]);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  /* ================= HANDLERS FOR MOBILE ================= */
  const startMove = (direction) => {
    moveControl.current = direction;
  };
  const stopMove = () => {
    moveControl.current = null;
  };

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const resize = () => {
      if (boardRef.current) {
        setBoardWidth(boardRef.current.offsetWidth);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ================= KEYBOARD LISTENERS (Flags Only) ================= */
  // التغيير هنا: الكيبورد مش بيحرك، هو بس بيغير الـ Flag
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") keysPressed.current.left = true;
      if (e.key === "ArrowRight") keysPressed.current.right = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowLeft") keysPressed.current.left = false;
      if (e.key === "ArrowRight") keysPressed.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  /* ================= AUTO SHOOT ================= */
  useEffect(() => {
    if (gameOver) return;

    shootRef.current = setInterval(() => {
      setBullets((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: playerXRef.current + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
          y: BOARD_HEIGHT - PLAYER_HEIGHT - 20,
        },
      ]);
    }, SHOOT_INTERVAL);

    return () => clearInterval(shootRef.current);
  }, [gameOver]); 

  /* ================= SPAWN ENEMIES ================= */
  useEffect(() => {
    if (gameOver) return;

    const spawn = setInterval(() => {
      setEnemies((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * (boardWidth - ENEMY_SIZE),
          y: -ENEMY_SIZE,
        },
      ]);
    }, 900);

    return () => clearInterval(spawn);
  }, [boardWidth, gameOver]);

  /* ================= GAME LOOP ================= */
  useEffect(() => {
    if (gameOver) return;

    const update = () => {
      
      // ============ UNIFIED MOVEMENT LOGIC ============
      // بنشوف هل الكيبورد أو الموبايل طالبين حركة
      const isMovingLeft = keysPressed.current.left || moveControl.current === "left";
      const isMovingRight = keysPressed.current.right || moveControl.current === "right";

      if (isMovingLeft) {
        setPlayerX((prev) => {
          const newX = Math.max(0, prev - PLAYER_SPEED);
          playerXRef.current = newX; 
          return newX;
        });
      } 
      
      if (isMovingRight) {
        setPlayerX((prev) => {
          const newX = Math.min(boardWidth - PLAYER_WIDTH, prev + PLAYER_SPEED);
          playerXRef.current = newX;
          return newX;
        });
      }
      // ================================================

      // Move bullets
      let newBullets = bullets
        .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter((b) => b.y > -BULLET_HEIGHT);

      let newEnemies = [];

      enemies.forEach((enemy) => {
        let hit = false;
        newBullets = newBullets.filter((b) => {
          const collide =
            b.x < enemy.x + ENEMY_SIZE &&
            b.x + BULLET_WIDTH > enemy.x &&
            b.y < enemy.y + ENEMY_SIZE &&
            b.y + BULLET_HEIGHT > enemy.y;

          if (collide) {
            hit = true;
            setScore((s) => s + 1);
            return false;
          }
          return true;
        });

        if (!hit) {
          const newY = enemy.y + ENEMY_SPEED;
          if (newY + ENEMY_SIZE > BOARD_HEIGHT - PLAYER_HEIGHT) {
            setGameOver(true);
          } else {
            newEnemies.push({ ...enemy, y: newY });
          }
        }
      });

      setBullets(newBullets);
      setEnemies(newEnemies);
      
      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [bullets, enemies, gameOver, boardWidth]); 

  /* ================= RESET ================= */
  const resetGame = () => {
    setEnemies([]);
    setBullets([]);
    setScore(0);
    setGameOver(false);
    setPlayerX(125);
    playerXRef.current = 125;
    moveControl.current = null;
    keysPressed.current = { left: false, right: false }; // Reset keys
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex flex-col items-center pt-6 text-white pb-24">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
          Shoot
        </h1>
        <p className="mb-4 text-xl font-bold text-pink-400">Score: {score}</p>

        <div
          ref={boardRef}
          className="relative w-full max-w-[340px] bg-black/30 border border-cyan-400/30 rounded-xl shadow-2xl neon overflow-hidden"
          style={{ height: BOARD_HEIGHT }}
        >
          {/* Player */}
          <div
            className="absolute bottom-3 bg-blue-500 rounded-md"
            style={{
              width: PLAYER_WIDTH,
              height: PLAYER_HEIGHT,
              left: playerX,
            }}
          />

          {/* Bullets */}
          {bullets.map((b) => (
            <div
              key={b.id}
              className="absolute bg-yellow-300"
              style={{
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                left: b.x,
                top: b.y,
              }}
            />
          ))}

          {/* Enemies */}
          {enemies.map((e) => (
            <div
              key={e.id}
              className="absolute bg-red-500 rounded-md"
              style={{
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
                left: e.x,
                top: e.y,
              }}
            />
          ))}

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
        <div className="sm:hidden fixed bottom-0 w-full flex p-4 bg-[#0d1323]/70 backdrop-blur z-30">
          <div className="flex justify-evenly w-full">
            <button
              onPointerDown={() => startMove("left")}
              onPointerUp={stopMove}
              onPointerLeave={stopMove}
              className="w-20 h-20 rounded-full bg-cyan-600/50 active:bg-cyan-500 text-4xl flex items-center justify-center select-none shadow-lg border-2 border-cyan-400/30"
            >
              ←
            </button>
            <button
              onPointerDown={() => startMove("right")}
              onPointerUp={stopMove}
              onPointerLeave={stopMove}
              className="w-20 h-20 rounded-full bg-cyan-600/50 active:bg-cyan-500 text-4xl flex items-center justify-center select-none shadow-lg border-2 border-cyan-400/30"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}