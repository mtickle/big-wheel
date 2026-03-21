import { memo } from 'react';

const GameLogs = memo(({ logs }) => {
    return (
        <div className="bg-slate-800/40 p-4 rounded-2xl border-2 border-slate-700 flex flex-col h-[300px] w-full">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">
                History
            </h3>
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {logs.map(log => (
                    <div
                        key={log.id}
                        className="text-[10px] p-2 bg-slate-900/50 rounded-lg border-l-2 border-slate-600 opacity-80"
                    >
                        <span className="font-bold text-slate-400 uppercase">{log.name}:</span>
                        <span className="mx-1 text-yellow-500/80">Spun {log.spin}</span>
                        <span className="text-slate-500">→</span>
                        <span className="ml-1 font-bold text-white">{log.total}</span>
                        <span className="ml-2 italic text-slate-500 text-[9px]">{log.status}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <p className="text-[10px] text-slate-600 italic px-1 mt-2 text-center">
                        Waiting for spin...
                    </p>
                )}
            </div>
        </div>
    );
});

export default GameLogs;