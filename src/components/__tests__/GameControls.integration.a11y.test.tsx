import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChessGame from '../ChessGame'

describe('GameControls integration and a11y states', () => {
  it('enables Undo after a move, and Redo after an undo, operable via keyboard', async () => {
    const user = userEvent.setup()

    render(<ChessGame />)

    const undoBtn = screen.getByRole('button', { name: /Undo Move/i }) as HTMLButtonElement
    const redoBtn = screen.getByRole('button', { name: /Redo Move/i }) as HTMLButtonElement

    expect(undoBtn.disabled).toBe(true)
    expect(redoBtn.disabled).toBe(true)

    // Make a move via keyboard: e2 -> e4
    const from = await screen.findByLabelText(/e2\s+white pawn/i)
    const to = await screen.findByLabelText(/e4\s+empty/i)

    from.focus()
    await user.keyboard('{Enter}')
    to.focus()
    await user.keyboard('{Enter}')

    // Undo should be enabled now
    expect(undoBtn.disabled).toBe(false)

    // Activate Undo via keyboard
    undoBtn.focus()
    await user.keyboard('{Enter}')

    // Redo should be enabled now
    expect(redoBtn.disabled).toBe(false)
  })
})
