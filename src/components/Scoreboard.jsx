import { memo } from 'react';

const Scoreboard = memo(({ players, playerScores, bank, turn, leader, gameState }) => {
    return (
        <div className="bg-slate-800/80 p-5 rounded-2xl border-4 border-blue-600 shadow-xl w-full">
            <h2 className="text-xl font-black italic border-b border-blue-500 pb-2 text-blue-400 mb-4 tracking-tighter uppercase">
                Contestants
            </h2>

            <div className="space-y-3">
                {players.map((p, i) => {
                    const isBusted = playerScores[i] > 100;
                    const isTheDollar = playerScores[i] === 100;
                    const hasMoney = bank[i] > 0;
                    const isActive = turn === i && gameState !== "finished";

                    return (
                        <div
                            key={i}
                            className={`p-3 rounded-xl transition-all duration-500 ${isActive
                                ? "bg-yellow-500/20 ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-[1.02]"
                                : isBusted ? "bg-red-900/20 opacity-40" : "bg-slate-900/40 opacity-80"
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className={`font-bold transition-colors ${isActive ? "text-yellow-400" : "text-slate-300"}`}>
                                        {p.name}
                                    </span>
                                    {/* 💰 THE BANK DISPLAY */}
                                    {hasMoney && (
                                        <span className="text-[10px] font-black text-green-400 mt-1 animate-pulse tracking-wider">
                                            ${bank[i].toLocaleString()} WON
                                        </span>
                                    )}
                                </div>

                                <div className="text-right">
                                    <span className={`text-2xl font-mono font-black block leading-none ${
                                        isTheDollar ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" : 
                                        isBusted ? "text-red-500" : "text-green-400"
                                    }`}>
                                        {isBusted ? "BUST" : isTheDollar ? "1.00" : playerScores[i]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* LEADERBOARD FOOTER */}
            <div className={`mt-6 p-3 rounded-xl border-2 transition-all duration-700 ${
                gameState === "finished" 
                    ? "bg-yellow-500/20 border-yellow-400 shadow-[inset_0_0_15px_rgba(250,204,21,0.2)]" 
                    : "bg-green-900/20 border-green-500"
            }`}>
                <p className="text-[10px] font-black uppercase text-slate-500 mb-0.5 tracking-widest">
                    {gameState === "finished" ? "🏆 Showcase Winner" : 
                     gameState === "spin_off" ? "⚖️ Tie-Breaker" : "Current Leader"}
                </p>
                <p className={`text-lg font-black truncate ${gameState === "finished" ? "text-yellow-400" : "text-white"}`}>
                    {leader.index === -1 ? "NO QUALIFIER" : players[leader.index].name}
                </p>
            </div>
        </div>
    );
});

export default Scoreboard;