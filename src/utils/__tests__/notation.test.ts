import { describe, it, expect } from 'vitest'
import { BOARD_SIZE, generateAlgebraicNotation, getCoordinatesFromSquare } from '../../utils/chessUtils'
import type { Board, ChessPiece } from '../../types/chess'

const emptyBoard = (): Board => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))

describe('generateAlgebraicNotation - promotion and en passant', () => {
  it('generates default promotion to queen when no promotion piece specified', () => {
    const board = emptyBoard()
    const from = 'e7'
    const to = 'e8'
    const [fr, fc] = getCoordinatesFromSquare(from)
    const pawn: ChessPiece = { type: 'pawn', color: 'white', hasMoved: true }
    board[fr][fc] = pawn

    const san = generateAlgebraicNotation(board, pawn, from, to, undefined, 'active')
    expect(san).toBe('e8=Q')
  })

  it('generates explicit promotion piece when provided', () => {
    const board = emptyBoard()
    const from = 'e7'
    const to = 'e8'
    const [fr, fc] = getCoordinatesFromSquare(from)
    const pawn: ChessPiece = { type: 'pawn', color: 'white', hasMoved: true }
    board[fr][fc] = pawn

    const san = generateAlgebraicNotation(board, pawn, from, to, undefined, 'active', { promotion: 'rook' })
    expect(san).toBe('e8=R')
  })

  it('marks en passant captures with e.p.', () => {
    const board = emptyBoard()
    const from = 'e5'
    const to = 'd6'
    const [fr, fc] = getCoordinatesFromSquare(from)
    const pawn: ChessPiece = { type: 'pawn', color: 'white', hasMoved: true }
    board[fr][fc] = pawn

    const san = generateAlgebraicNotation(board, pawn, from, to, null, 'active', { enPassant: true })
    expect(san).toBe('exd6 e.p.')
  })
})
