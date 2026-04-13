import { useState } from 'react'
import { GameType, Player } from '../types'

interface GameSetupProps {
  onStart: (gameType: GameType, players: Player[]) => void
}

const PLAYER_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export default function GameSetup({ onStart }: GameSetupProps) {
  const [gameType, setGameType] = useState<GameType>('X01')
  const [playerCount, setPlayerCount] = useState(2)
  const [playerNames, setPlayerNames] = useState<string[]>(Array(8).fill('').map((_, i) => `Player ${i + 1}`))

  const handleStart = () => {
    const players: Player[] = []
    for (let i = 0; i < playerCount; i++) {
      players.push({
        id: `player-${i}`,
        name: playerNames[i] || `Player ${i + 1}`,
        color: PLAYER_COLORS[i],
        score: gameType === 'X01' ? 501 : 0,
        legs: 0,
        dartsThrown: 0,
        isKiller: false,
        lives: gameType === 'Killer' ? 3 : 0,
        killerNumber: null,
      })
    }
    onStart(gameType, players)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-2xl">
        {/* Logo / Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 md:gap-4 mb-4">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full animate-pulse" />
            <h1 className="font-display text-4xl md:text-6xl text-white tracking-tight">AUTODARTS</h1>
            <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full animate-pulse" />
          </div>
          <p className="text-stone-500 font-chalk text-sm md:text-base tracking-widest">REAL-TIME SCORING SYSTEM</p>
        </div>

        {/* Setup Card */}
        <div className="bg-gradient-to-br from-stone-900/90 via-stone-800/90 to-stone-900/90 rounded-2xl border border-amber-900/30 overflow-hidden backdrop-blur-sm">
          {/* Chalkboard Header */}
          <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 p-4 md:p-6 border-b border-emerald-800/30">
            <h2 className="text-white font-chalk text-xl md:text-2xl text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Game Setup
            </h2>
          </div>

          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Game Type Selection */}
            <div>
              <label className="text-stone-400 font-chalk text-sm uppercase tracking-widest block mb-3 md:mb-4">
                Select Game
              </label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <GameTypeCard
                  type="X01"
                  title="501"
                  description="Race to zero. Finish on a double."
                  selected={gameType === 'X01'}
                  onClick={() => setGameType('X01')}
                />
                <GameTypeCard
                  type="Killer"
                  title="Killer"
                  description="Eliminate your opponents. Last one standing wins."
                  selected={gameType === 'Killer'}
                  onClick={() => setGameType('Killer')}
                />
              </div>
            </div>

            {/* Player Count */}
            <div>
              <label className="text-stone-400 font-chalk text-sm uppercase tracking-widest block mb-3 md:mb-4">
                Number of Players
              </label>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button
                    key={num}
                    onClick={() => setPlayerCount(num)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg font-display text-lg md:text-xl transition-all hover:scale-105 active:scale-95 ${
                      playerCount === num
                        ? 'bg-amber-600 text-black border-2 border-amber-400'
                        : 'bg-stone-700/50 text-stone-300 border border-stone-600/50 hover:border-amber-500/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Player Names */}
            <div>
              <label className="text-stone-400 font-chalk text-sm uppercase tracking-widest block mb-3 md:mb-4">
                Player Names
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(playerCount)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PLAYER_COLORS[i] }}
                    />
                    <input
                      type="text"
                      value={playerNames[i]}
                      onChange={(e) => {
                        const newNames = [...playerNames]
                        newNames[i] = e.target.value
                        setPlayerNames(newNames)
                      }}
                      className="flex-1 bg-stone-800/50 border border-stone-600/50 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-white font-chalk text-base focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                      placeholder={`Player ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="w-full py-4 md:py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl text-black font-display text-xl md:text-2xl tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/30"
            >
              START GAME
            </button>
          </div>
        </div>

        {/* Game Rules Preview */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-stone-900/50 rounded-xl border border-stone-700/30">
          <h3 className="text-amber-500 font-chalk text-sm uppercase tracking-widest mb-3">
            {gameType === 'X01' ? '501 Rules' : 'Killer Rules'}
          </h3>
          <ul className="text-stone-400 font-mono text-xs md:text-sm space-y-2">
            {gameType === 'X01' ? (
              <>
                <li>• Start at 501 points, subtract your score each turn</li>
                <li>• Must finish exactly on zero with a double or bullseye</li>
                <li>• Going below zero or hitting 1 = BUST (score resets)</li>
                <li>• Click dartboard segments to enter throws</li>
              </>
            ) : (
              <>
                <li>• Each player starts with 3 lives</li>
                <li>• Phase 1: Hit a double to claim your "killer number"</li>
                <li>• Phase 2: Hit your double again to become a KILLER</li>
                <li>• Phase 3: Killers can eliminate others by hitting their double</li>
                <li>• Last player standing wins!</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

function GameTypeCard({
  type,
  title,
  description,
  selected,
  onClick,
}: {
  type: GameType
  title: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 md:p-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
        selected
          ? 'bg-gradient-to-br from-amber-900/50 to-amber-800/30 border-2 border-amber-500/70 shadow-lg shadow-amber-500/20'
          : 'bg-stone-800/50 border border-stone-600/50 hover:border-amber-500/30'
      }`}
    >
      <div className={`font-display text-2xl md:text-4xl mb-2 ${selected ? 'text-amber-400' : 'text-stone-300'}`}>
        {title}
      </div>
      <div className="text-stone-500 font-mono text-xs md:text-sm leading-relaxed">
        {description}
      </div>
      {type === 'Killer' && (
        <div className="mt-2 md:mt-3 text-red-500 text-lg">☠</div>
      )}
    </button>
  )
}
