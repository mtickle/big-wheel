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

  // 2. THE CHOICE STATE (Stay vs. Spin Again)
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

  // 3. THE DEFAULT SPIN STATE
  return (
    <button
      onClick={onSpin}
      disabled={isSpinning}
      /* 1. Removed flex-1 (the cause of the skinniness)
         2. Added w-full max-w-md (gives it the same "heft" as the choice buttons)
         3. Kept your exact colors/shadows from the Spin Again button
      */
      className="w-full max-w-md py-6 bg-green-600 hover:bg-green-500 disabled:opacity-30 rounded-2xl text-2xl font-black italic shadow-[0_8px_0_rgb(20,83,45)] active:shadow-none active:translate-y-2 transition-all border-2 border-green-400"
    >
      {isSpinning ? "SPINNING..." : "SPIN THE WHEEL!"}
    </button>
  );
});

export default GameControls;