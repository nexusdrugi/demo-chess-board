import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useChessGame, initialGameState } from '../useChessGame'
import { GameState, Piece } from '../types/chess'

// Helper to perform a move via the hook's public API
const move = (hook: any, from: string, to: string) => {
  console.log(`TEST: Attempting move from ${from} to ${to}`)
  act(() => {
    hook.result.current.handleSquareClick(from as any)
    hook.result.current.handlePieceDrop(from as any, to as any)
  })
  console.log(`TEST: Move completed, current turn: ${hook.result.current.gameState.currentPlayer}`)
}

describe('useChessGame - undo and castling rights', () => {
  it('moves a piece and undoes it, restoring hasMoved state', () => {
    const hook = renderHook(() => useChessGame())

    // Move white pawn from e2 to e4
    move(hook, 'e2', 'e4')

    // Move black pawn from e7 to e5
    move(hook, 'e7', 'e5')

    // Undo last move (black)
    act(() => hook.result.current.undoMove())

    // Ensure black pawn returned and white pawn still on e4
    const { board } = hook.result.current.gameState
    const whitePawn = board[8 - 4][4] // e4 -> row = 8-4=4, col=e=4
    const blackPawnOriginal = board[8 - 7][4] // e7 -> row = 1, col=4

    expect(whitePawn?.type).toBe('pawn')
    expect(whitePawn?.color).toBe('white')
    expect(blackPawnOriginal?.type).toBe('pawn')
    expect(blackPawnOriginal?.color).toBe('black')
  })

  it('restores captured piece and its hasMoved on undo', () => {
    const hook = renderHook(() => useChessGame())

    // Sequence: e2e4, d7d5, e4xd5
    move(hook, 'e2', 'e4')
    move(hook, 'd7', 'd5')
    move(hook, 'e4', 'd5')

    // Undo the capture
    act(() => hook.result.current.undoMove())

    const { board } = hook.result.current.gameState
    // e4 should have white pawn back, d5 should have black pawn back
    const e4 = board[8 - 4][4]
    const d5 = board[8 - 5][3]

    expect(e4?.type).toBe('pawn')
    expect(e4?.color).toBe('white')
    expect(d5?.type).toBe('pawn')
    expect(d5?.color).toBe('black')
  })

  it('updates castling rights on king move and restores on undo', () => {
    const hook = renderHook(() => useChessGame())

    // Free a path for the king minimally (move the piece in front of the king)
    move(hook, 'e2', 'e3') // white pawn forward to open space
    move(hook, 'e7', 'e6') // black respond

    // Move white king e1 to e2
    move(hook, 'e1', 'e2')

    let rights = hook.result.current.gameState.castlingRights
    expect(rights.white.kingSide).toBe(false)
    expect(rights.white.queenSide).toBe(false)

    // Undo king move
    act(() => hook.result.current.undoMove())
    rights = hook.result.current.gameState.castlingRights
    expect(rights.white.kingSide).toBe(true)
    expect(rights.white.queenSide).toBe(true)
  })

  it('updates castling rights on rook move and restores on undo', () => {
    const hook = renderHook(() => useChessGame())

    // Free rook path slightly: move pawn from a2 to a3
    move(hook, 'a2', 'a3')
    move(hook, 'a7', 'a6')

    // Move white rook from a1 to a2
    move(hook, 'a1', 'a2')

    let rights = hook.result.current.gameState.castlingRights
    expect(rights.white.queenSide).toBe(false)
    expect(rights.white.kingSide).toBe(true)

    // Undo rook move
    act(() => hook.result.current.undoMove())
    rights = hook.result.current.gameState.castlingRights
    expect(rights.white.queenSide).toBe(true)
  })

  test('updates castling rights on rook move and restores on undo', () => {
    const hook = renderHook(() => useChessGame())

    // Free rook path slightly: move pawn from a2 to a3
    move(hook, 'a2', 'a3')
    move(hook, 'a7', 'a6')

    // Move white rook from a1 to a2
    move(hook, 'a1', 'a2')

    let rights = hook.result.current.gameState.castlingRights
    expect(rights.white.queenSide).toBe(false)
    expect(rights.white.kingSide).toBe(true)

    // Undo rook move
    act(() => hook.result.current.undoMove())
    rights = hook.result.current.gameState.castlingRights
    expect(rights.white.queenSide).toBe(true)
  })

  test('disables black queen-side castling when white captures the a8 rook', () => {
    const customBoard: (Piece | null)[][] = initialGameState.board.map(r => r.map(p => null));

    // Place pieces for the test scenario
    customBoard[0][0] = { type: 'rook', color: 'black' }; // Black rook on a8
    customBoard[1][2] = { type: 'knight', color: 'white' }; // White knight on c7
    customBoard[7][4] = { type: 'king', color: 'white' }; // White king on e1
    customBoard[0][4] = { type: 'king', color: 'black' }; // Black king on e8

    const customInitialState: GameState = {
      ...initialGameState,
      board: customBoard,
      currentPlayer: 'white',
      castlingRights: {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true },
      },
    };

    const { result } = renderHook(() => useChessGame(customInitialState));
    const hook = { result };

    move(hook, 'c7', 'a8') // white knight c7->a8 (capture rook)

    const rights = hook.result.current.gameState.castlingRights
    expect(rights.black.queenSide).toBe(false)
  })
})

