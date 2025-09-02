import React from 'react'
import { render, screen } from '@testing-library/react'
import ChessBoard from '../ChessBoard'
import { ChessPiece, ChessBoardProps, GameState } from '../../types/chess'

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

describe('ChessBoard', () => {
  it('renders rank and file labels and 64 squares', () => {
    const props: ChessBoardProps = {
      gameState: baseGameState(),
      onSquareClick: () => {},
      onPieceDrop: () => {},
    }

    const { container } = render(<ChessBoard {...props} />)

    // Rank labels 8..1
    for (let r = 8; r >= 1; r--) {
      expect(screen.getByText(String(r))).toBeInTheDocument()
    }
    // File labels a..h
    ['a','b','c','d','e','f','g','h'].forEach(f => {
      expect(screen.getByText(f)).toBeInTheDocument()
    })

    // 64 squares
    const squares = container.querySelectorAll('.chess-square')
    expect(squares.length).toBe(64)
  })

  it('applies selected and valid move classes when provided', () => {
    const props: ChessBoardProps = {
      gameState: baseGameState({ selectedSquare: 'e4', validMoves: ['e5', 'e6'] }),
      onSquareClick: () => {},
      onPieceDrop: () => {},
    }

    const { container } = render(<ChessBoard {...props} />)

    const squares = Array.from(container.querySelectorAll('.chess-square')) as HTMLElement[]
    const selected = squares.find(el => el.className.includes('chess-square-selected'))
    const valids = squares.filter(el => el.className.includes('chess-square-valid-move'))
    expect(selected).toBeTruthy()
    expect(valids.length).toBeGreaterThan(0)
  })
})
