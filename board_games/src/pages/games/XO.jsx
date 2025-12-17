import { useState, useEffect } from "react";
import PageWrapper from "../../PageWrapper";

export default function XO() {
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing"); // playing, finished
  const [mode, setMode] = useState("human"); // human or ai
  const [playerSymbol, setPlayerSymbol] = useState("X");

  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (board) => {
    for (let line of WINNING_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every((cell) => cell !== "")) return "draw";
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner || (mode === "ai" && turn !== playerSymbol)) return;
    
    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    
    const nextTurn = turn === "X" ? "O" : "X";
    setTurn(nextTurn);
    
    const result = checkWinner(newBoard);
    if (result) {
        setWinner(result);
        setGameStatus("finished");
    }
  };

  const minimax = (board, isMaximizing) => {
    let result = checkWinner(board);
    if (result === playerSymbol) return -10;
    if (result && result !== "draw") return 10;
    if (result === "draw") return 0;

    const aiSymbol = playerSymbol === "X" ? "O" : "X";

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let I = 0; I < 9; I++) {
        if (!board[I]) {
          board[I] = aiSymbol;
          const score = minimax(board, false);
          board[I] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let I = 0; I < 9; I++) {
        if (!board[I]) {
          board[I] = playerSymbol;
          const score = minimax(board, true);
          board[I] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const findBestMove = () => {
    const aiSymbol = playerSymbol === "X" ? "O" : "X";
    let bestScore = -Infinity;
    let move = -1;

    for (let I = 0; I < 9; I++) {
      if (!board[I]) {
        board[I] = aiSymbol;
        let score = minimax(board, false);
        board[I] = "";
        if (score > bestScore) {
          bestScore = score;
          move = I;
        }
      }
    }
    return move;
  };

  // AI move effect
  useEffect(() => {
    const result = checkWinner(board);
    if (result) {
      setWinner(result);
      setGameStatus("finished");
      return;
    }

    if (mode === "ai" && turn !== playerSymbol && gameStatus === "playing") {
      const move = findBestMove();
      if (move !== -1) {
        const newBoard = [...board];
        newBoard[move] = turn;
        setTimeout(() => {
          setBoard(newBoard);
          const nextTurn = turn === "X" ? "O" : "X";
          setTurn(nextTurn);
          
          const finalResult = checkWinner(newBoard);
          if (finalResult) {
              setWinner(finalResult);
              setGameStatus("finished");
          }
        }, 400);
      }
    }
  }, [board, turn, mode, playerSymbol, gameStatus]);

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setTurn("X");
    setGameStatus("playing");
  };
  
  const handleModeChange = (newMode) => {
      setMode(newMode);
      resetGame(); 
  };


  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6 flex flex-col items-center">

        {/* Title */}
        <h1 className="text-5xl font-black mb-4 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          XO
        </h1>

        {/* Mode & Symbol */}
        <div className="flex gap-4 mb-6">
          <select
            value={mode}
            onChange={(e) => handleModeChange(e.target.value)} 
            className="bg-[#111827] px-4 py-2 rounded-xl cursor-pointer"
          >
            <option value="human">Human vs Human</option>
            <option value="ai">Human vs AI</option>
          </select>

          <select
            value={playerSymbol}
            onChange={(e) => setPlayerSymbol(e.target.value)}
            className="bg-[#111827] px-4 py-2 rounded-xl cursor-pointer"
          >
            <option value="X">Play as X</option>
            <option value="O">Play as O</option>
          </select>
        </div>

        {/* Board */}
        <div className="p-4 bg-[#0d1323] rounded-3xl shadow-2xl border border-slate-800 mb-8">
          <div className="grid grid-cols-3 gap-3">
            {board.map((cell, index) => (
              <div
                key={index}
                onClick={() => handleClick(index)}
                className={`
                    w-20 h-20 md:w-24 md:h-24 bg-[#141a2e] shadow-inner rounded-2xl flex items-center justify-center text-4xl font-bold cursor-pointer hover:bg-[#1c2740] transition relative neon
                    ${!cell ? 'border-transparent hover:bg-[#1c2740] hover:border-slate-600' : 'border-[#1e293b]'}
                `}
              >
                {cell && 
                    <span 
                        className={`  
                            animate-letter-pop  
                            ${cell === 'X' ? 'text-cyan-400 glow-x' : ''}  
                            ${cell === 'O' ? 'text-pink-400 glow-o' : ''}  
                        `}  
                    >  
                        {cell}  
                    </span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Winner */}
        {winner && (
          <div className="text-2xl font-bold mb-3 text-white">
            {winner === "draw" ? <p>It's a draw 🤝</p> : <p>Winner: {winner} 🎉</p>}
          </div>
        )}
        
        {/* Reset/Play Again Button */}
        <div className="flex items-center justify-center">
          {gameStatus === "finished" ? 
          <button onClick={resetGame} className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition transform hover:scale-105 active:scale-95 cursor-pointer">
              Play Again
          </button> : 
          <button onClick={resetGame} className="text-slate-500 hover:text-white text-sm transition underline decoration-slate-700 underline-offset-4">
              Reset Board
          </button>} 
       </div>
      </div>

    </PageWrapper>
  );
}