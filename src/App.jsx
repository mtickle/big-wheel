import GameControls from "@components/GameControls";
import GameLogs from "@components/GameLogs";
import Scoreboard from "@components/Scoreboard";
import Wheel from "@components/Wheel";

import { useCallback, useState } from "react";

const WHEEL_VALUES = [
  100, 15, 80, 35, 60, 20, 40, 75, 55, 95,
  50, 85, 30, 65, 10, 45, 70, 25, 90, 5
];


const SEGMENTS = 20;
const SEGMENT_DEG = 18;

const PLAYERS = [
  { name: "Contestant 1", strategy: 65 },
  { name: "Contestant 2", strategy: 70 },
  { name: "Contestant 3", strategy: "BEAT_LEADER" }
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
  const [gameState, setGameState] = useState("playing");
  const [logs, setLogs] = useState([]);

  // --- LOGIC ---
  const logAction = (name, spin, total, status) => {
    setLogs(prev => [{ id: Date.now(), name, spin, total, status }, ...prev]);
  };


  const handleStay = () => {
    const currentScore = playerScores[turn];
    logAction(PLAYERS[turn].name, "N/A", currentScore, "STAYED");

    if (currentScore > leader.score) {
      setLeader({ index: turn, score: currentScore });
    }

    setIsAwaitingChoice(false);
    advanceTurn();
  };

  const handleSpinAgain = () => {
    setIsAwaitingChoice(false);
    spin(); // Trigger the existing spin logic
  };

  const processResult = (index) => {
    const val = WHEEL_VALUES[index];
    const newScore = playerScores[turn] + val;
    const newSpins = spinsThisTurn + 1;

    const updatedScores = [...playerScores];
    updatedScores[turn] = newScore;
    setPlayerScores(updatedScores);
    setSpinsThisTurn(newSpins);

    // 1. AUTO-ADVANCE CONDITIONS
    if (newScore > 100) {
      logAction(PLAYERS[turn].name, val, newScore, "BUSTED");
      advanceTurn();
      setIsSpinning(false);
      return;
    }

    if (newSpins === 2) {
      logAction(PLAYERS[turn].name, val, newScore, "STAY (Max Spins)");
      if (newScore > leader.score) setLeader({ index: turn, score: newScore });
      advanceTurn();
      setIsSpinning(false);
      return;
    }

    // 2. WAIT FOR USER INPUT
    // If they haven't busted and have a spin left, show the buttons
    setIsAwaitingChoice(true);
    setIsSpinning(false);
  };
  const advanceTurn = useCallback(() => {
    if (turn === 2) {
      setGameState("finished");

      // 📊 Update the Statistics
      setStats(prev => {
        // If no one qualified (everyone busted), just increment total games
        if (leader.index === -1) {
          return { ...prev, totalGames: prev.totalGames + 1 };
        }

        // Increment the total and the specific player's win count
        return {
          ...prev,
          totalGames: prev.totalGames + 1,
          p1Wins: leader.index === 0 ? prev.p1Wins + 1 : prev.p1Wins,
          p2Wins: leader.index === 1 ? prev.p2Wins + 1 : prev.p2Wins,
          p3Wins: leader.index === 2 ? prev.p3Wins + 1 : prev.p3Wins,
        };
      });
    } else {
      setTurn(t => t + 1);
      setSpinsThisTurn(0);
    }
  }, [turn, leader.index]); // Dependencies for useCallback

  const spin = () => {
    if (isSpinning || gameState === "finished") return;

    // 1. Re-arm the transition
    setTransitionEnabled(true);

    // 2. Give React one "tick" to apply the transitionEnabled(true) 
    // before we set the actual rotation degrees.
    setTimeout(() => {
      setIsSpinning(true);

      const extraLaps = (Math.floor(Math.random() * 5) + 5) * 360;
      const steps = Math.floor(Math.random() * SEGMENTS);
      const totalRotation = extraLaps + (steps * SEGMENT_DEG);

      setRotation(totalRotation);

      setTimeout(() => {
        const landedIndex = (topIndex + steps) % SEGMENTS;

        setTransitionEnabled(false);

        requestAnimationFrame(() => {
          setRotation(0);
          setTopIndex(landedIndex);

          setTimeout(() => {
            setIsSpinning(false);
            processResult(landedIndex);
          }, 50);
        });
      }, 4000);
    }, 10); // Tiny 10ms delay to arm the transition
  };

  const resetGame = () => {
    setTurn(0); setPlayerScores([0, 0, 0]); setSpinsThisTurn(0);
    setLeader({ index: -1, score: 0 }); setGameState("playing");
    setLogs([]); setRotation(0); setTopIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-350 mx-auto flex flex-col lg:flex-row gap-16 items-start justify-center">

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <Scoreboard
            players={PLAYERS}
            playerScores={playerScores}
            turn={turn}
            leader={leader}
            gameState={gameState}
          />
          <GameLogs logs={logs} />
        </div>


        {/* WHEEL DISPLAY */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <div className="px-4">
            <Wheel
              rotation={rotation}
              topIndex={topIndex}
              transitionEnabled={transitionEnabled}
              size={500}
              wheelValues={WHEEL_VALUES}
            />
          </div>
          <div className="w-full flex justify-center">
            <GameControls
              isSpinning={isSpinning}
              isAwaitingChoice={isAwaitingChoice}
              gameState={gameState}
              onSpin={spin}
              onStay={handleStay}
              onReset={resetGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
}