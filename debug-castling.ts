import { updateCastlingRightsForMove, createInitialCastlingRights, createInitialBoard } from './src/utils/chessUtils'
import type { ChessPiece, Board } from './src/types/chess'

// Simulate the exact sequence from the test
let board: Board = createInitialBoard()
let castlingRights = createInitialCastlingRights()

console.log('=== Simulating test sequence ===')
console.log('Initial castling rights:')
console.log(`white(K:${castlingRights.white.kingSide}, Q:${castlingRights.white.queenSide}), black(K:${castlingRights.black.kingSide}, Q:${castlingRights.black.queenSide})`)

// Helper function to simulate a move
const simulateMove = (from: string, to: string, description: string) => {
  console.log(`\n${description}: ${from} -> ${to}`)
  
  const [fromRow, fromCol] = [8 - parseInt(from[1]), from.charCodeAt(0) - 'a'.charCodeAt(0)]
  const [toRow, toCol] = [8 - parseInt(to[1]), to.charCodeAt(0) - 'a'.charCodeAt(0)]
  
  const piece = board[fromRow][fromCol]
  const capturedPiece = board[toRow][toCol]
  
  console.log(`Moving piece: ${piece ? `${piece.color} ${piece.type}` : 'none'}`)
  console.log(`Captured piece: ${capturedPiece ? `${capturedPiece.color} ${capturedPiece.type}` : 'none'}`)
  
  if (piece) {
    // Update board
    board[toRow][toCol] = { ...piece, hasMoved: true }
    board[fromRow][fromCol] = null
    
    // Update castling rights
    castlingRights = updateCastlingRightsForMove(
      castlingRights,
      piece,
      from as any,
      to as any,
      capturedPiece || undefined
    )
    
    console.log(`Updated castling rights: white(K:${castlingRights.white.kingSide}, Q:${castlingRights.white.queenSide}), black(K:${castlingRights.black.kingSide}, Q:${castlingRights.black.queenSide})`)
  }
}

// Knight route to capture a8 rook: b1->a3, c7 pawn must move, a3->b5, b5->c7, c7->a8xR
simulateMove('b1', 'a3', 'Move 1: White knight b1->a3')
simulateMove('c7', 'c6', 'Move 2: Black pawn c7->c6')
simulateMove('a3', 'b5', 'Move 3: White knight a3->b5')
simulateMove('h7', 'h6', 'Move 4: Black pawn h7->h6')
simulateMove('b5', 'c7', 'Move 5: White knight b5->c7')
simulateMove('a7', 'a6', 'Move 6: Black pawn a7->a6')

console.log('\n=== Before final capture ===')
console.log(`Piece on a8: ${board[0][0] ? `${board[0][0].color} ${board[0][0].type}` : 'empty'}`)
console.log(`Piece on c7: ${board[1][2] ? `${board[1][2].color} ${board[1][2].type}` : 'empty'}`)

simulateMove('c7', 'a8', 'Move 7: White knight c7->a8 (capture rook)')

console.log('\n=== Final Result ===')
console.log(`black.queenSide should be false, actual: ${castlingRights.black.queenSide}`)
console.log(`Test ${castlingRights.black.queenSide === false ? 'PASSED' : 'FAILED'}`)