import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useChessGame, initialGameState } from '../useChessGame'
import type { GameState, ChessPiece } from '../../types/chess'

const emptyBoard = (): (ChessPiece | null)[][] => Array(8).fill(null).map(() => Array(8).fill(null))

describe('useChessGame - promotion flow', () => {
  test('requests promotion when pawn reaches back rank and completes with chosen piece', () => {
    const board = emptyBoard()
    // White pawn on e7, white king e1, black king e8 to satisfy rules min
    board[8 - 7][4] = { type: 'pawn', color: 'white', hasMoved: true } // e7
    board[8 - 1][5] = null
    board[8 - 1][4] = { type: 'king', color: 'white', hasMoved: false } // e1
    board[8 - 8][0] = { type: 'king', color: 'black', hasMoved: false } // a8

    const init: GameState = {
      ...initialGameState,
      board,
      currentPlayer: 'white',
      moveHistory: [],
      redoHistory: [],
      gameStatus: 'active',
      selectedSquare: null,
      validMoves: [],
      isInCheck: false,
      enPassantTarget: null,
      pendingPromotion: null,
    }

    const { result } = renderHook(() => useChessGame(init))

    // Select e7 and move to e8
    act(() => {
      result.current.handleSquareClick('e7')
      result.current.handlePieceDrop('e7', 'e8')
    })

    // Pending promotion should be set, no board change yet at e8
    expect(result.current.gameState.pendingPromotion).toEqual({ from: 'e7', to: 'e8', color: 'white' })
    const b1 = result.current.gameState.board
    expect(b1[8 - 8][4]?.type).not.toBeDefined() // e8 still empty

    // Complete with Queen
    act(() => {
      result.current.completePromotion('queen')
    })

    // Board should have a white queen at e8, SAN should include =Q
    const b2 = result.current.gameState.board
    expect(b2[8 - 8][4]?.type).toBe('queen')
    expect(b2[8 - 8][4]?.color).toBe('white')
    const last = result.current.gameState.moveHistory.at(-1)!
    expect(last.notation).toMatch(/e8=Q|ex.*=Q/)

    // Undo and Redo should restore promotion state properly
    act(() => result.current.undoMove())
    const bUndo = result.current.gameState.board
    expect(bUndo[8 - 7][4]?.type).toBe('pawn') // pawn back at e7

    act(() => result.current.redoMove())
    const bRedo = result.current.gameState.board
    expect(bRedo[8 - 8][4]?.type).toBe('queen')
  })
})
