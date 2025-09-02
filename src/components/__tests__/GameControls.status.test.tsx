import React from 'react'
import { render, screen } from '@testing-library/react'
import GameControls from '../GameControls'
import { baseGameState } from '../../test/chessTestUtils'

describe('GameControls status rendering and move history', () => {
  it('renders status: check, checkmate (with winner), and stalemate', () => {
    // Check
    let gs = baseGameState({ gameStatus: 'check' })
    const { rerender } = render(
      <GameControls gameState={gs} onResetGame={() => {}} onUndoMove={() => {}} onRedoMove={() => {}} />
    )
    expect(screen.getByText(/⚠️ Check!/)).toBeInTheDocument()

    // Checkmate — winner is opposite of currentPlayer label
    gs = baseGameState({ gameStatus: 'checkmate', currentPlayer: 'white' })
    rerender(<GameControls gameState={gs} onResetGame={() => {}} onUndoMove={() => {}} onRedoMove={() => {}} />)
    expect(screen.getByText(/Checkmate —/)).toBeInTheDocument()
    expect(screen.getByText(/Black/)).toBeInTheDocument()

    // Stalemate
    gs = baseGameState({ gameStatus: 'stalemate' })
    rerender(<GameControls gameState={gs} onResetGame={() => {}} onUndoMove={() => {}} onRedoMove={() => {}} />)
    expect(screen.getByText(/Stalemate — Draw!/)).toBeInTheDocument()
  })

  it('renders SAN move history entries', () => {
    const gs = baseGameState({
      moveHistory: [
        { piece: { type: 'king', color: 'white', hasMoved: true }, from: 'e1', to: 'g1', notation: 'O-O', timestamp: new Date(), prevHasMoved: false, prevCastlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } } },
        { piece: { type: 'pawn', color: 'white', hasMoved: true }, from: 'e2', to: 'd3', notation: 'exd3', timestamp: new Date(), prevHasMoved: false, prevCastlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } } },
        { piece: { type: 'queen', color: 'white', hasMoved: true }, from: 'd1', to: 'h5', notation: 'Qh5#', timestamp: new Date(), prevHasMoved: false, prevCastlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } } },
      ]
    })

    render(
      <GameControls gameState={gs} onResetGame={() => {}} onUndoMove={() => {}} onRedoMove={() => {}} />
    )

    expect(screen.getByText('O-O')).toBeInTheDocument()
    expect(screen.getByText('exd3')).toBeInTheDocument()
    expect(screen.getByText('Qh5#')).toBeInTheDocument()
  })
})
