import { renderHook, act } from '@testing-library/react'
import { useChessGame } from './src/hooks/useChessGame'

// Helper to perform a move via the hook's public API
const move = (hook: any, from: string, to: string) => {
  act(() => {
    hook.result.current.handleSquareClick(from as any)
    hook.result.current.handlePieceDrop(from as any, to as any)
  })
}

const hook = renderHook(() => useChessGame())

console.log('Starting test: disables black queen-side castling when white captures the a8 rook')

// Knight route to capture a8 rook: b1->a3, c7 pawn must move, a3->b5, b5->c7, c7->a8xR
console.log('Move 1: b1 -> a3')
move(hook, 'b1', 'a3')

console.log('Move 2: c7 -> c6')
move(hook, 'c7', 'c6')

console.log('Move 3: a3 -> b5')
move(hook, 'a3', 'b5')

console.log('Move 4: h7 -> h6')
move(hook, 'h7', 'h6') // arbitrary black move

console.log('Move 5: b5 -> c7')
move(hook, 'b5', 'c7')

console.log('Move 6: a7 -> a6')
move(hook, 'a7', 'a6') // open a7 to avoid interference

console.log('Move 7: c7 -> a8 (capture rook)')
move(hook, 'c7', 'a8') // capture rook on a8

const rights = hook.result.current.gameState.castlingRights
console.log('Final castling rights:', rights)
console.log('black.queenSide should be false:', rights.black.queenSide)

if (rights.black.queenSide === false) {
  console.log('TEST PASSED!')
} else {
  console.log('TEST FAILED!')
}