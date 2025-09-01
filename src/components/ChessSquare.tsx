import React from 'react'
import ChessPieceComponent from './ChessPiece'
import { ChessPiece, Square } from '../types/chess'

interface ChessSquareProps {
  square: Square
  piece: ChessPiece | null
  isSelected: boolean
  isValidMove: boolean
  squareColor: 'light' | 'dark'
  onSquareClick: (square: Square) => void
  onPieceDrop: (from: Square, to: Square) => void
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  square,
  piece,
  isSelected,
  isValidMove,
  squareColor,
  onSquareClick,
  onPieceDrop
}) => {
  const handleClick = () => {
    onSquareClick(square)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const fromSquare = e.dataTransfer.getData('text/plain')
    if (fromSquare && fromSquare !== square) {
      onPieceDrop(fromSquare, square)
    }
  }

  const handleDragStart = (dragSquare: Square) => {
    // Piece drag started - could trigger selection
    onSquareClick(dragSquare)
  }

  const handleDragEnd = () => {
    // Drag end cleanup if needed
  }

  const baseClasses = 'chess-square'
  const colorClasses = squareColor === 'light' ? 'chess-square-light' : 'chess-square-dark'
  const selectedClasses = isSelected ? 'chess-square-selected' : ''
  const validMoveClasses = isValidMove ? 'chess-square-valid-move' : ''
  const hoverClasses = 'hover:brightness-110'

  return (
    <div
      className={`${baseClasses} ${colorClasses} ${selectedClasses} ${validMoveClasses} ${hoverClasses}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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