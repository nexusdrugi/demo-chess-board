import { renderHook, act } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { useChessGame, initialGameState } from '../useChessGame'
import type { GameState, ChessPiece } from '../../types/chess'

const makePiece = (type: ChessPiece['type'], color: ChessPiece['color'], hasMoved = false): ChessPiece => ({ type, color, hasMoved })

describe('useChessGame - castling, redo policy, and en passant expiry', () => {
  test('executes O-O with rook auto-move and SAN, supports undo/redo', () => {
    // Custom board with only kings and white rook, clear path for O-O
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null))
    board[7][4] = makePiece('king', 'white', false) // e1
    board[7][7] = makePiece('rook', 'white', false) // h1
    board[0][4] = makePiece('king', 'black', false) // e8

    const customInitial: GameState = {
      ...initialGameState,
      board,
      currentPlayer: 'white',
      castlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } },
      moveHistory: [],
      redoHistory: [],
      selectedSquare: null,
      validMoves: [],
      isInCheck: false,
      enPassantTarget: null
    }

    const { result } = renderHook(() => useChessGame(customInitial))

    // Perform white king-side castling: e1 -> g1
    act(() => {
      result.current.handleSquareClick('e1')
      result.current.handlePieceDrop('e1', 'g1')
    })

    const after = result.current.gameState
    // King at g1
    expect(after.board[7][6]?.type).toBe('king')
    expect(after.board[7][6]?.color).toBe('white')
    // Rook moved h1 -> f1
    expect(after.board[7][5]?.type).toBe('rook')
    expect(after.board[7][5]?.color).toBe('white')
    // SAN notation should be O-O
    expect(after.moveHistory[after.moveHistory.length - 1].notation).toBe('O-O')

    // Undo
    act(() => result.current.undoMove())
    const undoState = result.current.gameState
    expect(undoState.board[7][4]?.type).toBe('king') // king back to e1
    expect(undoState.board[7][7]?.type).toBe('rook') // rook back to h1

    // Redo
    act(() => result.current.redoMove())
    const redoState = result.current.gameState
    expect(redoState.board[7][6]?.type).toBe('king')
    expect(redoState.board[7][5]?.type).toBe('rook')
  })

  test('clears redo history after a new move following undo', () => {
    const { result } = renderHook(() => useChessGame())

    // White: e2->e4
    act(() => {
      result.current.handleSquareClick('e2')
      result.current.handlePieceDrop('e2', 'e4')
    })

    // Black: a7->a6
    act(() => {
      result.current.handleSquareClick('a7')
      result.current.handlePieceDrop('a7', 'a6')
    })

    // Undo last (black move)
    act(() => result.current.undoMove())
    expect(result.current.gameState.redoHistory.length).toBe(1)

    // Black makes a different new move: h7->h6
    act(() => {
      result.current.handleSquareClick('h7')
      result.current.handlePieceDrop('h7', 'h6')
    })

    // Redo history cleared
    expect(result.current.gameState.redoHistory.length).toBe(0)
  })

  test('en passant target expires after one ply when not used', () => {
    // Minimal board with kings, white pawn at e5, black pawn at d7, and white pawn at h2 for a non-e.p. move
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null))
    board[7][4] = makePiece('king', 'white') // e1
    board[0][4] = makePiece('king', 'black') // e8
    board[3][4] = makePiece('pawn', 'white', true) // e5
    board[1][3] = makePiece('pawn', 'black', false) // d7
    board[6][7] = makePiece('pawn', 'white', false) // h2

    const customInitial: GameState = {
      ...initialGameState,
      board,
      currentPlayer: 'black',
      moveHistory: [],
      redoHistory: [],
      selectedSquare: null,
      validMoves: [],
      isInCheck: false,
      enPassantTarget: null,
      castlingRights: { white: { kingSide: false, queenSide: false }, black: { kingSide: false, queenSide: false } }
    }

    const { result } = renderHook(() => useChessGame(customInitial))

    // Black: d7->d5 (sets enPassantTarget to d6)
    act(() => {
      result.current.handleSquareClick('d7')
      result.current.handlePieceDrop('d7', 'd5')
    })
    expect(result.current.gameState.enPassantTarget).toBe('d6')

    // White makes a non-e.p. move: h2->h3
    act(() => {
      result.current.handleSquareClick('h2')
      result.current.handlePieceDrop('h2', 'h3')
    })

    // e.p. target expired
    expect(result.current.gameState.enPassantTarget).toBeNull()
  })
})

