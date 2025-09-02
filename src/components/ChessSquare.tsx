import React from 'react'
import ChessPieceComponent from './ChessPiece'
import { ChessPiece, Square } from '../types/chess'
import { isValidSquare, isValidDragData } from '../utils/chessUtils'

interface ChessSquareProps {
  square: Square
  piece: ChessPiece | null
  isSelected: boolean
  isValidMove: boolean
  squareColor: 'light' | 'dark'
  onSquareClick: (square: Square) => void
  onPieceDrop: (from: Square, to: Square) => void
  currentSelected: Square | null
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  square,
  piece,
  isSelected,
  isValidMove,
  squareColor,
  onSquareClick,
  onPieceDrop,
  currentSelected
}) => {
  const handleClick = () => {
    onSquareClick(square)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const data = e.dataTransfer.getData('text/plain')
      if (!isValidDragData(data)) {
        console.error('Invalid drag data:', data)
        return
      }
      const fromSquare = data as Square
      if (!isValidSquare(fromSquare) || !isValidSquare(square)) {
        console.error('Invalid square(s) in drop:', { fromSquare, toSquare: square })
        return
      }
      if (fromSquare === square) {
        // Prevent dropping onto the same square
        return
      }
      onPieceDrop(fromSquare, square)
    } catch (err) {
      console.error('Error handling drop event:', err)
    }
  }

  const handleDragStart = (dragSquare: Square) => {
    // Piece drag started - could trigger selection
    onSquareClick(dragSquare)
  }

  // Touch support: tap to select, tap destination to move
  const handleTouchStart = () => {
    onSquareClick(square)
  }

  const handleTouchEnd = () => {
    if (currentSelected && currentSelected !== square) {
      onPieceDrop(currentSelected as Square, square)
    }
  }

  const handleDragEnd = () => {
    // Drag end cleanup if needed
  }

  const baseClasses = 'chess-square'
  const colorClasses = squareColor === 'light' ? 'chess-square-light' : 'chess-square-dark'
  const selectedClasses = isSelected ? 'chess-square-selected' : ''
  const validMoveClasses = isValidMove ? 'chess-square-valid-move' : ''
  const hoverClasses = 'hover:brightness-110'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!currentSelected) {
        onSquareClick(square)
      } else if (currentSelected !== square) {
        onPieceDrop(currentSelected as Square, square)
      }
    }
    // Optional: support Escape to clear selection
    if (e.key === 'Escape' && isSelected) {
      // Reselecting same square will toggle state upstream if implemented; otherwise no-op
      onSquareClick(square)
    }
  }

  const pieceLabel = piece ? `${piece.color} ${piece.type}` : 'empty'
  const ariaLabel = `${square} ${pieceLabel}`

  return (
    <div
      className={`${baseClasses} ${colorClasses} ${selectedClasses} ${validMoveClasses} ${hoverClasses}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected || undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {piece && (
        <ChessPieceComponent
          piece={piece}
          square={square}
          isSelected={isSelected}
          isValidMove={isValidMove}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      )}
    </div>
  )
}

export default ChessSquare
