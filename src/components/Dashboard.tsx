import { GameState, Player } from '../types'

interface DashboardProps {
  gameState: GameState
  onReset: () => void
  onUndo: () => void
}

export default function Dashboard({ gameState, onReset, onUndo }: DashboardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-stone-900/95 via-stone-800/95 to-stone-900/95 backdrop-blur-sm relative overflow-hidden">
      {/* Chalkboard texture overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f5f5f5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="border-b border-amber-900/30 p-3 md:p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-amber-500/80 font-mono text-xs md:text-sm tracking-wider">AUTODARTS LIVE</span>
        </div>
        <div className="flex items-center gap-2 bg-stone-800/50 rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-amber-900/30">
          <span className="text-amber-400 font-display text-sm md:text-lg">{gameState.gameType}</span>
        </div>
      </div>

      {/* Current Player Highlight */}
      {currentPlayer && (
        <div className="p-3 md:p-6 border-b border-amber-900/20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-pulse" />
          <div className="relative z-10">
            <div className="text-stone-500 font-chalk text-xs md:text-sm uppercase tracking-widest mb-1 md:mb-2">Now Throwing</div>
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className="w-4 h-4 md:w-6 md:h-6 rounded-full shadow-lg animate-pulse"
                style={{ backgroundColor: currentPlayer.color, boxShadow: `0 0 20px ${currentPlayer.color}` }}
              />
              <span className="text-white font-display text-2xl md:text-4xl">{currentPlayer.name}</span>
            </div>
            <div className="mt-2 md:mt-4 flex items-baseline gap-2 md:gap-4">
              <span className="text-6xl md:text-8xl font-display text-amber-400" style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.3)' }}>
                {gameState.gameType === 'X01' ? currentPlayer.score : currentPlayer.lives}
              </span>
              <span className="text-stone-500 font-chalk text-lg md:text-xl">
                {gameState.gameType === 'X01' ? 'remaining' : 'lives'}
              </span>
            </div>
            {gameState.currentTurnScore > 0 && (
              <div className="mt-2 md:mt-3 text-green-400 font-mono text-lg md:text-2xl">
                +{gameState.currentTurnScore} this turn
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scoreboard */}
      <div className="flex-1 overflow-auto p-3 md:p-4 relative z-10">
        <div className="text-stone-500 font-chalk text-xs uppercase tracking-widest mb-2 md:mb-4 flex items-center gap-2">
          <span>SCOREBOARD</span>
          <div className="flex-1 h-px bg-stone-700" />
        </div>

        <div className="space-y-2 md:space-y-3">
          {gameState.players.map((player, index) => (
            <PlayerScoreCard
              key={player.id}
              player={player}
              isActive={index === gameState.currentPlayerIndex}
              gameType={gameState.gameType!}
            />
          ))}
        </div>
      </div>

      {/* Killer Game Legend */}
      {gameState.gameType === 'Killer' && (
        <div className="p-3 md:p-4 border-t border-amber-900/20 relative z-10">
          <div className="text-stone-500 font-chalk text-xs uppercase tracking-widest mb-2">Killer Numbers</div>
          <div className="flex flex-wrap gap-2">
            {gameState.players.map(player => (
              <div
                key={player.id}
                className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-mono flex items-center gap-2 ${
                  player.isKiller ? 'bg-red-900/50 text-red-400 border border-red-500/50' : 'bg-stone-800/50 text-stone-400'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: player.color }} />
                <span>{player.name.slice(0, 3)}</span>
                <span className="font-bold">{player.killerNumber || '?'}</span>
                {player.isKiller && <span className="text-red-500">☠</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-3 md:p-4 border-t border-amber-900/30 flex gap-2 md:gap-3 relative z-10">
        <button
          onClick={onUndo}
          className="flex-1 py-2.5 md:py-3 px-3 md:px-4 bg-stone-700/50 hover:bg-stone-600/50 border border-stone-600/50 rounded-lg text-stone-300 font-mono text-xs md:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          UNDO
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-2.5 md:py-3 px-3 md:px-4 bg-amber-900/30 hover:bg-amber-800/40 border border-amber-700/50 rounded-lg text-amber-400 font-mono text-xs md:text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          NEW GAME
        </button>
      </div>

      {/* Stats Bar */}
      <div className="p-2 md:p-3 bg-stone-950/50 border-t border-stone-800 flex justify-between text-stone-600 font-mono text-xs relative z-10">
        <span>Darts: {gameState.players.reduce((acc, p) => acc + p.dartsThrown, 0)}</span>
        <span>Round {Math.floor(gameState.players.reduce((acc, p) => acc + p.dartsThrown, 0) / (gameState.players.length * 3)) + 1}</span>
      </div>
    </div>
  )
}

function PlayerScoreCard({ player, isActive, gameType }: { player: Player; isActive: boolean; gameType: string }) {
  const isEliminated = gameType === 'Killer' && player.killerNumber && player.lives <= 0

  return (
    <div
      className={`relative rounded-lg p-3 md:p-4 transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-amber-900/40 to-stone-800/40 border border-amber-500/50 shadow-lg shadow-amber-500/10'
          : isEliminated
          ? 'bg-stone-900/30 border border-stone-700/30 opacity-50'
          : 'bg-stone-800/30 border border-stone-700/30 hover:border-stone-600/50'
      }`}
    >
      {isActive && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-full animate-pulse" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${isActive ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: player.color, boxShadow: isActive ? `0 0 10px ${player.color}` : 'none' }}
          />
          <span className={`font-display text-base md:text-xl ${isEliminated ? 'text-stone-600 line-through' : 'text-white'}`}>
            {player.name}
          </span>
          {player.isKiller && <span className="text-red-500 text-sm md:text-lg">☠</span>}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {gameType === 'Killer' && (
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                    i < player.lives ? 'bg-red-500' : 'bg-stone-700'
                  }`}
                />
              ))}
            </div>
          )}
          <span className={`font-display text-2xl md:text-3xl ${isEliminated ? 'text-stone-600' : 'text-amber-400'}`}>
            {gameType === 'X01' ? player.score : player.killerNumber || '-'}
          </span>
        </div>
      </div>

      {/* Checkout hint for X01 */}
      {gameType === 'X01' && player.score <= 170 && player.score > 1 && (
        <div className="mt-2 text-green-500/70 font-mono text-xs">
          {getCheckoutHint(player.score)}
        </div>
      )}
    </div>
  )
}

function getCheckoutHint(score: number): string {
  const checkouts: Record<number, string> = {
    170: 'T20 T20 BULL',
    167: 'T20 T19 BULL',
    164: 'T20 T18 BULL',
    161: 'T20 T17 BULL',
    160: 'T20 T20 D20',
    158: 'T20 T20 D19',
    157: 'T20 T19 D20',
    156: 'T20 T20 D18',
    155: 'T20 T19 D19',
    154: 'T20 T18 D20',
    153: 'T20 T19 D18',
    152: 'T20 T20 D16',
    151: 'T20 T17 D20',
    150: 'T20 T18 D18',
    100: 'T20 D20',
    80: 'T20 D10',
    60: 'S20 D20',
    50: 'BULL',
    40: 'D20',
    36: 'D18',
    32: 'D16',
    20: 'D10',
    16: 'D8',
    10: 'D5',
    8: 'D4',
    6: 'D3',
    4: 'D2',
    2: 'D1',
  }

  return checkouts[score] || 'Find your out!'
}
