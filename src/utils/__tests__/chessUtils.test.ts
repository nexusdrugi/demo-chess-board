import { describe, it, expect } from 'vitest'
import {
  createInitialCastlingRights,
  updateCastlingRightsForMove,
  isKingMove,
  isRookMove
} from '../chessUtils'

const makePiece = (type: 'king'|'queen'|'rook'|'bishop'|'knight'|'pawn', color: 'white'|'black') => ({ type, color, hasMoved: false })

describe('chessUtils - castling rights', () => {
  it('createInitialCastlingRights returns all true', () => {
    const rights = createInitialCastlingRights()
    expect(rights.white.kingSide).toBe(true)
    expect(rights.white.queenSide).toBe(true)
    expect(rights.black.kingSide).toBe(true)
    expect(rights.black.queenSide).toBe(true)
  })

  it('isKingMove and isRookMove helpers work', () => {
    expect(isKingMove(makePiece('king','white'))).toBe(true)
    expect(isKingMove(makePiece('queen','white'))).toBe(false)
    expect(isRookMove(makePiece('rook','black'))).toBe(true)
    expect(isRookMove(makePiece('bishop','black'))).toBe(false)
  })

  it('king move disables both castling sides for that color', () => {
    const rights = createInitialCastlingRights()
    const piece = makePiece('king', 'white')
    const next = updateCastlingRightsForMove(rights, piece, 'e1', 'e2')
    expect(next.white.kingSide).toBe(false)
    expect(next.white.queenSide).toBe(false)
    // Black unchanged
    expect(next.black.kingSide).toBe(true)
    expect(next.black.queenSide).toBe(true)
  })

  it('rook move from a1 disables white queen-side; from h1 disables king-side', () => {
    const rights = createInitialCastlingRights()
    const rook = makePiece('rook', 'white')
    const qSide = updateCastlingRightsForMove(rights, rook, 'a1', 'a2')
    expect(qSide.white.queenSide).toBe(false)
    expect(qSide.white.kingSide).toBe(true)

    const kSide = updateCastlingRightsForMove(rights, rook, 'h1', 'h2')
    expect(kSide.white.kingSide).toBe(false)
    expect(kSide.white.queenSide).toBe(true)
  })

  it('rook move from a8/h8 disables black sides appropriately', () => {
    const rights = createInitialCastlingRights()
    const rook = makePiece('rook', 'black')
    const qSide = updateCastlingRightsForMove(rights, rook, 'a8', 'a7')
    expect(qSide.black.queenSide).toBe(false)
    const kSide = updateCastlingRightsForMove(rights, rook, 'h8', 'h7')
    expect(kSide.black.kingSide).toBe(false)
  })

  it('capturing a rook on corner squares disables correct castling side', () => {
    const rights = createInitialCastlingRights()
    const whiteQueen = makePiece('queen', 'white')

    // Capture black rook on a8
    let next = updateCastlingRightsForMove(rights, whiteQueen, 'e4', 'a8', makePiece('rook','black'))
    expect(next.black.queenSide).toBe(false)

    // Capture black rook on h8
    next = updateCastlingRightsForMove(rights, whiteQueen, 'e4', 'h8', makePiece('rook','black'))
    expect(next.black.kingSide).toBe(false)

    // Capture white rook on a1
    next = updateCastlingRightsForMove(rights, whiteQueen, 'e4', 'a1', makePiece('rook','white'))
    expect(next.white.queenSide).toBe(false)

    // Capture white rook on h1
    next = updateCastlingRightsForMove(rights, whiteQueen, 'e4', 'h1', makePiece('rook','white'))
    expect(next.white.kingSide).toBe(false)
  })
})

