import { memo } from 'react';

const GameLogs = memo(({ logs }) => {
    return (
        <div className="bg-slate-800/40 p-4 rounded-2xl border-2 border-slate-700 flex flex-col h-[350px] w-full">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3 px-1 flex justify-between">
                <span>Game History</span>
                {logs.length > 0 && <span className="text-[9px] animate-pulse text-red-500">● LIVE</span>}
            </h3>

            <div className="overflow-y-auto flex-1 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {logs.map(log => {
                    const isBigWin = log.status?.includes("$") || log.status?.includes("WINNER");
                    const isSystem = log.name === "SYSTEM";

                    return (
                        <div
                            key={log.id}
                            className={`text-[10px] p-2 rounded-lg border-l-4 transition-all animate-in slide-in-from-left-2 ${isBigWin
                                ? "bg-yellow-500/10 border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.1)]"
                                : isSystem
                                    ? "bg-blue-500/10 border-blue-500 italic"
                                    : "bg-slate-900/50 border-slate-600 opacity-90"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-0.5">
                                <span className={`font-black uppercase tracking-tighter ${isBigWin ? "text-yellow-400" : isSystem ? "text-blue-400" : "text-slate-400"}`}>
                                    {log.name}
                                </span>

                            </div>

                            <div className="flex items-center gap-1">
                                {log.spin !== "N/A" && (
                                    <>
                                        <span className="text-yellow-500/90 font-bold">Spun {log.spin}</span>
                                        <span className="text-slate-600">→</span>
                                    </>
                                )}
                                <span className="font-black text-white">{log.total}</span>
                                <span className={`ml-auto font-bold px-1.5 py-0.5 rounded-sm ${isBigWin ? "bg-yellow-500 text-black scale-110" : "text-slate-500 italic"
                                    }`}>
                                    {log.status}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                        <div className="w-8 h-8 border-2 border-slate-500 rounded-full border-t-transparent animate-spin mb-2" />
                        <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">
                            Awaiting initial spin...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default GameLogs;