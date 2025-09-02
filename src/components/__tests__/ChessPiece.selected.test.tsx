import React from 'react'
import { render } from '@testing-library/react'
import ChessBoard from '../ChessBoard'
import { baseGameState, createEmptyBoard } from '../../test/chessTestUtils'

it('adds selected styling to piece when selectedSquare matches', () => {
  const board = createEmptyBoard()
  // Place a piece on e2
  board[6][4] = { type: 'pawn', color: 'white', hasMoved: false }

  const { container } = render(
    <ChessBoard
      gameState={baseGameState({ board, selectedSquare: 'e2', validMoves: [] })}
      onSquareClick={() => {}}
      onPieceDrop={() => {}}
    />
  )

  const pieceEl = container.querySelector('.chess-piece') as HTMLElement
  expect(pieceEl).toBeTruthy()
  expect(pieceEl.className).toContain('scale-110')
})
