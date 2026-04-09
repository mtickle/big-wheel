import { useEffect, useState } from 'react';

const StudioAnalytics = () => {

    const [stats, setStats] = useState(null);
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAnalytics = async () => {
            try {
                if (games.length === 0 && !stats) {
                    setIsLoading(true);
                }

                // 🚨 Just one clean fetch!
                //   let apiUrl = 'https://game-api-zjod.onrender.com/api/' + endpoint;
                const response = await fetch('https://game-api-zjod.onrender.com/api/getShowdownGames');
                const data = await response.json();

                if (isMounted) {
                    // 1. Feed the array of games to the gridview
                    setGames(data.recentGames || []);

                    // 2. Feed the stats object to the top cards
                    if (data.stats) {
                        const dbStats = data.stats;
                        const total = parseInt(dbStats.total_games) || 0;

                        setStats({
                            total: total,
                            totalBonusCash: parseInt(dbStats.total_bonus_cash) || 0,
                            perfectGames: parseInt(dbStats.perfect_games) || 0,
                            winRates: {
                                p1: Math.round((parseInt(dbStats.p1_wins) / total) * 100) || 0,
                                p2: Math.round((parseInt(dbStats.p2_wins) / total) * 100) || 0,
                                p3: Math.round((parseInt(dbStats.p3_wins) / total) * 100) || 0,
                            }
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch studio analytics:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 10000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [games.length, stats]);

    // 🚨 YOU CAN COMPLETELY DELETE THE `const stats = useMemo(...)` BLOCK NOW!

    if (!stats) return <div className="text-slate-400 text-center p-4">Awaiting game data...</div>;

    return (
        <div className="bg-slate-800/40 p-5 rounded-2xl border-2 border-slate-700 flex flex-col w-full">
            <h3 className="text-sm font-sans text-slate-500 uppercase tracking-widest mb-3 px-1 flex justify-between">
                Analytics
            </h3>

            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700  shadow-inner">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total&nbsp;Games</p>
                    <p className="text-2xl font-mono text-blue-400">{stats.total.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700  shadow-inner">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Bonus&nbsp;Cash</p>
                    <p className="text-2xl font-mono text-green-400">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                            maximumFractionDigits: 1 // Changes 2.38M to 2.4M for a cleaner look. Change to 2 if you want 2.38M!
                        }).format(stats.totalBonusCash)}
                    </p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-inner">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Perfect&nbsp;Games</p>
                    <p className="text-2xl font-mono text-yellow-400">{stats.perfectGames.toLocaleString()}</p>
                </div>
            </div>

            {/* --- WIN DISTRIBUTION BAR --- */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Win Frequency Distribution</h3>
                <div className="h-8 w-full flex rounded-full overflow-hidden shadow-inner bg-slate-800">
                    <div style={{ width: `${stats.winRates.p1}%` }} className="bg-green-500 flex items-center justify-center text-xs font-bold text-green-900 transition-all duration-500">
                        {stats.winRates.p1 > 5 && `C1: ${stats.winRates.p1}%`}
                    </div>
                    <div style={{ width: `${stats.winRates.p2}%` }} className="bg-orange-500 flex items-center justify-center text-xs font-bold text-orange-900 transition-all duration-500">
                        {stats.winRates.p2 > 5 && `C2: ${stats.winRates.p2}%`}
                    </div>
                    <div style={{ width: `${stats.winRates.p3}%` }} className="bg-blue-500 flex items-center justify-center text-xs font-bold text-blue-900 transition-all duration-500">
                        {stats.winRates.p3 > 5 && `C3: ${stats.winRates.p3}%`}
                    </div>
                </div>
            </div>

            {/* --- GRIDVIEW (RECENT GAMES) --- */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Recent Results Log</h3>
                <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700 max-h-64 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 sticky top-0">
                            <tr>
                                <th className="p-3 font-medium">Game ID</th>
                                <th className="p-3 font-medium">Winner</th>
                                <th className="p-3 font-medium text-right">Score</th>
                                <th className="p-3 font-medium text-center">Spin-Off?</th>
                                <th className="p-3 font-medium text-right">Winnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {/* Show the 20 most recent games first */}
                            {[...games].reverse().slice(0, 20).map((game, idx) => (
                                <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-3 font-mono text-xs text-slate-500">{game.gameId.split('_')[2]}</td>
                                    <td className="p-3">Player {game.winnerIndex + 1}</td>
                                    <td className="p-3 text-right font-mono">{game.winningScore}</td>
                                    <td className="p-3 text-center">
                                        {game.wentToSpinOff ? <span className="text-red-400 font-bold">YES</span> : <span className="text-slate-600">-</span>}
                                    </td>
                                    <td className="p-3 text-right font-mono text-green-400">
                                        ${Number(game.totalWinnings).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudioAnalytics;