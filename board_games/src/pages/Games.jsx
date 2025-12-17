import XO from "./games/XO";
import { useEffect, useState } from "react";
import PageWrapper from "../PageWrapper";
import { useNavigate } from "react-router-dom";

export default function Games() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/data/games.json")
      .then(res => res.json())
      .then(data => setGames(data));
  }, []);

  return (
    <PageWrapper>
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6">
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg text-center mb-10">
            Available Games
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game) => (
            <div
                key={game.id}
                className="max-w-sm text-center bg-[#111827] rounded-2xl overflow-hidden border border-[#1f2937] shadow-lg hover:shadow-xl transition duration-300 hover:-translate-y-1 "
            >
                <img
                src={game.image}
                className="w-full h-40 object-cover"
                alt={game.name}
                />

                <div className="p-4">
                <h2 className="text-xl font-bold text-white">{game.name}</h2>

                <p className="text-gray-400 text-sm mt-1">
                    {game.description}
                </p>

                <button className="mt-4 w-full py-2 rounded-xl bg-purple-600 hover:bg-transparent hover:border hover:border-purple-600 cursor-pointer transition duration-300 text-white"
                onClick={()=> navigate(`/${game.name}`)}>
                    Start Game
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    </PageWrapper>
  );
}