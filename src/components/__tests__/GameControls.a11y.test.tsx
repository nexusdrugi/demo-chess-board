import React from 'react'
import { render, screen } from '@testing-library/react'
import GameControls from '../GameControls'
import type { GameControlsProps } from '../../types/chess'
import { baseGameState } from '../../test/chessTestUtils'

describe('GameControls a11y live status', () => {
  it('announces status changes via a role="status" region', () => {
    const gs = baseGameState({ gameStatus: 'active', currentPlayer: 'white' })

    const props: GameControlsProps = {
      gameState: gs,
      onResetGame: () => {},
      onUndoMove: () => {},
      onRedoMove: () => {},
    }

    const { rerender } = render(<GameControls {...props} />)

    // Initial status
    const statusRegion = screen.getByRole('status')
    expect(statusRegion).toHaveTextContent(/active/i)

    // Change to check
    const next = { ...gs, gameStatus: 'check' as const }
    rerender(<GameControls {...props} gameState={next} />)
    expect(screen.getByRole('status')).toHaveTextContent(/check/i)

    // Change to checkmate
    const mate = { ...gs, gameStatus: 'checkmate' as const, currentPlayer: 'black' as const }
    rerender(<GameControls {...props} gameState={mate} />)
    expect(screen.getByRole('status')).toHaveTextContent(/checkmate/i)
  })
})
