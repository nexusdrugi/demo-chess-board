import { renderHook, act } from '@testing-library/react'
import { useChessGame } from './src/hooks/useChessGame'

// Helper to perform a move via the hook's public API
const move = (hook: any, from: string, to: string) => {
  console.log(`\nMove: ${from} -> ${to}`)
  act(() => {
    hook.result.current.handleSquareClick(from as any)
    hook.result.current.handlePieceDrop(from as any, to as any)
  })
  const rights = hook.result.current.gameState.castlingRights
  console.log(`Castling rights: white(K:${rights.white.kingSide}, Q:${rights.white.queenSide}), black(K:${rights.black.kingSide}, Q:${rights.black.queenSide})`)
}

console.log('=== Testing with useChessGame hook ===')
const hook = renderHook(() => useChessGame())

console.log('Initial castling rights:')
let rights = hook.result.current.gameState.castlingRights
console.log(`white(K:${rights.white.kingSide}, Q:${rights.white.queenSide}), black(K:${rights.black.kingSide}, Q:${rights.black.queenSide})`)

// Knight route to capture a8 rook: b1->a3, c7 pawn must move, a3->b5, b5->c7, c7->a8xR
move(hook, 'b1', 'a3')
move(hook, 'c7', 'c6')
move(hook, 'a3', 'b5')
move(hook, 'h7', 'h6') // arbitrary black move
move(hook, 'b5', 'c7')
move(hook, 'a7', 'a6') // open a7 to avoid interference
move(hook, 'c7', 'a8') // capture rook on a8

rights = hook.result.current.gameState.castlingRights
console.log('\n=== Final Result ===')
console.log(`black.queenSide should be false, actual: ${rights.black.queenSide}`)
console.log(`Test ${rights.black.queenSide === false ? 'PASSED' : 'FAILED'}`)