import { memo } from 'react';

const Scoreboard = memo(({ players, playerScores, bank, turn, leader, gameState, bonusEligible = [] }) => {
  return (
    <div className="bg-slate-800/40 p-5 rounded-2xl border-2 border-slate-700 flex flex-col w-full">

      <h3 className="text-sm font-sans text-slate-500 uppercase tracking-widest mb-3 px-1 flex justify-between">
        Contestants
      </h3>

      <div className="space-y-3">
        {players.map((p, i) => {
          const isBusted = playerScores[i] > 100;
          const isTheDollar = playerScores[i] === 100;
          const hasMoney = bank[i] > 0;
          // A player is "Eligible" if they are in the bonus list but NOT currently spinning
          const isEligible = bonusEligible.includes(i);
          const isActive = turn === i && gameState !== "finished";

          return (
            <div
              key={i}
              className={`p-3 rounded-xl transition-all duration-500 border ${isActive
                ? "bg-yellow-500/20 border-yellow-400  scale-[1.02]"
                : isEligible
                  ? "bg-green-500/10 border-green-500/50"
                  : isBusted
                    ? "bg-red-900/10 border-transparent opacity-40"
                    : "bg-slate-900/40 border-transparent opacity-80"
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className={` transition-colors ${isActive ? "text-yellow-400" : isEligible ? "text-green-400" : "text-slate-300"}`}>
                    {p.name}
                  </span>

                  {/* ✨ BONUS ELIGIBILITY BADGE */}
                  {isEligible && !isActive && (
                    <span className="text-[9px] font-sans text-yellow-500 mt-0.5 tracking-widest animate-pulse">
                      ★ BONUS QUALIFIED
                    </span>
                  )}

                  {/* 💰 THE BANK DISPLAY */}
                  {hasMoney && (
                    <span className="text-[10px] font-sans text-green-400 mt-1 tracking-wider">
                      ${bank[i].toLocaleString()} WON
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-mono font-sans block leading-none ${isTheDollar ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" :
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
      <div className={`mt-6 p-3 rounded-xl border-2 transition-all duration-700 ${gameState === "finished"
        ? "bg-yellow-500/20 border-yellow-400 shadow-[inset_0_0_15px_rgba(250,204,21,0.2)]"
        : "bg-green-900/20 border-emerald-500"
        }`}>
        <p className="text-xs font-sans uppercase b-0.5 tracking-widest">
          {gameState === "finished" ? "Showcase Winner" :
            gameState === "spin_off" ? "Tie-Breaker" :
              gameState === "bonus_round" ? "Bonus Round" : "Current Leader"}
        </p>
        <p className={`text-lg font-sans  truncate ${gameState === "finished" ? "text-yellow-400" : "text-white"}`}>
          {leader.index === -1 ? "Waiting ..." : players[leader.index].name}
        </p>
      </div>
    </div>
  );
});

export default Scoreboard;