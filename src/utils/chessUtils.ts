import { PieceType, PieceColor, Square, ChessPiece, Board, CastlingRights, GameStatus } from '../types/chess'
import { getValidMoves } from './moveValidation'

// Board configuration
export const BOARD_SIZE = 8

// Get piece Unicode symbol
export const getPieceSymbol = (type: PieceType, color: PieceColor): string => {
  const pieces = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  }
  return pieces[color][type]
}

// Get square color (light or dark)
export const getSquareColor = (file: string, rank: number): 'light' | 'dark' => {
  const fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0)
  return (fileIndex + rank) % 2 === 0 ? 'dark' : 'light'
}

// Convert square notation to coordinates
export const getCoordinatesFromSquare = (square: Square): [number, number] => {
  const file = square[0]
  const rank = parseInt(square[1])
  const col = file.charCodeAt(0) - 'a'.charCodeAt(0)
  const row = BOARD_SIZE - rank
  return [row, col]
}

// Convert coordinates to square notation
export const getSquareFromCoordinates = (row: number, col: number): Square => {
  const file = String.fromCharCode('a'.charCodeAt(0) + col)
  const rank = BOARD_SIZE - row
  return `${file}${rank}`
}

// Create initial chess board
export const createInitialBoard = (): Board => {
  const board: Board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  
  // Place pawns
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false }
    board[BOARD_SIZE - 2][col] = { type: 'pawn', color: 'white', hasMoved: false }
  }
  
  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black', hasMoved: false }
    board[BOARD_SIZE - 1][col] = { type: pieceOrder[col], color: 'white', hasMoved: false }
  }
  
  return board
}

// Check if a square is within board bounds
export const isValidSquare = (square: Square): boolean => {
  if (square.length !== 2) return false
  const file = square[0]
  const rank = parseInt(square[1])
  const maxFile = String.fromCharCode('a'.charCodeAt(0) + (BOARD_SIZE - 1))
  return file >= 'a' && file <= maxFile && rank >= 1 && rank <= BOARD_SIZE
}

// Validate drag data format (e.g., 'e2')
export const isValidDragData = (data: string | null | undefined): boolean => {
  if (typeof data !== 'string') return false
  const value = data.trim().toLowerCase()
  if (value.length !== 2) return false
  return isValidSquare(value as Square)
}

// Sanitize and validate potential square input
export const sanitizeSquareInput = (input: string | null | undefined): Square | null => {
  if (typeof input !== 'string') return null
  const value = input.trim().toLowerCase()
  return isValidSquare(value as Square) ? (value as Square) : null
}

// Get piece at square
export const getPieceAtSquare = (board: Board, square: Square): ChessPiece | null => {
  if (!isValidSquare(square)) return null
  const [row, col] = getCoordinatesFromSquare(square)
  return board[row][col]
}

// Check if square is occupied by opponent
export const isOpponentPiece = (board: Board, square: Square, playerColor: PieceColor): boolean => {
  const piece = getPieceAtSquare(board, square)
  return piece !== null && piece.color !== playerColor
}

// Check if square is occupied by own piece
export const isOwnPiece = (board: Board, square: Square, playerColor: PieceColor): boolean => {
  const piece = getPieceAtSquare(board, square)
  return piece !== null && piece.color === playerColor
}

// Check if square is empty
export const isEmptySquare = (board: Board, square: Square): boolean => {
  return getPieceAtSquare(board, square) === null
}

// Castling helpers and rights management
export const createInitialCastlingRights = (): CastlingRights => ({
  white: { kingSide: true, queenSide: true },
  black: { kingSide: true, queenSide: true }
})

export const isKingMove = (piece: ChessPiece | null): boolean => piece?.type === 'king'
export const isRookMove = (piece: ChessPiece | null): boolean => piece?.type === 'rook'

// Update castling rights based on a move (king moves disable both sides; rook moves disable side from original corner)
export const updateCastlingRightsForMove = (
  rights: CastlingRights,
  piece: ChessPiece | null,
  from: Square,
  to: Square,
  captured?: ChessPiece | null
): CastlingRights => {
  const next: CastlingRights = {
    white: { ...rights.white },
    black: { ...rights.black }
  }

  if (!piece) return next

  if (isKingMove(piece)) {
    if (piece.color === 'white') {
      next.white.kingSide = false
      next.white.queenSide = false
    } else {
      next.black.kingSide = false
      next.black.queenSide = false
    }
  } else if (isRookMove(piece)) {
    // Disable the side corresponding to the rook's starting file
    if (piece.color === 'white') {
      if (from === 'h1') next.white.kingSide = false
      if (from === 'a1') next.white.queenSide = false
    } else {
      if (from === 'h8') next.black.kingSide = false
      if (from === 'a8') next.black.queenSide = false
    }
  }

  // Captured rook disables opponent's corresponding side based on the destination square
  if (captured?.type === 'rook') {
    if (to === 'a1') next.white.queenSide = false
    if (to === 'h1') next.white.kingSide = false
    if (to === 'a8') next.black.queenSide = false
    if (to === 'h8') next.black.kingSide = false
  }

  return next
}

// Notation helpers
export const getPieceNotationSymbol = (type: PieceType): string => {
  switch (type) {
    case 'king':
      return 'K'
    case 'queen':
      return 'Q'
    case 'rook':
      return 'R'
    case 'bishop':
      return 'B'
    case 'knight':
      return 'N'
    case 'pawn':
    default:
      return ''
  }
}

export const isCastlingMove = (piece: ChessPiece, from: Square, to: Square): 'O-O' | 'O-O-O' | null => {
  if (piece.type !== 'king') return null
  // Standard king-side and queen-side destinations from initial squares
  if (from === 'e1' && to === 'g1') return 'O-O'
  if (from === 'e1' && to === 'c1') return 'O-O-O'
  if (from === 'e8' && to === 'g8') return 'O-O'
  if (from === 'e8' && to === 'c8') return 'O-O-O'
  return null
}

// Determine if any other same-type piece (same color) can also move to `to` (legal move),
// requiring disambiguation in algebraic notation.
const getOtherCandidateFromSquares = (board: Board, piece: ChessPiece, from: Square, to: Square): Square[] => {
  const others: Square[] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c]
      if (!p) continue
      if (p.color !== piece.color) continue
      if (p.type !== piece.type) continue
      const sq = getSquareFromCoordinates(r, c)
      if (sq === from) continue
      const moves = getValidMoves(board, sq, p)
      if (moves.includes(to)) others.push(sq)
    }
  }
  return others
}

const getDisambiguationString = (from: Square, conflictSquares: Square[]): string => {
  if (conflictSquares.length === 0) return ''
  const fromFile = from[0]
  const fromRank = from[1]
  const files = conflictSquares.map(s => s[0])
  const ranks = conflictSquares.map(s => s[1])
  const fileUnique = !files.includes(fromFile)
  const rankUnique = !ranks.includes(fromRank)
  if (fileUnique) return fromFile
  if (rankUnique) return fromRank
  return `${fromFile}${fromRank}`
}

// Generate SAN (Standard Algebraic Notation) for a move
export const generateAlgebraicNotation = (
  board: Board,
  piece: ChessPiece,
  from: Square,
  to: Square,
  captured?: ChessPiece | null,
  resultStatus?: GameStatus
): string => {
  // Castling
  const castle = isCastlingMove(piece, from, to)
  if (castle) {
    return castle + (resultStatus === 'checkmate' ? '#' : resultStatus === 'check' ? '+' : '')
  }

  const pieceSymbol = getPieceNotationSymbol(piece.type)

  // Pawn moves
  if (piece.type === 'pawn') {
    const captureMark = captured ? 'x' : ''
    const base = captured ? `${from[0]}${captureMark}${to}` : `${to}`
    const suffix = resultStatus === 'checkmate' ? '#' : resultStatus === 'check' ? '+' : ''
    return base + suffix
  }

  // Pieces other than pawn
  const conflicts = piece.type === 'king' ? [] : getOtherCandidateFromSquares(board, piece, from, to)
  const disamb = getDisambiguationString(from, conflicts)
  const captureMark = captured ? 'x' : ''
  const base = `${pieceSymbol}${disamb}${captureMark}${to}`
  const suffix = resultStatus === 'checkmate' ? '#' : resultStatus === 'check' ? '+' : ''
  return base + suffix
}
