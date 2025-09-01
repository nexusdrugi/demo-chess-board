import { Board, ChessPiece, Square, PieceType, PieceColor } from '../types/chess'
import {
  getCoordinatesFromSquare,
  getSquareFromCoordinates,
  isValidSquare,
  isEmptySquare,
  isOpponentPiece,
  isOwnPiece,
  BOARD_SIZE
} from './chessUtils'

// Get all valid moves for a piece at a given square
export const getValidMoves = (board: Board, square: Square, piece: ChessPiece): Square[] => {
  if (!isValidSquare(square)) return []

  let moves: Square[] = []
  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, square, piece)
      break
    case 'rook':
      moves = getRookMoves(board, square, piece)
      break
    case 'knight':
      moves = getKnightMoves(board, square, piece)
      break
    case 'bishop':
      moves = getBishopMoves(board, square, piece)
      break
    case 'queen':
      moves = getQueenMoves(board, square, piece)
      break
    case 'king':
      moves = getKingMoves(board, square, piece)
      break
    default:
      moves = []
  }

  // Filter out moves that would leave own king in check
  return moves.filter((to) => isMoveLegal(board, square, to, piece))
}

// Pawn movement logic
const getPawnMoves = (board: Board, square: Square, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const [row, col] = getCoordinatesFromSquare(square)
  const direction = piece.color === 'white' ? -1 : 1
  const startRow = piece.color === 'white' ? 6 : 1
  
  // Forward move
  const oneForward = getSquareFromCoordinates(row + direction, col)
  if (isValidSquare(oneForward) && isEmptySquare(board, oneForward)) {
    moves.push(oneForward)
    
    // Two squares forward from starting position
    if (row === startRow) {
      const twoForward = getSquareFromCoordinates(row + 2 * direction, col)
      if (isValidSquare(twoForward) && isEmptySquare(board, twoForward)) {
        moves.push(twoForward)
      }
    }
  }
  
  // Diagonal captures
  const captureLeft = getSquareFromCoordinates(row + direction, col - 1)
  const captureRight = getSquareFromCoordinates(row + direction, col + 1)
  
  if (isValidSquare(captureLeft) && isOpponentPiece(board, captureLeft, piece.color)) {
    moves.push(captureLeft)
  }
  
  if (isValidSquare(captureRight) && isOpponentPiece(board, captureRight, piece.color)) {
    moves.push(captureRight)
  }
  
  return moves
}

// Rook movement logic
const getRookMoves = (board: Board, square: Square, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const [row, col] = getCoordinatesFromSquare(square)
  
  // Horizontal and vertical directions
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
  
  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < BOARD_SIZE; i++) {
      const newSquare = getSquareFromCoordinates(row + i * dRow, col + i * dCol)
      
      if (!isValidSquare(newSquare)) break
      
      if (isEmptySquare(board, newSquare)) {
        moves.push(newSquare)
      } else if (isOpponentPiece(board, newSquare, piece.color)) {
        moves.push(newSquare)
        break
      } else {
        break // Own piece blocks
      }
    }
  }
  
  return moves
}

// Knight movement logic
const getKnightMoves = (board: Board, square: Square, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const [row, col] = getCoordinatesFromSquare(square)
  
  // Knight moves in L-shape
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]
  
  for (const [dRow, dCol] of knightMoves) {
    const newSquare = getSquareFromCoordinates(row + dRow, col + dCol)
    
    if (isValidSquare(newSquare) && !isOwnPiece(board, newSquare, piece.color)) {
      moves.push(newSquare)
    }
  }
  
  return moves
}

// Bishop movement logic
const getBishopMoves = (board: Board, square: Square, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const [row, col] = getCoordinatesFromSquare(square)
  
  // Diagonal directions
  const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
  
  for (const [dRow, dCol] of directions) {
    for (let i = 1; i < BOARD_SIZE; i++) {
      const newSquare = getSquareFromCoordinates(row + i * dRow, col + i * dCol)
      
      if (!isValidSquare(newSquare)) break
      
      if (isEmptySquare(board, newSquare)) {
        moves.push(newSquare)
      } else if (isOpponentPiece(board, newSquare, piece.color)) {
        moves.push(newSquare)
        break
      } else {
        break // Own piece blocks
      }
    }
  }
  
  return moves
}

// Queen movement logic (combination of rook and bishop)
const getQueenMoves = (board: Board, square: Square, piece: ChessPiece): Square[] => {
  return [
    ...getRookMoves(board, square, piece),
    ...getBishopMoves(board, square, piece)
  ]
}

// King movement logic
const getKingMoves = (board: Board, square: Square, piece: ChessPiece): Square[] => {
  const moves: Square[] = []
  const [row, col] = getCoordinatesFromSquare(square)
  
  // King moves one square in any direction
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ]
  
  for (const [dRow, dCol] of directions) {
    const newSquare = getSquareFromCoordinates(row + dRow, col + dCol)
    
    if (isValidSquare(newSquare) && !isOwnPiece(board, newSquare, piece.color)) {
      moves.push(newSquare)
    }
  }
  
  return moves
}

// Helper: locate king position for a given color
export const findKingPosition = (board: Board, color: PieceColor): Square | null => {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board[r][c]
      if (cell && cell.type === 'king' && cell.color === color) {
        return getSquareFromCoordinates(r, c)
      }
    }
  }
  return null
}

// Determine if a king of a given color is in check
export const isKingInCheck = (board: Board, color: PieceColor, kingSquare?: Square | null): boolean => {
  const kingPos = kingSquare ?? findKingPosition(board, color)
  if (!kingPos) return false

  // Scan opponent pieces and see if any attack the king square using pseudo-legal move generators
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c]
      if (!piece || piece.color === color) continue
      const from = getSquareFromCoordinates(r, c)
      let attacks: Square[] = []
      switch (piece.type) {
        case 'pawn':
          attacks = getPawnMoves(board, from, piece)
          break
        case 'rook':
          attacks = getRookMoves(board, from, piece)
          break
        case 'knight':
          attacks = getKnightMoves(board, from, piece)
          break
        case 'bishop':
          attacks = getBishopMoves(board, from, piece)
          break
        case 'queen':
          attacks = getQueenMoves(board, from, piece)
          break
        case 'king':
          attacks = getKingMoves(board, from, piece)
          break
      }
      if (attacks.includes(kingPos)) return true
    }
  }
  return false
}

// Validate that making a move does not leave own king in check
export const isMoveLegal = (board: Board, from: Square, to: Square, piece: ChessPiece): boolean => {
  // Simulate the move on a shallow-cloned board
  const temp: Board = board.map(row => row.map(cell => (cell ? { ...cell } : null)))
  const [fromRow, fromCol] = getCoordinatesFromSquare(from)
  const [toRow, toCol] = getCoordinatesFromSquare(to)
  temp[toRow][toCol] = { ...piece }
  temp[fromRow][fromCol] = null
  return !isKingInCheck(temp, piece.color)
}
