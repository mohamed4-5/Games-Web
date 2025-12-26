import { useEffect, useRef, useState } from "react";

export default function Robot({
  mode = "landing", // landing | game
  gameStatus = "playing", // playing | lose | win
}) {
  const [state, setState] = useState("idle"); // idle | hurt | lose | win
  const [message, setMessage] = useState("Hi! My name is Sayed 👋");
  const timeoutRef = useRef(null);

  /* ================= LANDING CLICK ================= */
  const handleClick = () => {
    if (mode !== "landing") return;
    if (state === "hurt") return;

    setState("hurt");
    setMessage("Ouch! 😵");

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState("idle");
      setMessage("Hi! My name is Sayed 👋");
    }, 1500);
  };

  /* ================= GAME MODE REACTIONS ================= */
  useEffect(() => {
    if (mode !== "game") return;

    if (gameStatus === "lose") {
      setState("lose");
      setMessage("😂😂 Skill issue!");
    }

    if (gameStatus === "win") {
      setState("win");
      setMessage("LET'S GOO 🔥🎉");
    }

    if (gameStatus === "playing") {
      setState("idle");
      setMessage("");
    }
  }, [gameStatus, mode]);

  /* ================= VISIBILITY ================= */
  const isVisible =
    mode === "landing" || (mode === "game" && gameStatus !== "playing");

  if (!isVisible) return null;

  return (
    <div
  onClick={handleClick}
  className={`
    fixed 
    ${mode === "game" ? "top-6 right-6 md:right-80" : "bottom-6 right-6"}
    w-32 
    cursor-pointer 
    select-none 
    z-[9999] 
    flex 
    flex-col 
    items-center
  `}
>
      {/* Message */}
      {message && (
        <div className="px-4 py-2 mb-3 bg-white text-black rounded-xl shadow text-sm font-semibold text-center animate-fade">
          {message}
        </div>
      )}

      {/* Robot Image */}
      {state === "hurt" && (
        <img
          src="/games/hitRobot.png"
          alt="Robot Hurt"
          className="w-full drop-shadow-lg animate-shake"
        />
      )}

      {state === "lose" && (
        <img
          src="/games/loseRobot.png"
          alt="Robot Lose"
          className="w-full drop-shadow-lg"
        />
      )}

      {state === "win" && (
        <img
          src="/games/winRobot.png"
          alt="Robot Win"
          className="w-full drop-shadow-lg animate-bounce"
        />
      )}

      {state === "idle" && (
        <img
          src="/games/robot.png"
          alt="Robot Idle"
          className="w-full drop-shadow-lg"
        />
      )}
    </div>
  );
}