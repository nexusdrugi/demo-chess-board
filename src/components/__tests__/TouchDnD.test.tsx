import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ChessGame from '../ChessGame'

describe('Touch interactions for DnD', () => {
  it('supports tap-select and tap-destination to move a piece', async () => {
    render(<ChessGame />)

    const from = await screen.findByLabelText(/e2\s+white pawn/i)
    const to = await screen.findByLabelText(/e4\s+empty/i)

    // Tap to select
    fireEvent.touchStart(from)
    // Tap destination to move
    fireEvent.touchEnd(to)

    expect(await screen.findByLabelText(/e4\s+white pawn/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e2\s+empty/i)).toBeInTheDocument()
  })
})
