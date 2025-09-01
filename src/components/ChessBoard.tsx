import React from 'react'
import ChessSquare from './ChessSquare'
import { ChessBoardProps } from '../types/chess'
import { getSquareColor, getSquareFromCoordinates } from '../utils/chessUtils'

const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  onSquareClick,
  onPieceDrop
}) => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1]

  return (
    <div className="inline-block bg-gray-800 p-4 rounded-lg shadow-2xl">
      {/* Rank labels (left side) */}
      <div className="flex">
        <div className="flex flex-col justify-center mr-2">
          {ranks.map(rank => (
            <div key={rank} className="h-16 flex items-center justify-center text-gray-300 font-semibold">
              {rank}
            </div>
          ))}
        </div>
        
        {/* Chess board */}
        <div>
          <div className="grid grid-cols-8 border-2 border-gray-700">
            {ranks.map(rank =>
              files.map(file => {
                const square = `${file}${rank}`
                const piece = gameState.board[8 - rank][files.indexOf(file)]
                const isSelected = gameState.selectedSquare === square
                const isValidMove = gameState.validMoves.includes(square)
                const squareColor = getSquareColor(file, rank)

                return (
                  <ChessSquare
                    key={square}
                    square={square}
                    piece={piece}
                    isSelected={isSelected}
                    isValidMove={isValidMove}
                    squareColor={squareColor}
                    onSquareClick={onSquareClick}
                    onPieceDrop={onPieceDrop}
                  />
                )
              })
            )}
          </div>
          
          {/* File labels (bottom) */}
          <div className="flex mt-2">
            {files.map(file => (
              <div key={file} className="w-16 text-center text-gray-300 font-semibold">
                {file}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChessBoard