import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import GameControls from '../GameControls'
import { GameState, ChessPiece, Move } from '../../types/chess'
import { vi } from 'vitest'

function createEmptyBoard(): (ChessPiece | null)[][] {
  return Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null))
}

function baseGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'white',
    moveHistory: [],
    redoHistory: [],
    gameStatus: 'active',
    selectedSquare: null,
    validMoves: [],
    isInCheck: false,
    castlingRights: {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true }
    },
    enPassantTarget: null,
    ...overrides,
  }
}

function createMove(partial: Partial<Move>): Move {
  // Provide required defaults; tests only care about notation, from, to
  const piece: ChessPiece = { type: 'pawn', color: 'white', hasMoved: true }
  return {
    from: 'e2',
    to: 'e4',
    piece,
    notation: 'e4',
    timestamp: new Date(),
    prevHasMoved: false,
    prevCastlingRights: {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true }
    },
    ...partial,
  }
}

describe('GameControls', () => {
  it('renders current player and status, with Undo/Redo disabled when histories are empty', () => {
    const onResetGame = vi.fn()
    const onUndoMove = vi.fn()
    const onRedoMove = vi.fn()

    render(
      <GameControls
        gameState={baseGameState()}
        onResetGame={onResetGame}
        onUndoMove={onUndoMove}
        onRedoMove={onRedoMove}
      />
    )

    expect(screen.getByText('Current Player:')).toBeInTheDocument()
    expect(screen.getByText('⚪ White')).toBeInTheDocument()
    expect(screen.getByText('Status:')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()

    const undoBtn = screen.getByRole('button', { name: /Undo Move/i }) as HTMLButtonElement
    const redoBtn = screen.getByRole('button', { name: /Redo Move/i }) as HTMLButtonElement
    expect(undoBtn.disabled).toBe(true)
    expect(redoBtn.disabled).toBe(true)
  })

  it('enables Undo/Redo based on moveHistory/redoHistory and shows move history SAN', () => {
    const onResetGame = vi.fn()
    const onUndoMove = vi.fn()
    const onRedoMove = vi.fn()

    const gs = baseGameState({
      moveHistory: [
        createMove({ from: 'e2', to: 'e4', notation: 'e4' }),
        createMove({ from: 'e7', to: 'e5', notation: 'e5', piece: { type: 'pawn', color: 'black', hasMoved: true } as ChessPiece }),
      ],
      redoHistory: [
        createMove({ from: 'g1', to: 'f3', notation: 'Nf3', piece: { type: 'knight', color: 'white', hasMoved: true } as ChessPiece })
      ],
    })

    render(
      <GameControls gameState={gs} onResetGame={onResetGame} onUndoMove={onUndoMove} onRedoMove={onRedoMove} />
    )

    const undoBtn = screen.getByRole('button', { name: /Undo Move/i }) as HTMLButtonElement
    const redoBtn = screen.getByRole('button', { name: /Redo Move/i }) as HTMLButtonElement
    expect(undoBtn.disabled).toBe(false)
    expect(redoBtn.disabled).toBe(false)

    // Move History block shows SAN and from→to
    const history = screen.getByRole('heading', { name: /Move History/i }).parentElement as HTMLElement
    expect(within(history).getByText('1.')).toBeInTheDocument()
    expect(within(history).getByText('e4')).toBeInTheDocument()
    expect(within(history).getByText('e2 → e4')).toBeInTheDocument()
  })

  it('handles Reset flow: opens dialog, cancel does nothing; confirm calls onResetGame', () => {
    const onResetGame = vi.fn()
    const onUndoMove = vi.fn()
    const onRedoMove = vi.fn()

    render(
      <GameControls
        gameState={baseGameState()}
        onResetGame={onResetGame}
        onUndoMove={onUndoMove}
        onRedoMove={onRedoMove}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /Reset Game/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Cancel
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onResetGame).not.toHaveBeenCalled()

    // Open again and confirm (select confirm inside dialog)
    fireEvent.click(screen.getByRole('button', { name: /Reset Game/i }))
    const dialog = screen.getByRole('dialog')
    const confirmBtn = within(dialog).getByRole('button', { name: /Reset Game/i })
    fireEvent.click(confirmBtn)

    expect(onResetGame).toHaveBeenCalledTimes(1)
  })
})
