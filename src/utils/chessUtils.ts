import { PieceType, PieceColor, Square, ChessPiece, Board } from '../types/chess'

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
  const row = 8 - rank
  return [row, col]
}

// Convert coordinates to square notation
export const getSquareFromCoordinates = (row: number, col: number): Square => {
  const file = String.fromCharCode('a'.charCodeAt(0) + col)
  const rank = 8 - row
  return `${file}${rank}`
}

// Create initial chess board
export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false }
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false }
  }
  
  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black', hasMoved: false }
    board[7][col] = { type: pieceOrder[col], color: 'white', hasMoved: false }
  }
  
  return board
}

// Check if a square is within board bounds
export const isValidSquare = (square: Square): boolean => {
  if (square.length !== 2) return false
  const file = square[0]
  const rank = parseInt(square[1])
  return file >= 'a' && file <= 'h' && rank >= 1 && rank <= 8
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