import { describe, it, expect } from 'vitest'
import { BOARD_SIZE, generateAlgebraicNotation, getCoordinatesFromSquare } from '../../utils/chessUtils'
import type { Board, ChessPiece, Move } from '../../types/chess'

const emptyBoard = (): Board => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))

describe('generateAlgebraicNotation - promotion and en passant', () => {
  it('generates default promotion to queen when no promotion piece specified', () => {
    const board = emptyBoard()
    const from = 'e7'
    const to = 'e8'
    const [fr, fc] = getCoordinatesFromSquare(from)
    const pawn: ChessPiece = { type: 'pawn', color: 'white', hasMoved: true }
    board[fr][fc] = pawn

    const move: Move = {
      piece: pawn,
      from,
      to,
      captured: undefined,
      prevHasMoved: false,
      prevCastlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } },
      notation: '',
      timestamp: new Date()
    }
    const san = generateAlgebraicNotation(board, move, 'active')
    expect(san).toBe('e8=Q')
  })

  it('generates explicit promotion piece when provided', () => {
    const board = emptyBoard()
    const from = 'e7'
    const to = 'e8'
    const [fr, fc] = getCoordinatesFromSquare(from)
    const pawn: ChessPiece = { type: 'pawn', color: 'white', hasMoved: true }
    board[fr][fc] = pawn

    const move: Move = {
      piece: pawn,
      from,
      to,
      captured: undefined,
      prevHasMoved: false,
      prevCastlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } },
      promotion: 'rook',
      notation: '',
      timestamp: new Date()
    }
    const san = generateAlgebraicNotation(board, move, 'active')
    expect(san).toBe('e8=R')
  })

  it('marks en passant captures with e.p.', () => {
    const board = emptyBoard()
    const from = 'e5'
    const to = 'd6'
    const [fr, fc] = getCoordinatesFromSquare(from)
    const pawn: ChessPiece = { type: 'pawn', color: 'white', hasMoved: true }
    board[fr][fc] = pawn

    const capturedPawn: ChessPiece = { type: 'pawn', color: 'black', hasMoved: true }
    const move: Move = {
      piece: pawn,
      from,
      to,
      captured: capturedPawn,
      prevHasMoved: false,
      prevCastlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } },
      isEnPassant: true,
      enPassantCaptureSquare: 'd5',
      notation: '',
      timestamp: new Date()
    }
    const san = generateAlgebraicNotation(board, move, 'active')
    expect(san).toBe('exd6 e.p.')
  })
})
