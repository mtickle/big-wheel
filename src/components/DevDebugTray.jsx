
const DevDebugTray = ({
    isTurboMode,
    setIsTurboMode,
    isAutoPlaying,
    setIsAutoPlaying,
    setBonusEligible,
    setGameState,
    setTurn,
    setBonusIndex,
    logAction,
    forceDoubleBust
}) => {
    return (
        <div className="fixed bottom-4 right-4 flex gap-2 items-center z-50 bg-slate-900/90 p-2 rounded-lg shadow-2xl border border-slate-700/50 backdrop-blur-sm">

            <input
                type="checkbox"
                id="turboMode"
                checked={isTurboMode}
                onChange={(e) => setIsTurboMode(e.target.checked)}
                className="w-4 h-4 text-yellow-500 bg-slate-900 border-slate-600 rounded focus:ring-yellow-500 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="turboMode" className="text-sm font-mono text-slate-300 cursor-pointer select-none">
                🚀 TURBO MODE
            </label>

            <button
                onClick={() => setIsAutoPlaying(prev => !prev)}
                className={`ml-2 p-2 text-[10px] uppercase font-bold rounded border transition-all cursor-pointer ${isAutoPlaying
                    ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500 hover:bg-emerald-800'
                    : 'bg-slate-900/80 text-slate-400 border-slate-600/50 hover:bg-slate-800 hover:text-white'
                    }`}
            >
                {isAutoPlaying ? "🛑 Stop Auto" : "🤖 Start Auto"}
            </button>

            {/* FORCE BONUS BUTTON */}
            <button
                onClick={() => {
                    setBonusEligible([0]);
                    setGameState("bonus_round");
                    setTurn(0);
                    setBonusIndex(0);
                    logAction("DEBUG", "N/A", "1.00", "FORCED P1 BONUS ROUND");
                }}
                className="p-2 bg-slate-900/80 text-amber-400 text-[10px] uppercase font-bold rounded border border-amber-600/50 hover:bg-amber-900 hover:text-white transition-all opacity-50 hover:opacity-100 cursor-pointer"
            >
                ✨ Force P1 Bonus
            </button>

            {/* FORCE DOUBLE BUST BUTTON */}
            <button
                onClick={forceDoubleBust}
                className="p-2 bg-red-900/80 text-red-200 text-[10px] uppercase font-bold rounded border border-red-500/50 hover:bg-red-800 hover:text-white transition-all opacity-50 hover:opacity-100 cursor-pointer"
            >
                ☢️ Force P1/P2 Bust
            </button>

        </div>
    );
};

export default DevDebugTray;