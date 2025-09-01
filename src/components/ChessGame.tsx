import React from 'react'
import ChessBoard from './ChessBoard'
import GameControls from './GameControls'
import { useChessGame } from '../hooks/useChessGame'

const ChessGame: React.FC = () => {
  const {
    gameState,
    handleSquareClick,
    handlePieceDrop,
    resetGame,
    undoMove,
    redoMove
  } = useChessGame()

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
      <div className="flex-shrink-0">
        <ChessBoard
          gameState={gameState}
          onSquareClick={handleSquareClick}
          onPieceDrop={handlePieceDrop}
        />
      </div>
      <div className="w-full lg:w-80">
        <GameControls
          gameState={gameState}
          onResetGame={resetGame}
          onUndoMove={undoMove}
          onRedoMove={redoMove}
        />
      </div>
    </div>
  )
}

export default ChessGame