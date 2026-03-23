import confetti from "canvas-confetti"; // Make sure to npm install canvas-confetti
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
  const [gameState, setGameState] = useState("playing");
  const [logs, setLogs] = useState([]);

  // --- MONEY & BONUS ---
  const [bank, setBank] = useState([0, 0, 0]);
  const [bonusEligible, setBonusEligible] = useState([]);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [spinOffParticipants, setSpinOffParticipants] = useState([]);

  // --- CONFETTI CANNON ---
  const triggerJackpot = useCallback(() => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#fbbf24", "#ffffff", "#22c55e"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const logAction = useCallback((name, spin, total, status) => {
    setLogs(prev => [
      {
        id: `${Date.now()}-${Math.random()}`, // Unique ID failsafe
        name,
        spin,
        total,
        status
      },
      ...prev
    ]);
  }, []);

  const advanceTurn = useCallback((currentTurn, currentGameState) => {
    console.log(`--- ADVANCE TURN DEBUG ---`);
    console.log(`Current Turn: ${currentTurn}, State: ${currentGameState}`);
    console.log(`Scores:`, playerScores);

    const p1Bust = playerScores[0] > 100;
    const p2Bust = playerScores[1] > 100;

    // 1. DOUBLE BUST FAILSAFE
    if (currentTurn === 1 && p1Bust && p2Bust) {
      console.log("Triggering P3 Failsafe (P1/P2 Busted)");
      setTurn(2);
      setSpinsThisTurn(0);
      setGameState("bonus_only");
      logAction("SYSTEM", "N/A", "0", "P1 & P2 BUSTED - P3 WINS!");
      return;
    }

    // 2. END OF ROUNDS
    if (currentTurn === 2 || currentGameState === "bonus_only" || currentGameState === "spin_off") {
      console.log("Turn 2/Special Round finished. Checking for Ties/Bonus...");
      const validScores = playerScores.filter(s => s <= 100);
      const maxScore = Math.max(...validScores, 0);
      const winners = playerScores.map((s, i) => s === maxScore ? i : -1).filter(i => i !== -1);

      if (currentGameState !== "spin_off" && winners.length > 1 && maxScore > 0) {
        console.log("Tie Detected! Entering Spin-off.");
        setGameState("spin_off");
        setSpinOffParticipants(winners);
        setTurn(winners[0]);
      } else if (currentGameState !== "bonus_round" && bonusEligible.length > 0) {
        console.log("Bonus Eligible players found. Entering Bonus Round.");
        setGameState("bonus_round");
        setBonusIndex(0);
        setTurn(bonusEligible[0]);
      } else {
        console.log("Game over. Setting finished state.");
        setGameState("finished");
      }
    }
    // 3. THE NORMAL ADVANCE
    else {
      const nextTurn = currentTurn + 1;
      console.log(`Normal advance: Moving from ${currentTurn} to ${nextTurn}`);
      setTurn(nextTurn);
      setSpinsThisTurn(0);
    }
  }, [playerScores, bonusEligible, logAction]);

  const processResult = (index) => {
    const val = WHEEL_VALUES[index];
    setIsSpinning(false);

    // --- 1. BONUS ROUND ($5k / $10k) ---
    if (gameState === "bonus_round" || gameState === "bonus_only") {
      let bonusWin = 0;
      if (val === 100) bonusWin = 10000;
      else if (val === 5 || val === 15) bonusWin = 5000;

      if (bonusWin > 0) {
        setBank(prev => { const b = [...prev]; b[turn] += bonusWin; return b; });
        logAction(PLAYERS[turn].name, val, "BONUS", `💰 WON $${bonusWin.toLocaleString()}!`);
        triggerJackpot();
      } else {
        logAction(PLAYERS[turn].name, val, "BONUS", "No bonus money.");
      }

      // FIX: Use a local variable for the next index to avoid stale state
      const nextBonusIdx = bonusIndex + 1;
      if (nextBonusIdx < bonusEligible.length) {
        setBonusIndex(nextBonusIdx);
        setTurn(bonusEligible[nextBonusIdx]);
      } else {
        advanceTurn(turn, gameState); // Pass context!
      }
      return;
    }

    // --- 2. SPIN-OFF LOGIC ---
    if (gameState === "spin_off") {
      const currentPIndex = spinOffParticipants.indexOf(turn);
      setPlayerScores(prev => { const s = [...prev]; s[turn] = val; return s; });
      logAction(PLAYERS[turn].name, val, val, "SPIN-OFF SCORE");

      if (currentPIndex < spinOffParticipants.length - 1) {
        setTurn(spinOffParticipants[currentPIndex + 1]);
      } else {
        advanceTurn(turn, gameState); // Pass context!
      }
      return;
    }

    // --- 3. REGULAR PLAY LOGIC ---
    const newScore = playerScores[turn] + val;
    const newSpins = spinsThisTurn + 1;

    // Update Score & Spins (Functional updates are safer)
    setPlayerScores(prev => { const s = [...prev]; s[turn] = newScore; return s; });
    setSpinsThisTurn(newSpins);

    // CASE: HITTING THE DOLLAR
    if (newScore === 100) {
      setBank(prev => { const b = [...prev]; b[turn] += 1000; return b; });
      setBonusEligible(prev => [...prev, turn]);
      logAction(PLAYERS[turn].name, val, 100, "💰 $1,000 WINNER!");
      triggerJackpot();

      if (leader.score < 100) setLeader({ index: turn, score: 100 });

      advanceTurn(turn, gameState); // Pass context!
      return;
    }

    // CASE: PLAYER 3 AUTO-WIN
    if (turn === 2 && newScore > leader.score && newScore <= 100) {
      setLeader({ index: turn, score: newScore });
      logAction(PLAYERS[turn].name, val, newScore, "WINNER!");
      advanceTurn(turn, gameState); // Pass context!
      return;
    }

    // CASE: BUST OR FORCED STAY
    if (newScore > 100) {
      logAction(PLAYERS[turn].name, val, newScore, "BUSTED");
      advanceTurn(turn, gameState); // Pass context!
    } else if (newSpins === 2) {
      if (newScore > leader.score) setLeader({ index: turn, score: newScore });
      logAction(PLAYERS[turn].name, val, newScore, "STAY");
      advanceTurn(turn, gameState); // Pass context!
    } else {
      // ONLY TIME WE WAIT
      setIsAwaitingChoice(true);
    }
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
    advanceTurn(turn, gameState); // Pass the values explicitly!
  };

  const resetGame = () => {
    setTurn(0); setPlayerScores([0, 0, 0]); setSpinsThisTurn(0);
    setLeader({ index: -1, score: 0 }); setGameState("playing");
    setLogs([]); setRotation(0); setTopIndex(0);
    setBank([0, 0, 0]); setBonusEligible([]); setBonusIndex(0);
    setSpinOffParticipants([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans overflow-x-hidden">
      <div className="max-w-350 mx-auto flex flex-col lg:flex-row gap-16 items-start justify-center">
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <Scoreboard
            players={PLAYERS} playerScores={playerScores} bank={bank}
            turn={turn} leader={leader} gameState={gameState}
            bonusEligible={bonusEligible}
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