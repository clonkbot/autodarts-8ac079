import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text } from '@react-three/drei'
import DartboardScene from './components/DartboardScene'
import Dashboard from './components/Dashboard'
import GameSetup from './components/GameSetup'
import { GameState, Player, GameType } from './types'

function App() {
  const [gameState, setGameState] = useState<GameState>({
    gameType: null,
    players: [],
    currentPlayerIndex: 0,
    isGameActive: false,
    dartsThrown: 0,
    currentTurnScore: 0,
    lastThrow: null,
    winner: null,
  })

  const [showSetup, setShowSetup] = useState(true)

  const startGame = useCallback((gameType: GameType, players: Player[]) => {
    const initializedPlayers = players.map(p => ({
      ...p,
      score: gameType === 'X01' ? 501 : 0,
      legs: 0,
      dartsThrown: 0,
      isKiller: false,
      lives: gameType === 'Killer' ? 3 : 0,
      killerNumber: null,
    }))

    setGameState({
      gameType,
      players: initializedPlayers,
      currentPlayerIndex: 0,
      isGameActive: true,
      dartsThrown: 0,
      currentTurnScore: 0,
      lastThrow: null,
      winner: null,
    })
    setShowSetup(false)
  }, [])

  const handleDartHit = useCallback((segment: string, multiplier: number, baseValue: number) => {
    const score = baseValue * multiplier

    setGameState(prev => {
      if (!prev.isGameActive || prev.winner) return prev

      const newPlayers = [...prev.players]
      const currentPlayer = { ...newPlayers[prev.currentPlayerIndex] }
      const newDartsThrown = prev.dartsThrown + 1
      const newTurnScore = prev.currentTurnScore + score

      if (prev.gameType === 'X01') {
        const newScore = currentPlayer.score - score

        if (newScore < 0 || newScore === 1) {
          // Bust - reset to previous score
          if (newDartsThrown >= 3) {
            const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length
            return {
              ...prev,
              players: newPlayers,
              currentPlayerIndex: nextIndex,
              dartsThrown: 0,
              currentTurnScore: 0,
              lastThrow: { segment, score, bust: true },
            }
          }
          return {
            ...prev,
            lastThrow: { segment, score, bust: true },
            dartsThrown: newDartsThrown,
          }
        }

        currentPlayer.score = newScore
        currentPlayer.dartsThrown += 1
        newPlayers[prev.currentPlayerIndex] = currentPlayer

        // Check for win (must finish on double or bullseye)
        if (newScore === 0 && (multiplier === 2 || segment === 'BULL')) {
          return {
            ...prev,
            players: newPlayers,
            winner: currentPlayer,
            lastThrow: { segment, score, bust: false },
          }
        }

        // Next player after 3 darts
        if (newDartsThrown >= 3) {
          const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length
          return {
            ...prev,
            players: newPlayers,
            currentPlayerIndex: nextIndex,
            dartsThrown: 0,
            currentTurnScore: 0,
            lastThrow: { segment, score, bust: false },
          }
        }

        return {
          ...prev,
          players: newPlayers,
          dartsThrown: newDartsThrown,
          currentTurnScore: newTurnScore,
          lastThrow: { segment, score, bust: false },
        }
      }

      // Killer game logic
      if (prev.gameType === 'Killer') {
        // Phase 1: Establish killer numbers (hit double to claim)
        if (!currentPlayer.killerNumber && multiplier === 2) {
          currentPlayer.killerNumber = baseValue
          newPlayers[prev.currentPlayerIndex] = currentPlayer
        }

        // Phase 2: Become a killer (hit your double again)
        if (currentPlayer.killerNumber && baseValue === currentPlayer.killerNumber && multiplier === 2 && !currentPlayer.isKiller) {
          currentPlayer.isKiller = true
          newPlayers[prev.currentPlayerIndex] = currentPlayer
        }

        // Phase 3: Killers can kill others by hitting their double
        if (currentPlayer.isKiller && multiplier === 2) {
          const targetPlayer = newPlayers.find(p => p.killerNumber === baseValue && p.id !== currentPlayer.id)
          if (targetPlayer) {
            targetPlayer.lives -= 1
            if (targetPlayer.lives <= 0) {
              targetPlayer.isKiller = false
            }
          }
        }

        currentPlayer.dartsThrown += 1
        newPlayers[prev.currentPlayerIndex] = currentPlayer

        // Check for winner (last player with lives)
        const alivePlayers = newPlayers.filter(p => p.lives > 0 || !p.killerNumber)
        const playersWithNumbers = newPlayers.filter(p => p.killerNumber)
        if (playersWithNumbers.length === newPlayers.length && alivePlayers.length === 1) {
          return {
            ...prev,
            players: newPlayers,
            winner: alivePlayers[0],
            lastThrow: { segment, score, bust: false },
          }
        }

        // Next player after 3 darts
        if (newDartsThrown >= 3) {
          let nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length
          // Skip eliminated players
          let attempts = 0
          while (newPlayers[nextIndex].lives <= 0 && newPlayers[nextIndex].killerNumber && attempts < prev.players.length) {
            nextIndex = (nextIndex + 1) % prev.players.length
            attempts++
          }
          return {
            ...prev,
            players: newPlayers,
            currentPlayerIndex: nextIndex,
            dartsThrown: 0,
            currentTurnScore: 0,
            lastThrow: { segment, score, bust: false },
          }
        }

        return {
          ...prev,
          players: newPlayers,
          dartsThrown: newDartsThrown,
          currentTurnScore: newTurnScore,
          lastThrow: { segment, score, bust: false },
        }
      }

      return prev
    })
  }, [])

  const resetGame = useCallback(() => {
    setGameState({
      gameType: null,
      players: [],
      currentPlayerIndex: 0,
      isGameActive: false,
      dartsThrown: 0,
      currentTurnScore: 0,
      lastThrow: null,
      winner: null,
    })
    setShowSetup(true)
  }, [])

  const undoLastThrow = useCallback(() => {
    // Simple undo - just reset current turn
    setGameState(prev => ({
      ...prev,
      dartsThrown: Math.max(0, prev.dartsThrown - 1),
    }))
  }, [])

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-zinc-950 via-stone-900 to-zinc-950 overflow-hidden relative">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Warm ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {showSetup ? (
        <GameSetup onStart={startGame} />
      ) : (
        <div className="relative w-full h-full flex flex-col lg:flex-row">
          {/* 3D Scene */}
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative">
            <Canvas
              camera={{ position: [0, 0, 6], fov: 45 }}
              shadows
            >
              <color attach="background" args={['#0a0908']} />
              <fog attach="fog" args={['#0a0908', 5, 15]} />

              <ambientLight intensity={0.2} />
              <spotLight
                position={[0, 3, 4]}
                intensity={2}
                angle={0.6}
                penumbra={0.5}
                color="#fbbf24"
                castShadow
              />
              <pointLight position={[-3, 2, 3]} intensity={0.5} color="#f59e0b" />
              <pointLight position={[3, 2, 3]} intensity={0.5} color="#f59e0b" />

              <DartboardScene
                onHit={handleDartHit}
                lastThrow={gameState.lastThrow}
                currentPlayer={gameState.players[gameState.currentPlayerIndex]}
              />

              <OrbitControls
                enablePan={false}
                minDistance={3}
                maxDistance={10}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.5}
                enableDamping
              />

              <Environment preset="warehouse" />
            </Canvas>

            {/* Throw indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    i < gameState.dartsThrown
                      ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/50'
                      : 'border-amber-900/50 bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Dashboard */}
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
            <Dashboard
              gameState={gameState}
              onReset={resetGame}
              onUndo={undoLastThrow}
            />
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {gameState.winner && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-900/90 to-stone-900/90 border-2 border-amber-500/50 rounded-lg p-6 md:p-12 text-center max-w-md mx-auto animate-pulse">
            <div className="text-amber-400 font-chalk text-xl md:text-2xl mb-4">WINNER</div>
            <div className="text-white font-display text-4xl md:text-6xl mb-6">{gameState.winner.name}</div>
            <button
              onClick={resetGame}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              NEW GAME
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-stone-600 text-xs font-mono z-10">
        Requested by @nub_insider · Built by @clonkbot
      </div>
    </div>
  )
}

export default App
