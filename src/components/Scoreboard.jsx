import { memo } from 'react';

const Scoreboard = memo(({ players, playerScores, turn, leader, gameState }) => {
    return (
        <div className="bg-slate-800/80 p-5 rounded-2xl border-4 border-blue-600 shadow-xl w-full">
            <h2 className="text-xl font-black italic border-b border-blue-500 pb-2 text-blue-400 mb-4 tracking-tighter">
                CONTESTANTS
            </h2>

            <div className="space-y-3">
                {players.map((p, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-xl transition-all duration-300 ${turn === i
                            ? "bg-yellow-500/20 ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                            : "bg-slate-900/40 opacity-70"
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <span className={`font-bold ${turn === i ? "text-yellow-400" : "text-slate-300"}`}>
                                {p.name}
                            </span>
                            <span className="text-xl font-mono font-black text-green-400">
                                {playerScores[i] > 100 ? "BUST" : playerScores[i]}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`mt-6 p-3 rounded-xl border-2 transition-colors ${gameState === "finished" ? "bg-yellow-500/20 border-yellow-400 animate-pulse" : "bg-green-900/20 border-green-500"
                }`}>
                <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">
                    {gameState === "finished" ? "🏆 WINNER" : "CURRENT LEADER"}
                </p>
                <p className="text-lg font-black truncate">
                    {leader.index === -1 ? "NO QUALIFIER" : players[leader.index].name}
                </p>
            </div>
        </div>
    );
});

export default Scoreboard;