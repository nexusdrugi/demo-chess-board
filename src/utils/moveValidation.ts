import { Board, ChessPiece, Square, PieceType } from '../types/chess'
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
  
  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, square, piece)
    case 'rook':
      return getRookMoves(board, square, piece)
    case 'knight':
      return getKnightMoves(board, square, piece)
    case 'bishop':
      return getBishopMoves(board, square, piece)
    case 'queen':
      return getQueenMoves(board, square, piece)
    case 'king':
      return getKingMoves(board, square, piece)
    default:
      return []
  }
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