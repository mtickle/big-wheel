import { memo } from 'react';

const GameControls = memo(({
  isSpinning,
  isAwaitingChoice,
  gameState,
  onSpin,
  onStay,
  onReset,
  players,
  turn,
  leader,
  bank,
}) => {

  //--- Extract the current player's name for use in multiple states
  const currentPlayerName = players[turn]?.name || "CONTESTANT";

  // 1. GAME OVER STATE
  if (gameState === "finished") {
    // Check if someone actually won (index 0, 1, or 2)
    const hasWinner = leader && leader.index !== -1;
    const winnerIndex = hasWinner ? leader.index : -1;

    const winnerName = hasWinner ? players[winnerIndex]?.name : "NO QUALIFIER";
    const totalWon = hasWinner ? (bank[winnerIndex] || 0) : 0;

    return (
      <div className="flex flex-col items-center gap-6 w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">
            {hasWinner ? "Showcase Representative" : "Game Over"}
          </div>
          <div className="text-4xl font-black text-white italic drop-shadow-lg">
            {winnerName}
          </div>

          {/* Only show the money if they actually won some! */}
          {hasWinner && totalWon > 0 ? (
            <div className="mt-2 py-1 px-4 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 font-bold text-sm inline-block animate-bounce">
              💰 TOTAL WINNINGS: ${totalWon.toLocaleString()}
            </div>
          ) : hasWinner ? (
            <div className="mt-2 text-slate-500 italic text-sm">
              Won the game (and some Mac & Cheese!)
            </div>
          ) : null}
        </div>

        <button
          onClick={onReset}
          className="w-full max-w-sm py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-1 transition-all border-2 border-blue-400"
        >
          New Showcase Showdown
        </button>
      </div>
    );
  }

  if (gameState === "bonus_only") {
    const currentPlayerName = players[turn]?.name || "CONTESTANT";

    return (
      <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-6 duration-500">
        {/* THE CELEBRATION HEADER */}
        {/* <div className="bg-yellow-500/10 border-2 border-yellow-500/50 p-4 rounded-2xl text-center w-full max-w-md">
          <div className="text-yellow-500 font-black uppercase text-xs tracking-[0.3em] mb-1">
            🏆 Automatic Winner 🏆
          </div>
          <div className="text-white font-bold text-lg leading-tight">
            {currentPlayerName} takes the Showcase!
          </div>
          <div className="text-yellow-400 text-sm italic mt-1 font-medium">
            Spin now for your $1,000 Bonus!
          </div>
        </div> */}

        <button
          onClick={onSpin}
          disabled={isSpinning}
          className="w-full 
            max-w-md 
            flex flex-col 
            items-center
            justify-center 
            py-4 px-8 rounded-2xl  text-2xl 
            bg-linear-to-b from-emerald-700 to-emerald-900
            hover:bg-emerald-500 text-white border-2 border-emerald-500 
            active:shadow-none active:translate-y-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-75"
        >
          <span className="text-xs font-sans text-emerald-200 uppercase tracking-wide mb-0.5">
            CONTESTANT 3 - DEFAULT WINNER
          </span>
          {isSpinning ? "BIG MONEY..." : "Bonus Spin for $1,000!"}
        </button>
      </div>
    );
  }

  // 2. BONUS ROUND STATE ($10k Chase)
  if (gameState === "bonus_round") {
    return (
      <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4">
        <div className="text-yellow-400 font-black text-center text-xl tracking-tighter drop-shadow-md uppercase">
          ✨ {currentPlayerName}: SPIN FOR THE $10,000 BONUS! ✨
        </div>
        <button
          onClick={onSpin}
          disabled={isSpinning}
          className="w-full max-w-md py-8 bg-linear-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 rounded-2xl text-3xl font-black italic shadow-[0_10px_0_rgb(133,77,14)] active:shadow-none active:translate-y-2 transition-all border-4 border-yellow-200 text-slate-900"
        >
          {isSpinning ? "BIG MONEY..." : "BONUS SPIN!"}
        </button>
      </div>
    );
  }

  // 3. SPIN-OFF STATE (Tie Breaker)
  if (gameState === "spin_off") {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="text-red-400 font-black uppercase text-sm tracking-[0.3em]">
          ⚠️ Sudden Death Spin-Off ⚠️
        </div>
        <button
          onClick={onSpin}
          disabled={isSpinning}
          className="w-full max-w-md py-6 bg-red-600 hover:bg-red-500 rounded-2xl text-2xl font-black italic shadow-[0_8px_0_rgb(153,27,27)] active:shadow-none active:translate-y-2 transition-all border-2 border-red-400"
        >
          {isSpinning ? "ELIMINATION SPIN..." : "TIE-BREAKER SPIN!"}
        </button>
      </div>
    );
  }

  // 4. THE CHOICE STATE (Stay vs. Spin Again)
  if (isAwaitingChoice) {

    return (
      <div className="flex gap-4 w-full max-w-md animate-in zoom-in duration-300">
        <button
          onClick={onStay}
          className="flex-1 flex flex-col items-center justify-center py-4 bg-linear-to-b from-slate-700 to-slate-900 hover:bg-slate-600 rounded-2xl
          
          active:shadow-none active:translate-y-2 transition-all border-2 border-slate-500"
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">
            {currentPlayerName}
          </span>
          <span className="text-2xl font-sans leading-none">
            Stay?
          </span>
        </button>

        <button
          onClick={onSpin}
          className="flex-1 flex flex-col items-center justify-center py-4 rounded-2xl bg-linear-to-b from-emerald-700 to-emerald-900 hover:bg-emerald-500 
          text-white border-2 border-emerald-500 active:shadow-none active:translate-y-2 transition-all duration-75"
        >
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide mb-0.5">
            {currentPlayerName}
          </span>
          <span className="text-2xl font-sans leading-none">
            Spin Again?
          </span>
        </button>
      </div>
    );
  }

  // 5. THE DEFAULT SPIN STATE
  return (
    <div className="w-full flex justify-center">
      <button
        onClick={onSpin}
        disabled={isSpinning}
        className="
          w-full max-w-md flex flex-col items-center justify-center 
          py-4 px-8 rounded-2xl  
          bg-linear-to-b from-emerald-700 to-emerald-900
           hover:bg-emerald-500 text-white border-2 border-emerald-500 
           active:shadow-none active:translate-y-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 transition-all duration-75"
      >
        <span className="text-xs font-sans text-emerald-200 uppercase tracking-wide mb-0.5">
          {currentPlayerName}
        </span>
        <span className="text-2xl font-sans leading-none">
          {isSpinning ? "Spinning ..." : "Spin the Wheel!"}
        </span>
      </button>
    </div>
  );

});

export default GameControls;