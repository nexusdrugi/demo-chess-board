import React from 'react'
import ChessBoard from './ChessBoard'
import GameControls from './GameControls'
import { useChessGame } from '../hooks/useChessGame'

import PromotionDialog from './PromotionDialog'
import type { GameState } from '../types/chess'

interface ChessGameProps {
  initialState?: GameState
}

const ChessGame: React.FC<ChessGameProps> = ({ initialState }) => {
  const {
    gameState,
    handleSquareClick,
    handlePieceDrop,
    resetGame,
    undoMove,
    redoMove,
    completePromotion,
    cancelPromotion,
  } = useChessGame(initialState)

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

      {/* Promotion dialog */}
      <PromotionDialog
        isOpen={!!gameState.pendingPromotion}
        color={gameState.pendingPromotion?.color || 'white'}
        onSelect={(p) => completePromotion(p)}
        onCancel={cancelPromotion}
      />
    </div>
  )
}

export default ChessGame