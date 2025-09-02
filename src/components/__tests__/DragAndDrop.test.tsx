import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import ChessBoard from '../ChessBoard'
import { ChessBoardProps, ChessPiece } from '../../types/chess'
import { vi } from 'vitest'
import { createEmptyBoard, baseGameState } from '../../test/chessTestUtils'

function createDataTransfer() {
  const store: Record<string, string> = {}
  return {
    setData: (type: string, val: string) => { store[type] = String(val) },
    getData: (type: string) => store[type] ?? '',
    clearData: () => { Object.keys(store).forEach(k => delete store[k]) },
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [] as File[],
    items: [] as DataTransferItem[],
    types: [] as string[],
  } as unknown as DataTransfer
}

describe('Drag-and-Drop Integration', () => {
  it('calls onPieceDrop when dragging from one square to another (valid payload)', () => {
    // Place a white pawn at e2
    const board = createEmptyBoard()
    board[6][4] = { type: 'pawn', color: 'white', hasMoved: false }

    const onPieceDrop = vi.fn()
    const props: ChessBoardProps = {
      gameState: baseGameState({ board }),
      onSquareClick: () => {},
      onPieceDrop,
    }

    const { container } = render(<ChessBoard {...props} />)

    const squares = container.querySelectorAll('.chess-square')
    // e2 index: (8 - rank) * 8 + fileIndex = (8 - 2)*8 + 4 = 52; e4 = (8 - 4)*8 + 4 = 36
    const fromSquareEl = squares[52] as HTMLElement
    const toSquareEl = squares[36] as HTMLElement

    const pieceEl = fromSquareEl.querySelector('.chess-piece') as HTMLElement
    expect(pieceEl).toBeTruthy()

    const dt = createDataTransfer()
    fireEvent.dragStart(pieceEl, { dataTransfer: dt })
    fireEvent.dragOver(toSquareEl, { dataTransfer: dt })
    fireEvent.drop(toSquareEl, { dataTransfer: dt })

    expect(onPieceDrop).toHaveBeenCalledWith('e2', 'e4')
  })

  it('does not call onPieceDrop when dropping onto the same square', () => {
    const board = createEmptyBoard()
    board[6][4] = { type: 'pawn', color: 'white', hasMoved: false }

    const onPieceDrop = vi.fn()
    const props: ChessBoardProps = {
      gameState: baseGameState({ board }),
      onSquareClick: () => {},
      onPieceDrop,
    }

    const { container } = render(<ChessBoard {...props} />)
    const squares = container.querySelectorAll('.chess-square')
    const fromSquareEl = squares[52] as HTMLElement
    const toSquareEl = squares[52] as HTMLElement

    const pieceEl = fromSquareEl.querySelector('.chess-piece') as HTMLElement
    const dt = createDataTransfer()
    fireEvent.dragStart(pieceEl, { dataTransfer: dt })
    fireEvent.dragOver(toSquareEl, { dataTransfer: dt })
    fireEvent.drop(toSquareEl, { dataTransfer: dt })

    expect(onPieceDrop).not.toHaveBeenCalled()
  })

  it('ignores invalid drag payloads and does not call onPieceDrop', () => {
    const board = createEmptyBoard()
    board[6][4] = { type: 'pawn', color: 'white', hasMoved: false }

    const onPieceDrop = vi.fn()
    const props: ChessBoardProps = {
      gameState: baseGameState({ board }),
      onSquareClick: () => {},
      onPieceDrop,
    }

    const { container } = render(<ChessBoard {...props} />)
    const squares = container.querySelectorAll('.chess-square')
    const toSquareEl = squares[36] as HTMLElement // e4

    const dt = createDataTransfer()
    // Inject invalid data intentionally (bypass ChessPiece.dragStart)
    dt.setData('text/plain', 'not-a-square')

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    fireEvent.drop(toSquareEl, { dataTransfer: dt })

    expect(onPieceDrop).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalled() // logs invalid drag data

    errorSpy.mockRestore()
  })
})
