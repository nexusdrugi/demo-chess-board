import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChessGame from '../ChessGame'

function createDataTransfer() {
  const store: Record<string, string> = {}
  return {
    setData: (type: string, val: string) => { store[type] = String(val) },
    getData: (type: string) => store[type] ?? '',
    clearData: () => { Object.keys(store).forEach(k => delete store[k]) },
  } as unknown as DataTransfer
}

describe('Visual feedback during/after DnD', () => {
  it('shows valid-move highlight on target during drag and clears selection/highlights after drop', async () => {
    const { container } = render(<ChessGame />)

    const fromSquare = await screen.findByLabelText(/e2\s+white pawn/i)
    const toSquare = await screen.findByLabelText(/e4\s+empty/i)

    // Start drag to trigger selection and valid move highlights
    const pieceEl = fromSquare.querySelector('.chess-piece') as HTMLElement
    const dt = createDataTransfer()
    fireEvent.dragStart(pieceEl, { dataTransfer: dt })

    // Valid-move highlight should appear on e4 (legal push)
    await waitFor(() => {
      expect(toSquare.className).toContain('chess-square-valid-move')
    })

    // Drop to complete the move
    fireEvent.drop(toSquare, { dataTransfer: dt })

    // After drop, no squares should remain selected or highlighted as valid move
    const selectedEls = container.querySelectorAll('.chess-square-selected')
    expect(selectedEls.length).toBe(0)
    const stillHighlighted = Array.from(container.querySelectorAll('.chess-square')).some(el => el.className.includes('chess-square-valid-move'))
    expect(stillHighlighted).toBe(false)
  })
})
