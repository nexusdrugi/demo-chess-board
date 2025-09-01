import { useReducer, useCallback } from 'react'
import { GameState, GameAction, Square, PieceColor } from '../types/chess'
import { createInitialBoard, getPieceAtSquare, isValidSquare, BOARD_SIZE } from '../utils/chessUtils'
import { getValidMoves } from '../utils/moveValidation'

// Initial game state
const initialGameState: GameState = {
  board: createInitialBoard(),
  currentPlayer: 'white',
  moveHistory: [],
  gameStatus: 'active',
  selectedSquare: null,
  validMoves: [],
  isInCheck: false
}

// Game state reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SELECT_SQUARE': {
      const { square } = action
      const piece = getPieceAtSquare(state.board, square)
      
      // If clicking on empty square or opponent piece while having a selection, try to move
      if (state.selectedSquare && state.validMoves.includes(square)) {
        return gameReducer(state, { type: 'MAKE_MOVE', from: state.selectedSquare, to: square })
      }
      
      // If clicking on own piece, select it
      if (piece && piece.color === state.currentPlayer) {
        const validMoves = getValidMoves(state.board, square, piece)
        return {
          ...state,
          selectedSquare: square,
          validMoves
        }
      }
      
      // Otherwise, deselect
      return {
        ...state,
        selectedSquare: null,
        validMoves: []
      }
    }
    
    case 'MAKE_MOVE': {
      const { from, to } = action
      const piece = getPieceAtSquare(state.board, from)
      
      if (!piece || !state.validMoves.includes(to)) {
        return state
      }
      
      // Create new board with the move
      const newBoard = state.board.map(row => [...row])
      const [fromRow, fromCol] = [BOARD_SIZE - parseInt(from[1]), from.charCodeAt(0) - 'a'.charCodeAt(0)]
      const [toRow, toCol] = [BOARD_SIZE - parseInt(to[1]), to.charCodeAt(0) - 'a'.charCodeAt(0)]
      
      const capturedPiece = newBoard[toRow][toCol]
      newBoard[toRow][toCol] = { ...piece, hasMoved: true }
      newBoard[fromRow][fromCol] = null
      
      // Create move record
      const move = {
        from,
        to,
        piece,
        notation: `${piece.type}${to}`,
        timestamp: new Date(),
        captured: capturedPiece || undefined
      }
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
        moveHistory: [...state.moveHistory, move],
        selectedSquare: null,
        validMoves: [],
        isInCheck: false // TODO: Implement check detection
      }
    }
    
    case 'RESET_GAME':
      return initialGameState
    
    case 'UNDO_MOVE': {
      if (state.moveHistory.length === 0) return state
      
      const lastMove = state.moveHistory[state.moveHistory.length - 1]
      const newBoard = state.board.map(row => [...row])
      
      const [fromRow, fromCol] = [BOARD_SIZE - parseInt(lastMove.from[1]), lastMove.from.charCodeAt(0) - 'a'.charCodeAt(0)]
      const [toRow, toCol] = [BOARD_SIZE - parseInt(lastMove.to[1]), lastMove.to.charCodeAt(0) - 'a'.charCodeAt(0)]
      
      // Restore piece to original position
      newBoard[fromRow][fromCol] = { ...lastMove.piece, hasMoved: state.moveHistory.length > 1 }
      newBoard[toRow][toCol] = lastMove.captured || null
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
        moveHistory: state.moveHistory.slice(0, -1),
        selectedSquare: null,
        validMoves: [],
        isInCheck: false
      }
    }
    
    case 'SET_VALID_MOVES':
      return {
        ...state,
        validMoves: action.moves
      }
    
    case 'UPDATE_GAME_STATUS':
      return {
        ...state,
        gameStatus: action.status
      }
    
    default:
      return state
  }
}

// Custom hook for chess game logic
export const useChessGame = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState)
  
  const handleSquareClick = useCallback((square: Square) => {
    if (!isValidSquare(square)) return
    dispatch({ type: 'SELECT_SQUARE', square })
  }, [])
  
  const handlePieceDrop = useCallback((from: Square, to: Square) => {
    if (!isValidSquare(from) || !isValidSquare(to)) {
      console.error('Invalid move attempt: invalid square format', { from, to })
      return
    }
    if (from === to) {
      console.error('Invalid move attempt: source and destination squares are the same', { from, to })
      return
    }
    dispatch({ type: 'MAKE_MOVE', from, to })
  }, [])
  
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' })
  }, [])
  
  const undoMove = useCallback(() => {
    dispatch({ type: 'UNDO_MOVE' })
  }, [])
  
  return {
    gameState,
    handleSquareClick,
    handlePieceDrop,
    resetGame,
    undoMove
  }
}