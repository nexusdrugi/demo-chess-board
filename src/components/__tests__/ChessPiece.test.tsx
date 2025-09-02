import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import ChessPiece from '../ChessPiece'
import { ChessPiece as PieceType } from '../../types/chess'
import { vi } from 'vitest'

function createPawn(color: 'white' | 'black'): PieceType {
  return { type: 'pawn', color, hasMoved: false }
}

describe('ChessPiece dragstart validation', () => {
  it('prevents drag and logs error when square prop is invalid', () => {
    const onDragStart = vi.fn()
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const piece = createPawn('white')
    const { container } = render(
      <ChessPiece
        piece={piece}
        square={'z9' as any}
        isSelected={false}
        isValidMove={false}
        onDragStart={onDragStart}
        onDragEnd={() => {}}
      />
    )

    const el = container.querySelector('.chess-piece') as HTMLElement
    const dt = {
      setData: vi.fn(),
    }
    // simulate dragStart with an invalid square prop
    fireEvent.dragStart(el, { dataTransfer: dt as any })

    expect(onDragStart).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled()

    errorSpy.mockRestore()
  })
})
