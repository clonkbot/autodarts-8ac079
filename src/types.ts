export type GameType = 'X01' | 'Killer'

export interface Player {
  id: string
  name: string
  color: string
  score: number
  legs: number
  dartsThrown: number
  isKiller: boolean
  lives: number
  killerNumber: number | null
}

export interface LastThrow {
  segment: string
  score: number
  bust: boolean
}

export interface GameState {
  gameType: GameType | null
  players: Player[]
  currentPlayerIndex: number
  isGameActive: boolean
  dartsThrown: number
  currentTurnScore: number
  lastThrow: LastThrow | null
  winner: Player | null
}

export interface DartboardSegment {
  value: number
  startAngle: number
  endAngle: number
}
