import { renderHook, act } from '@testing-library/react'
import { useChessGame } from './src/hooks/useChessGame'
import { createInitialBoard } from './src/utils/chessUtils'

// Debug the exact test scenario
const hook = renderHook(() => useChessGame())

console.log('Initial castling rights:', hook.result.current.gameState.castlingRights)

// Move 1: White knight from b1 to c3
act(() => {
  hook.result.current.selectSquare('b1')
})
act(() => {
  hook.result.current.selectSquare('c3')
})
console.log('After Nb1-c3, castling rights:', hook.result.current.gameState.castlingRights)
console.log('Board at a8:', hook.result.current.gameState.board[0][0])

// Move 2: Black pawn from a7 to a6
act(() => {
  hook.result.current.selectSquare('a7')
})
act(() => {
  hook.result.current.selectSquare('a6')
})
console.log('After a7-a6, castling rights:', hook.result.current.gameState.castlingRights)
console.log('Board at a8:', hook.result.current.gameState.board[0][0])

// Move 3: White knight from c3 to d5
act(() => {
  hook.result.current.selectSquare('c3')
})
act(() => {
  hook.result.current.selectSquare('d5')
})
console.log('After Nc3-d5, castling rights:', hook.result.current.gameState.castlingRights)
console.log('Board at a8:', hook.result.current.gameState.board[0][0])

// Move 4: Black pawn from b7 to b6
act(() => {
  hook.result.current.selectSquare('b7')
})
act(() => {
  hook.result.current.selectSquare('b6')
})
console.log('After b7-b6, castling rights:', hook.result.current.gameState.castlingRights)
console.log('Board at a8:', hook.result.current.gameState.board[0][0])

// Move 5: White knight captures black rook on a8
act(() => {
  hook.result.current.selectSquare('d5')
})
console.log('Valid moves for knight on d5:', hook.result.current.gameState.validMoves)
act(() => {
  hook.result.current.selectSquare('a8')
})
console.log('After Nd5xa8, castling rights:', hook.result.current.gameState.castlingRights)
console.log('Board at a8:', hook.result.current.gameState.board[0][0])
console.log('Last move:', hook.result.current.gameState.moveHistory[hook.result.current.gameState.moveHistory.length - 1])

const rights = hook.result.current.gameState.castlingRights
console.log('Final test result - black.queenSide should be false:', rights.black.queenSide)