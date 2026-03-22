import { memo } from 'react';

const GameControls = memo(({
  isSpinning,
  isAwaitingChoice,
  gameState,
  onSpin,
  onStay,
  onReset
}) => {

  // 1. GAME OVER STATE
  if (gameState === "finished") {
    return (
      <button
        onClick={onReset}
        className="w-full max-w-sm py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-1 transition-all"
      >
        New Showcase Showdown
      </button>
    );
  }

  // 2. BONUS ROUND STATE ($10k Chase)
  if (gameState === "bonus_round" || gameState === "bonus_only") {
    return (
      <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4">
        <div className="text-yellow-400 font-black italic text-center text-xl tracking-tighter drop-shadow-md">
          {gameState === "bonus_round" ? "✨ SPINNING FOR THE $10,000 BONUS! ✨" : "🏆 VICTORY LAP SPIN!"}
        </div>
        <button
          onClick={onSpin}
          disabled={isSpinning}
          className="w-full max-w-md py-8 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 rounded-2xl text-3xl font-black italic shadow-[0_10px_0_rgb(133,77,14)] active:shadow-none active:translate-y-2 transition-all border-4 border-yellow-200 text-slate-900"
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
          className="flex-1 py-6 bg-slate-700 hover:bg-slate-600 rounded-2xl text-2xl font-black italic shadow-[0_8px_0_rgb(30,41,59)] active:shadow-none active:translate-y-2 transition-all border-2 border-slate-500"
        >
          STAY
        </button>
        <button
          onClick={onSpin}
          className="flex-1 py-6 bg-green-600 hover:bg-green-500 rounded-2xl text-2xl font-black italic shadow-[0_8px_0_rgb(20,83,45)] active:shadow-none active:translate-y-2 transition-all border-2 border-green-400"
        >
          SPIN AGAIN
        </button>
      </div>
    );
  }

  // 5. THE DEFAULT SPIN STATE
  return (
    <button
      onClick={onSpin}
      disabled={isSpinning}
      className="w-full max-w-md py-6 bg-green-600 hover:bg-green-500 disabled:opacity-30 rounded-2xl text-2xl font-black italic shadow-[0_8px_0_rgb(20,83,45)] active:shadow-none active:translate-y-2 transition-all border-2 border-green-400"
    >
      {isSpinning ? "SPINNING..." : "SPIN THE WHEEL!"}
    </button>
  );
});

export default GameControls;