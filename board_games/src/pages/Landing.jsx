import { useNavigate } from "react-router-dom";
import PageWrapper from "../PageWrapper";
import Robot from "./Robot";

export default function Landing() {
        const navigate = useNavigate();

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center 
                    bg-gradient-to-br from-[#0A0F1F] via-[#132A4C] to-[#1D4B73]
                    text-white">

    <Robot mode="landing"/>
    <h1 className="text-7xl font-extrabold bg-clip-text text-transparent fcai-moving-bg"
    style={{backgroundImage: "url('/src/assets/logo.jpg')"}}>
        FCAI
    </h1>

    <h2 className="text-2xl mb-8 opacity-80 text-center">
        Faculty of Computers & Artificial Intelligence
    </h2>

    <button onClick={()=> navigate("/games")}
        className="px-6 py-3 bg-blue-500 cursor-pointer hover:bg-transparent border-2 border-transparent hover:border-blue-500
                rounded-xl text-lg font-semibold transition-all duration-300">
        دخول للألعاب
    </button>
    </div>
   
  );
}
