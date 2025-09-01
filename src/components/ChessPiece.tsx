import React from 'react'
import { ChessPieceProps, Square } from '../types/chess'
import { getPieceSymbol, isValidSquare, sanitizeSquareInput } from '../utils/chessUtils'

const ChessPiece: React.FC<ChessPieceProps> = ({
  piece,
  square,
  isSelected,
  isValidMove,
  onDragStart,
  onDragEnd
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    try {
      const sanitized = sanitizeSquareInput(square)
      if (!sanitized || !isValidSquare(sanitized)) {
        console.error('Invalid square on drag start:', square)
        e.preventDefault()
        return
      }
      e.dataTransfer.setData('text/plain', sanitized)
      onDragStart(sanitized as Square)
    } catch (err) {
      console.error('Error during drag start:', err)
      e.preventDefault()
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    // The actual drop handling is done in ChessSquare's handleDrop
    // This is just to clean up any drag state if needed
  }

  const pieceSymbol = getPieceSymbol(piece.type, piece.color)
  const dragClasses = 'cursor-grab active:cursor-grabbing'
  const selectedClasses = isSelected ? 'scale-110' : ''

  return (
    <div
      className={`chess-piece ${dragClasses} ${selectedClasses}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {pieceSymbol}
    </div>
  )
}

export default ChessPiece
