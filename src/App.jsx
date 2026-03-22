import { useCallback, useState } from "react";
import GameControls from "./components/GameControls";
import GameLogs from "./components/GameLogs";
import Scoreboard from "./components/Scoreboard";
import Wheel from "./components/Wheel";

const WHEEL_VALUES = [
  100, 15, 80, 35, 60, 20, 40, 75, 55, 95,
  50, 85, 30, 65, 10, 45, 70, 25, 90, 5
];

const SEGMENTS = 20;
const SEGMENT_DEG = 18;

const PLAYERS = [
  { name: "Contestant 1" },
  { name: "Contestant 2" },
  { name: "Contestant 3" }
];

export default function App() {
  // --- WHEEL STATE ---
  const [rotation, setRotation] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAwaitingChoice, setIsAwaitingChoice] = useState(false);

  // --- GAME STATE ---
  const [turn, setTurn] = useState(0);
  const [playerScores, setPlayerScores] = useState([0, 0, 0]);
  const [spinsThisTurn, setSpinsThisTurn] = useState(0);
  const [leader, setLeader] = useState({ index: -1, score: 0 });
  const [gameState, setGameState] = useState("playing"); // playing, bonus_only, bonus_round, spin_off, finished
  const [logs, setLogs] = useState([]);

  // --- MONEY & BONUS ---
  const [bank, setBank] = useState([0, 0, 0]);
  const [bonusEligible, setBonusEligible] = useState([]);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [spinOffParticipants, setSpinOffParticipants] = useState([]);

  const logAction = (name, spin, total, status) => {
    setLogs(prev => [{ id: Date.now(), name, spin, total, status }, ...prev]);
  };

  const advanceTurn = useCallback(() => {
    const p1Busted = playerScores[0] > 100;
    const p2Busted = playerScores[1] > 100;

    // 1. FAILSAFE: If P1 and P2 busted, P3 wins automatically
    if (turn === 1 && p1Busted && p2Busted) {
      setTurn(2);
      setSpinsThisTurn(0);
      setGameState("bonus_only");
      logAction("SYSTEM", "N/A", "0", "P1 & P2 BUSTED - P3 WINS!");
      return;
    }

    // 2. END OF REGULAR PLAY
    if (turn === 2 || gameState === "bonus_only") {
      // Check for ties (Spin-off)
      const validScores = playerScores.filter(s => s <= 100);
      const maxScore = Math.max(...validScores, 0);
      const winners = playerScores.map((s, i) => s === maxScore ? i : -1).filter(i => i !== -1);

      if (winners.length > 1 && maxScore > 0) {
        setGameState("spin_off");
        setSpinOffParticipants(winners);
        setTurn(winners[0]);
        logAction("SYSTEM", "TIE", maxScore, "SPIN-OFF!");
      }
      // Check for Bonus Round ($1,000 hitters)
      else if (bonusEligible.length > 0) {
        setGameState("bonus_round");
        setTurn(bonusEligible[0]);
      } else {
        setGameState("finished");
      }
    } else {
      setTurn(t => t + 1);
      setSpinsThisTurn(0);
    }
  }, [turn, playerScores, leader.score, bonusEligible]);

  const processResult = (index) => {
    const val = WHEEL_VALUES[index];

    // --- BONUS ROUND LOGIC ---
    if (gameState === "bonus_round") {
      let bonusWin = 0;
      if (val === 100) bonusWin = 10000;
      else if (val === 5 || val === 15) bonusWin = 5000;

      if (bonusWin > 0) {
        setBank(prev => {
          const b = [...prev]; b[turn] += bonusWin; return b;
        });
        logAction(PLAYERS[turn].name, val, "BONUS", `💰 WON $${bonusWin.toLocaleString()}!`);
      } else {
        logAction(PLAYERS[turn].name, val, "BONUS", "No bonus money.");
      }

      if (bonusIndex < bonusEligible.length - 1) {
        const nextIdx = bonusIndex + 1;
        setBonusIndex(nextIdx);
        setTurn(bonusEligible[nextIdx]);
      } else {
        setGameState("finished");
      }
      setIsSpinning(false);
      return;
    }

    // --- SPIN-OFF LOGIC ---
    if (gameState === "spin_off") {
      const currentPIndex = spinOffParticipants.indexOf(turn);
      const updatedScores = [...playerScores];
      updatedScores[turn] = val; // Spin-off is usually high-score of 1 spin
      setPlayerScores(updatedScores);
      logAction(PLAYERS[turn].name, val, val, "SPIN-OFF SCORE");

      if (currentPIndex < spinOffParticipants.length - 1) {
        setTurn(spinOffParticipants[currentPIndex + 1]);
      } else {
        setGameState("finished");
        // Determine winner of spin-off logic would go here
      }
      setIsSpinning(false);
      return;
    }

    // --- REGULAR PLAY LOGIC ---
    const newScore = playerScores[turn] + val;
    const newSpins = spinsThisTurn + 1;
    const updatedScores = [...playerScores];
    updatedScores[turn] = newScore;
    setPlayerScores(updatedScores);
    setSpinsThisTurn(newSpins);

    // Hitting the Dollar ($1,000)
    if (newScore === 100) {
      setBank(prev => { const b = [...prev]; b[turn] += 1000; return b; });
      setBonusEligible(prev => [...prev, turn]);
      logAction(PLAYERS[turn].name, val, 100, "💰 $1,000 WINNER!");
      setLeader({ index: turn, score: 100 });
      advanceTurn();
      setIsSpinning(false);
      return;
    }

    // P3 Auto-Win Failsafe
    if (turn === 2 && newScore > leader.score && newScore <= 100) {
      setLeader({ index: turn, score: newScore });
      logAction(PLAYERS[turn].name, val, newScore, "WINNER!");
      advanceTurn();
      setIsSpinning(false);
      return;
    }

    if (newScore > 100) {
      logAction(PLAYERS[turn].name, val, newScore, "BUSTED");
      advanceTurn();
    } else if (newSpins === 2) {
      if (newScore > leader.score) setLeader({ index: turn, score: newScore });
      logAction(PLAYERS[turn].name, val, newScore, "STAY");
      advanceTurn();
    } else {
      setIsAwaitingChoice(true);
    }
    setIsSpinning(false);
  };

  const spin = () => {
    if (isSpinning || gameState === "finished") return;
    setTransitionEnabled(true);
    setTimeout(() => {
      setIsSpinning(true);
      const steps = Math.floor(Math.random() * SEGMENTS);
      const totalRotation = ((Math.floor(Math.random() * 5) + 5) * 360) + (steps * SEGMENT_DEG);
      setRotation(totalRotation);
      setTimeout(() => {
        const landedIndex = (topIndex + steps) % SEGMENTS;
        setTransitionEnabled(false);
        requestAnimationFrame(() => {
          setRotation(0);
          setTopIndex(landedIndex);
          setTimeout(() => { processResult(landedIndex); }, 50);
        });
      }, 4000);
    }, 10);
  };

  const handleStay = () => {
    const currentScore = playerScores[turn];
    if (currentScore > leader.score) setLeader({ index: turn, score: currentScore });
    setIsAwaitingChoice(false);
    advanceTurn();
  };

  const resetGame = () => {
    setTurn(0); setPlayerScores([0, 0, 0]); setSpinsThisTurn(0);
    setLeader({ index: -1, score: 0 }); setGameState("playing");
    setLogs([]); setRotation(0); setTopIndex(0);
    setBank([0, 0, 0]); setBonusEligible([]); setBonusIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-16 items-start justify-center">
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <Scoreboard
            players={PLAYERS} playerScores={playerScores} bank={bank}
            turn={turn} leader={leader} gameState={gameState}
          />
          <GameLogs logs={logs} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <Wheel
            rotation={rotation} topIndex={topIndex}
            transitionEnabled={transitionEnabled} size={500}
            wheelValues={WHEEL_VALUES} isSpinning={isSpinning}
          />
          <GameControls
            isSpinning={isSpinning} isAwaitingChoice={isAwaitingChoice}
            gameState={gameState} onSpin={spin} onStay={handleStay} onReset={resetGame}
          />
        </div>
        <div className="hidden lg:block lg:w-80" />
      </div>
    </div>
  );
}