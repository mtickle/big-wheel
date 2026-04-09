import confetti from "canvas-confetti"; // Make sure to npm install canvas-confetti
import { useCallback, useEffect, useState } from "react";
import GameControls from "./components/GameControls";
import GameLogs from "./components/GameLogs";
import Scoreboard from "./components/Scoreboard";
import StudioAnalytics from "./components/StudioAnalytics";
import Wheel from "./components/Wheel";
import { loadFromStorage, saveThingsToDatabase, saveToStorage } from './utils/storageUtils';


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
  const [isTurboMode, setIsTurboMode] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // --- GAME STATE ---
  const [turn, setTurn] = useState(0);
  const [playerScores, setPlayerScores] = useState([0, 0, 0]);
  const [spinsThisTurn, setSpinsThisTurn] = useState(0);
  const [leader, setLeader] = useState({ index: -1, score: 0 });
  const [gameState, setGameState] = useState("playing");
  const [logs, setLogs] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [spinHistory, setSpinHistory] = useState([[], [], []]);

  // --- MONEY & BONUS ---
  const [bank, setBank] = useState([0, 0, 0]);
  const [bonusEligible, setBonusEligible] = useState([]);
  const [bonusIndex, setBonusIndex] = useState(0);
  const [spinOffParticipants, setSpinOffParticipants] = useState([]);

  // --- CONFETTI CANNON ---
  const triggerJackpot = useCallback(() => {
    if (isTurboMode) return;
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
  }, [isTurboMode]);

  //--- STRESS TEST FUNCTION (EXPOSED TO WINDOW FOR EASY DEBUGGING)
  useEffect(() => {
    window.runStressTest = (iterations = 100) => {
      const SEGMENTS = 20;
      const stats = {
        p1Wins: 0, p2Wins: 0, p3Wins: 0,
        totalBusts: 0, totalDollars: 0, totalTies: 0,
        doubleBusts: 0 // P1 & P2 both out
      };

      console.log(`🚀 Starting Stress Test: ${iterations} iterations...`);
      console.time("Execution Time");

      for (let i = 0; i < iterations; i++) {
        let scores = [0, 0, 0];
        let leader = { index: -1, score: 0 };

        // --- PLAYER 1 & 2 ---
        for (let p = 0; p < 2; p++) {
          let spins = 0;
          while (spins < 2) {
            scores[p] += WHEEL_VALUES[Math.floor(Math.random() * SEGMENTS)];
            spins++;
            if (scores[p] >= 65 || scores[p] > leader.score) break;
          }
          if (scores[p] <= 100 && scores[p] > leader.score) {
            leader = { index: p, score: scores[p] };
          }
        }

        // --- PLAYER 3 STRATEGY (The "Last Look") ---
        const p1Busted = scores[0] > 100;
        const p2Busted = scores[1] > 100;

        if (p1Busted && p2Busted) {
          stats.doubleBusts++;
          // P3 wins automatically - stays on first spin regardless of value
          scores[2] = WHEEL_VALUES[Math.floor(Math.random() * SEGMENTS)];
          leader = { index: 2, score: scores[2] };
        } else {
          let p3Spins = 0;
          while (p3Spins < 2) {
            scores[2] += WHEEL_VALUES[Math.floor(Math.random() * SEGMENTS)];
            p3Spins++;
            if (scores[2] > leader.score) break;
          }
          if (scores[2] <= 100 && scores[2] > leader.score) {
            leader = { index: 2, score: scores[2] };
          }
        }

        // --- RECORD RESULTS ---
        if (leader.index !== -1) {
          stats[`p${leader.index + 1}Wins`]++;
          if (leader.score === 100) stats.totalDollars++;
        } else {
          stats.totalBusts++; // Rare 3-way bust
        }
      }

      console.timeEnd("Execution Time");
      console.table(stats);
      return "Test Complete. Check the table above.";
    };

    return () => { delete window.runStressTest; };
  }, [WHEEL_VALUES]); // Ensure it updates if your wheel values change

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

  const forceDoubleBust = () => {
    setPlayerScores([105, 110, 0]); // P1 & P2 bust

    // 🚨 CRITICAL: Set P3 as the leader immediately
    // We use a score of 0.01 or just 0, but the index MUST be 2
    setLeader({ index: 2, score: 0 });

    setTurn(2);
    setSpinsThisTurn(0);
    setGameState("bonus_only");

    logAction("DEBUG", "N/A", "BUST", "P3 WINS BY DEFAULT");
  };

  const advanceTurn = useCallback((currentTurn, currentGameState, overrideScores = null, overrideBonus = null) => {
    // 🚨 1. USE INSTANT OVERRIDES TO PREVENT STALE STATE BUGS
    const currentScores = overrideScores || playerScores;
    const currentBonus = overrideBonus || bonusEligible;

    //console.log(`Evaluating end of turn. Current Turn: ${currentTurn}, Game State: ${currentGameState}`);
    //console.log(`Scores:`, currentScores);

    // 1. EXPLICIT SPIN-OFF CYCLE (Pass the turn to the next tied player)
    if (currentGameState === "spin_off") {
      const currentIndexInSpinOff = spinOffParticipants.indexOf(currentTurn);
      const nextPlayerIndex = spinOffParticipants[currentIndexInSpinOff + 1];

      if (nextPlayerIndex !== undefined) {
        // We still have more tied players who need to spin!
        console.log(`Spin-off continues. Moving to P${nextPlayerIndex + 1}`);
        setTurn(nextPlayerIndex);
        setSpinsThisTurn(0);
        return; // Stop here, wait for their spin
      }
    }

    // 2. END OF ROUNDS / TIE EVALUATION
    if (currentTurn === 2 || currentGameState === "spin_off") {
      console.log("Rounds complete. Evaluating the true leader...");

      const p1Bust = currentScores[0] > 100;
      const p2Bust = currentScores[1] > 100;

      // 🚨 THE NEW P3 IMMUNITY CHECK: Did P1 and P2 Bust?
      if (currentGameState !== "spin_off" && p1Bust && p2Bust) {
        console.log("P1 & P2 Busted. P3 wins by default!");

        // P3 wins unconditionally. Even if they busted, they go to the Showcase!
        setLeader({ index: 2, score: currentScores[2] });

        // Did P3 happen to hit the 1.00 bonus while taking their free spins?
        if (currentGameState !== "bonus_round" && currentBonus.includes(2)) {
          console.log("P3 earned a bonus spin during their victory lap!");
          setGameState("bonus_round");
          setBonusIndex(0);
          setTurn(2);
        } else {
          setGameState("finished");
        }
        return;
      }

      // Determine who we are evaluating (Everyone normally, or just the tied players in a spin-off)
      let eligiblePlayers = [];
      if (currentGameState === "spin_off") {
        eligiblePlayers = spinOffParticipants
          .map(index => ({ index: index, score: currentScores[index] })) // 🚨 Use currentScores!
          .filter(p => p.score <= 100);
      } else {
        // 🚨 Use currentScores instead of playerScores here too!
        eligiblePlayers = currentScores
          .map((score, index) => ({ index, score }))
          .filter(p => p.score > 0 && p.score <= 100);
      }

      // Failsafe: Rare all-bust scenario
      if (eligiblePlayers.length === 0) {
        setLeader({ index: -1, score: 0 });
        setGameState("finished");
        return;
      }

      // Find the true highest score and who has it
      const winningScore = Math.max(...eligiblePlayers.map(p => p.score));
      const topPlayers = eligiblePlayers.filter(p => p.score === winningScore);

      if (topPlayers.length > 1) {
        console.log("Tie Detected! Entering Spin-off.");
        setLeader({ index: -1, score: winningScore }); // No winner yet
        setGameState("spin_off");

        // Update participants and turn to the first tied player
        const tiedIndices = topPlayers.map(p => p.index);
        setSpinOffParticipants(tiedIndices);
        setTurn(tiedIndices[0]);
        setSpinsThisTurn(0);
      } else {
        // WE HAVE A CLEAR WINNER
        const winner = topPlayers[0];
        console.log(`Clear winner: P${winner.index + 1} with ${winningScore}`);
        setLeader({ index: winner.index, score: winningScore });

        // Check if the WINNER earned a bonus spin (using currentBonus override)
        if (currentGameState !== "bonus_round" && currentBonus.includes(winner.index)) {
          console.log("Winner is Bonus Eligible! Entering Bonus Round.");
          setGameState("bonus_round");
          setBonusIndex(0);
          setTurn(winner.index);
        } else {
          //console.log("Game over. Setting finished state.");
          setGameState("finished");
        }
      }
      return;
    }

    // 3. THE NORMAL ADVANCE
    const nextTurn = currentTurn + 1;
    setTurn(nextTurn);
    setSpinsThisTurn(0);

  }, [playerScores, bonusEligible, spinOffParticipants, logAction]);

  const processResult = (index) => {
    const val = WHEEL_VALUES[index];
    setIsSpinning(false);

    // Track raw spins for the database payload
    setSpinHistory(prev => ({
      ...prev,
      [turn]: [...prev[turn], val]
    }));

    // --- 1. BONUS ROUNDS (Money Spins) ---
    if (gameState === "bonus_round") {
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

      const nextBonusIdx = bonusIndex + 1;
      if (nextBonusIdx < bonusEligible.length) {
        setBonusIndex(nextBonusIdx);
        setTurn(bonusEligible[nextBonusIdx]);
      } else {
        setGameState("finished");
      }
      return;
    }

    // --- 2. VICTORY LAP (P3 wins by default) ---
    if (gameState === "bonus_only") {
      const isJackpot = val === 100;

      if (isJackpot) {
        setBank(prev => { const b = [...prev]; b[turn] += 1000; return b; });
        setBonusEligible([turn]); // P3 is now eligible for the Big Money
        setGameState("bonus_round"); // 🚨 Transition to the $10k/$25k spin!
        setBonusIndex(0);
        logAction(PLAYERS[turn].name, val, "WINNER", "💰 JACKPOT! P3 MOVES TO THE BONUS SPIN!");
        triggerJackpot();
      } else {
        logAction(PLAYERS[turn].name, val, "WINNER", "Victory Lap Complete.");
        setGameState("finished");
      }
      return;
    }

    // --- 3. SPIN-OFF LOGIC (The 1-in-8000 Glitch Fix!) ---
    if (gameState === "spin_off") {
      const isBonusSpin = bonusEligible.includes(turn);
      let nextBonusEligible = [...bonusEligible];

      if (isBonusSpin) {
        // They tied at 1.00 previously, so this spin-off IS their Bonus Spin
        if (val === 5 || val === 15) {
          setBank(prev => { const b = [...prev]; b[turn] += 5000; return b; });
          logAction(PLAYERS[turn]?.name || `P${turn + 1}`, val, "BONUS", "💰 HIT A GREEN SECTION! +$5,000!");
          triggerJackpot();
        } else if (val === 100) {
          setBank(prev => { const b = [...prev]; b[turn] += 10000; return b; });
          logAction(PLAYERS[turn]?.name || `P${turn + 1}`, val, "JACKPOT", "🚨 DOUBLE DOLLAR! +$10,000!");
          triggerJackpot();
        }

        // 🚨 Cross their name off the VIP list so they don't get an illegal 3rd spin!
        nextBonusEligible = nextBonusEligible.filter(idx => idx !== turn);

      } else if (val === 100) {
        // 🚨 THE NEW EDGE CASE: Hitting 1.00 in a regular Tie-Breaker!
        setBank(prev => { const b = [...prev]; b[turn] += 1000; return b; });
        logAction(PLAYERS[turn]?.name || `P${turn + 1}`, val, 100, "💰 TIE-BREAKER DOLLAR! +$1,000!");
        triggerJackpot();

        // Add them to the VIP list so they get a Bonus Spin if they win the spin-off!
        nextBonusEligible.push(turn);
      }

      // Sync the React state
      setBonusEligible(nextBonusEligible);

      // OVERWRITE the score on the scoreboard (Do not add!)
      const nextScores = [...playerScores];
      nextScores[turn] = val; // e.g., P1's 100 becomes 15
      setPlayerScores(nextScores);

      // Pass the instant overrides so advanceTurn knows the exact state
      advanceTurn(turn, "spin_off", nextScores, nextBonusEligible);
      return;
    }

    // --- 4. REGULAR PLAY LOGIC ---
    const newScore = playerScores[turn] + val;
    const newSpins = spinsThisTurn + 1;

    // Create local copies to pass instantly to advanceTurn
    const nextScores = [...playerScores];
    nextScores[turn] = newScore;
    const nextBonusEligible = newScore === 100 ? [...bonusEligible, turn] : bonusEligible;

    // Tell React to update the UI
    setPlayerScores(nextScores);
    setSpinsThisTurn(newSpins);

    // CASE: HITTING THE DOLLAR
    if (newScore === 100) {
      setBank(prev => { const b = [...prev]; b[turn] += 1000; return b; });
      setBonusEligible(nextBonusEligible); // Update UI state
      logAction(PLAYERS[turn].name, val, 100, "💰 $1,000 WINNER!");
      triggerJackpot();
      if (leader.score < 100) setLeader({ index: turn, score: 100 });

      // Pass the instant overrides!
      advanceTurn(turn, gameState, nextScores, nextBonusEligible);
      return;
    }

    // CASE: PLAYER 3 AUTO-WIN
    if (turn === 2 && newScore > leader.score && newScore <= 100) {
      setLeader({ index: turn, score: newScore });
      logAction(PLAYERS[turn].name, val, newScore, "WINNER!");
      advanceTurn(turn, gameState, nextScores, nextBonusEligible);
      return;
    }

    // CASE: BUST OR STAY
    if (newScore > 100) {
      logAction(PLAYERS[turn].name, val, newScore, "BUSTED");
      advanceTurn(turn, gameState, nextScores, nextBonusEligible);
    } else if (newSpins === 2) {
      if (newScore > leader.score) setLeader({ index: turn, score: newScore });
      logAction(PLAYERS[turn].name, val, newScore, "STAY");
      advanceTurn(turn, gameState, nextScores, nextBonusEligible);
    } else {
      // Standard Spin 1 logging
      logAction(PLAYERS[turn].name, val, newScore, "Spin 1 Complete");
      setIsAwaitingChoice(true);
    }
  };

  const spin = () => {
    if (isSpinning || gameState === "finished") return;
    setIsAwaitingChoice(false);
    setTransitionEnabled(true);

    // 🚨 THE TURBO BYPASS
    if (isAutoPlaying && isTurboMode) {
      setIsAwaitingChoice(false);
      const destinationIndex = Math.floor(Math.random() * SEGMENTS);
      setTopIndex(destinationIndex);
      processResult(destinationIndex);
      return;
    }

    setTimeout(() => {

      //--- Start the spin after a brief delay to ensure CSS transition is applied
      setIsSpinning(true);

      //--- SPIN CALCULATION: Random steps + 5-9 full rotations for drama
      // 1. Calculate the physics
      const steps = Math.floor(Math.random() * SEGMENTS);
      const extraLaps = (Math.floor(Math.random() * 5) + 5) * 360;
      const totalRotation = extraLaps + (steps * SEGMENT_DEG);

      // 2. Calculate the FINAL destination immediately
      const landedIndex = (topIndex + steps) % SEGMENTS;
      const landedValue = WHEEL_VALUES[landedIndex];

      console.log(`Spinning ${steps} steps to land on Index ${landedIndex} (Value: ${landedValue})`);

      //--- Apply the rotation to trigger the CSS animation
      setRotation(totalRotation);

      //--- Wait for the animation to complete. This is only for show since we know the result immediately, but it adds suspense.
      setTimeout(() => {
        const landedIndex = (topIndex + steps) % SEGMENTS;
        setTransitionEnabled(false);
        requestAnimationFrame(() => {
          setRotation(0);
          setTopIndex(landedIndex);
          //console.log(`Landed on index ${landedIndex} (Value: ${WHEEL_VALUES[landedIndex]})`);
          setTimeout(() => { processResult(landedIndex); }, 50);
        });
      }, 4000);
    }, 10);
  };

  const handleStay = () => {
    setIsAwaitingChoice(false);

    // 🚨 THE FIX: Ensure the leader state is updated before passing the turn!
    setLeader(prevLeader => {
      const currentScore = playerScores[turn];
      return currentScore > prevLeader.score
        ? { index: turn, score: currentScore }
        : prevLeader;
    });

    // Pass the turn to the next player
    advanceTurn(turn, gameState);
  };

  const resetGame = () => {
    setTurn(0); setPlayerScores([0, 0, 0]); setSpinsThisTurn(0);
    setLeader({ index: -1, score: 0 }); setGameState("playing");
    setLogs([]); setRotation(0); setTopIndex(0);
    setBank([0, 0, 0]); setBonusEligible([]); setBonusIndex(0);
    setSpinOffParticipants([]);

    // Wipe the historical arrays for the next game
    setSpinHistory({ 0: [], 1: [], 2: [] });
    setSpinOffParticipants([]);
  };

  // --- ANALYTICS PACKAGER ---
  useEffect(() => {
    if (gameState === "finished") {
      console.log("📊 Game Over! Packaging data for local storage...");

      // 1. Load the existing batch (using your utility)
      const existingBatch = loadFromStorage("showdown_batch") || [];

      // 2. Determine macro stats
      const isDoubleBust = playerScores[0] > 100 && playerScores[1] > 100;

      // Use the actual state array, NOT the spin count, to avoid the Bonus Spin trap!
      const wentToSpinOff = spinOffParticipants.length > 0;

      // 3. Build the Payload
      const newGamePayload = {
        gameId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        playedAt: new Date().toISOString(),
        winnerIndex: leader.index !== -1 ? leader.index : null,
        winningScore: leader.score,
        isDoubleBustScenario: isDoubleBust,
        wentToSpinOff: wentToSpinOff,
        players: [0, 1, 2].map(i => {
          const rawSpins = spinHistory[i] || [];
          return {
            index: i,
            totalScore: playerScores[i],
            isBust: playerScores[i] > 100,
            // Maps the raw spins array: [spin1, spin2, tieBreaker, etc]
            spinsTaken: rawSpins,
            totalWinnings: bank[i] || 0
          };
        })
      };

      console.log("New Game Payload:", newGamePayload);

      // 4. Save back to storage
      existingBatch.push(newGamePayload);
      saveToStorage("showdown_batch", existingBatch);
      console.log(`Saved Game ${newGamePayload.gameId}. Total in batch: ${existingBatch.length}`);

      const BATCH_LIMIT = 200;

      if (existingBatch.length >= BATCH_LIMIT) {
        console.log(`📦 Batch limit of ${BATCH_LIMIT} reached. Preparing transmission...`);

        // 🚨 1. PRESS THE BRAKES
        setIsTransmitting(true);

        // Wipe local storage immediately so the next game starts fresh
        saveToStorage("showdown_batch", []);

        // Send the payload to Postgres
        saveThingsToDatabase('postShowdownGames', existingBatch).then((response) => {
          if (response) {
            console.log("✅ Server successfully accepted the batch!");
          } else {
            console.warn("⚠️ API failed to respond properly.");
          }

          // 🚨 2. RELEASE THE BRAKES
          setIsTransmitting(false);
        });
      }
    }
  }, [isAutoPlaying, isTurboMode, isTransmitting, isSpinning, gameState, isAwaitingChoice, turn, playerScores, leader, spin, handleStay, resetGame]);// ONLY run this when the game state changes

  // --- AUTO-PLAY BOT ---
  useEffect(() => {
    // 1. Only run if Auto-Play is ON and the Wheel is NOT currently spinning
    if (!isAutoPlaying || isSpinning || isTransmitting) return;

    // 2. Add a visual delay so you can actually watch the game unfold
    const actionDelay = isTurboMode ? 10 : 1500;

    const autoTimer = setTimeout(() => {

      // CASE A: Game Over -> Start a new game automatically!
      if (gameState === "finished") {
        console.log("[BOT] Starting new game...");
        resetGame();
        return;
      }

      // CASE B: The "Stay or Spin?" Decision
      if (isAwaitingChoice) {
        const currentScore = playerScores[turn];
        let shouldStay = false;

        // 🚨 Calculate the true target score based ONLY on previous players
        let targetScore = 0;
        if (turn === 1) {
          // P2 only cares about P1's score
          targetScore = playerScores[0] > 100 ? 0 : playerScores[0];
        } else if (turn === 2) {
          // P3 cares about the highest score between P1 and P2
          targetScore = Math.max(
            playerScores[0] > 100 ? 0 : playerScores[0],
            playerScores[1] > 100 ? 0 : playerScores[1]
          );
        }

        const p1Busted = playerScores[0] > 100;
        const p2Busted = playerScores[1] > 100;

        if (turn === 0) {
          shouldStay = currentScore >= 65;
        } else if (turn === 2 && p1Busted && p2Busted) {
          shouldStay = currentScore === 100;
        } else {
          // 🚨 Use targetScore instead of leader.score!
          if (currentScore > targetScore) {
            shouldStay = true;
          } else if (currentScore === targetScore) {
            shouldStay = currentScore >= 75;
          } else {
            shouldStay = false;
          }
        }

        if (shouldStay) {
          console.log(`[BOT] P${turn + 1} Chooses to STAY at ${currentScore}`);
          handleStay();
        } else {
          console.log(`[BOT] P${turn + 1} Chooses to SPIN AGAIN at ${currentScore}`);
          spin();
        }
        return;
      }

      // CASE C: Mandatory Spins (Spin 1, Bonus Spin, Spin-Off, Victory Lap)
      console.log(`[BOT] P${turn + 1} takes mandatory spin.`);
      spin();


    }, actionDelay);

    // Cleanup the timer if state changes before it fires
    return () => clearTimeout(autoTimer);

  }, [isAutoPlaying, isTurboMode, isTransmitting, isSpinning, gameState, isAwaitingChoice, turn, playerScores, leader, spin, handleStay, resetGame]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans overflow-x-hidden relative">

      {/* 🚨 THE MASTER GRID CONTAINER (Expanded for 3-column support) */}
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 xl:gap-x-12 gap-y-12 items-start">

          {/* --- COLUMN 1: Scoreboard & Logs --- */}
          <div className="w-full space-y-6">
            <Scoreboard
              players={PLAYERS}
              playerScores={playerScores}
              bank={bank}
              turn={turn}
              leader={leader}
              gameState={gameState}
              bonusEligible={bonusEligible}
              isAwaitingChoice={isAwaitingChoice}
            />
            <GameLogs logs={logs} />
          </div>

          {/* --- COLUMN 2: Wheel & Controls --- */}
          <div className="w-full flex flex-col items-center justify-start pt-4">

            <Wheel
              rotation={rotation} topIndex={topIndex}
              transitionEnabled={transitionEnabled} size={500}
              wheelValues={WHEEL_VALUES} isSpinning={isSpinning}
            >

              {/* 🚨 Notice the self-closing slash at the end of GameControls! */}
              <GameControls
                isSpinning={isSpinning}
                isAwaitingChoice={isAwaitingChoice}
                gameState={gameState}
                onSpin={spin}
                onStay={handleStay}
                onReset={resetGame}
                players={PLAYERS}
                turn={turn}
                leader={leader}
                bank={bank}
              />

            </Wheel> {/* 🚨 Notice the closing Wheel tag! */}

          </div>


          {/* --- COLUMN 3: Analytics Dashboard --- 
              On xl screens: It is the 3rd column (with a left border).
              On lg screens: It drops underneath and spans both columns (with a top border).
          */}
          <div className="w-full lg:col-span-2 xl:col-span-1 pt-8 xl:pt-0 xl:border-t-0 xl:pl-8">
            <StudioAnalytics />
          </div>

        </div>
      </div>

      {/* --- DEV DEBUG TRAY (Floats over everything) --- */}
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

    </div>
  );
}