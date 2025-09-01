import { useReducer, useCallback } from 'react'
import { GameState, GameAction, Square, PieceColor, CastlingRights, Move } from '../types/chess'
import { createInitialBoard, getPieceAtSquare, isValidSquare, BOARD_SIZE, createInitialCastlingRights, updateCastlingRightsForMove, generateAlgebraicNotation } from '../utils/chessUtils'
import { getValidMoves, isKingInCheck, isCheckmate, isStalemate } from '../utils/moveValidation'

// Initial game state
const initialGameState: GameState = {
  board: createInitialBoard(),
  currentPlayer: 'white',
  moveHistory: [],
  redoHistory: [],
  gameStatus: 'active',
  selectedSquare: null,
  validMoves: [],
  isInCheck: false,
  castlingRights: createInitialCastlingRights()
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
        const validMoves = getValidMoves(state.board, square, piece, state.castlingRights)
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
      const movedPiecePrevHasMoved = piece.hasMoved
      const capturedPrevHasMoved = capturedPiece ? capturedPiece.hasMoved : undefined

      // Check if this is a castling move (king moves two squares horizontally)
      const isCastling = piece.type === 'king' && Math.abs(toCol - fromCol) === 2
      
      // Update board state
      newBoard[toRow][toCol] = { ...piece, hasMoved: true }
      newBoard[fromRow][fromCol] = null
      
      // Handle castling: move the rook as well
      if (isCastling) {
        const isKingSide = toCol > fromCol
        const rookFromCol = isKingSide ? 7 : 0 // h-file or a-file
        const rookToCol = isKingSide ? 5 : 3   // f-file or d-file
        
        const rook = newBoard[fromRow][rookFromCol]
        if (rook) {
          newBoard[fromRow][rookToCol] = { ...rook, hasMoved: true }
          newBoard[fromRow][rookFromCol] = null
        }
      }

      // Update castling rights based on this move (including captured rook handling)
      const nextCastlingRights = updateCastlingRightsForMove(
        state.castlingRights,
        piece,
        from,
        to,
        capturedPiece || undefined
      )
      
      const mover = state.currentPlayer
      const opponent = mover === 'white' ? 'black' : 'white'
      const opponentInCheck = isKingInCheck(newBoard, opponent)

      // Determine game status for the player to move (opponent)
      const baseStatus = isCheckmate(newBoard, opponent)
        ? 'checkmate'
        : isStalemate(newBoard, opponent)
          ? 'stalemate'
          : 'active'
      const finalStatus = baseStatus !== 'active' ? baseStatus : (opponentInCheck ? 'check' : 'active')

      // Create move record capturing previous states for undo with proper algebraic notation
      const notation = generateAlgebraicNotation(state.board, piece, from, to, capturedPiece, finalStatus)
      const move: Move = {
        from,
        to,
        piece,
        notation,
        timestamp: new Date(),
        captured: capturedPiece || undefined,
        prevHasMoved: movedPiecePrevHasMoved,
        prevCapturedHasMoved: capturedPrevHasMoved,
        prevCastlingRights: state.castlingRights
      }

      return {
        ...state,
        board: newBoard,
        currentPlayer: opponent,
        moveHistory: [...state.moveHistory, move],
        redoHistory: [], // Clear redo history when making a new move
        selectedSquare: null,
        validMoves: [],
        isInCheck: opponentInCheck,
        gameStatus: finalStatus,
        castlingRights: nextCastlingRights
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
      
      // Check if this was a castling move
      const wasCastling = lastMove.piece.type === 'king' && Math.abs(toCol - fromCol) === 2
      
      // Restore piece to original position with previous hasMoved state
      newBoard[fromRow][fromCol] = { ...lastMove.piece, hasMoved: lastMove.prevHasMoved }
      // Restore captured piece (if any) with its previous hasMoved state
      if (lastMove.captured) {
        newBoard[toRow][toCol] = { ...lastMove.captured, hasMoved: lastMove.prevCapturedHasMoved ?? lastMove.captured.hasMoved }
      } else {
        newBoard[toRow][toCol] = null
      }
      
      // Handle castling undo: restore the rook as well
      if (wasCastling) {
        const isKingSide = toCol > fromCol
        const rookFromCol = isKingSide ? 7 : 0 // h-file or a-file
        const rookToCol = isKingSide ? 5 : 3   // f-file or d-file
        
        const rook = newBoard[fromRow][rookToCol]
        if (rook) {
          // Restore rook to original position (it was also not moved before castling)
          newBoard[fromRow][rookFromCol] = { ...rook, hasMoved: false }
          newBoard[fromRow][rookToCol] = null
        }
      }
      
      const nextCurrent = state.currentPlayer === 'white' ? 'black' : 'white'
      const nextInCheck = isKingInCheck(newBoard, nextCurrent)
      const baseStatus = isCheckmate(newBoard, nextCurrent)
        ? 'checkmate'
        : isStalemate(newBoard, nextCurrent)
          ? 'stalemate'
          : 'active'
      const finalStatus = baseStatus !== 'active' ? baseStatus : (nextInCheck ? 'check' : 'active')

      return {
        ...state,
        board: newBoard,
        currentPlayer: nextCurrent,
        moveHistory: state.moveHistory.slice(0, -1),
        redoHistory: [...state.redoHistory, lastMove],
        selectedSquare: null,
        validMoves: [],
        isInCheck: nextInCheck,
        gameStatus: finalStatus,
        castlingRights: lastMove.prevCastlingRights
      }
    }
    
    case 'REDO_MOVE': {
      if (state.redoHistory.length === 0) return state
      
      const moveToRedo = state.redoHistory[state.redoHistory.length - 1]
      const newBoard = state.board.map(row => [...row])
      
      const [fromRow, fromCol] = [BOARD_SIZE - parseInt(moveToRedo.from[1]), moveToRedo.from.charCodeAt(0) - 'a'.charCodeAt(0)]
      const [toRow, toCol] = [BOARD_SIZE - parseInt(moveToRedo.to[1]), moveToRedo.to.charCodeAt(0) - 'a'.charCodeAt(0)]
      
      // Check if this is a castling move
      const isCastling = moveToRedo.piece.type === 'king' && Math.abs(toCol - fromCol) === 2
      
      // Apply the move
      newBoard[toRow][toCol] = { ...moveToRedo.piece, hasMoved: true }
      newBoard[fromRow][fromCol] = null
      
      // Handle castling: move the rook as well
      if (isCastling) {
        const isKingSide = toCol > fromCol
        const rookFromCol = isKingSide ? 7 : 0 // h-file or a-file
        const rookToCol = isKingSide ? 5 : 3   // f-file or d-file
        
        const rook = newBoard[fromRow][rookFromCol]
        if (rook) {
          newBoard[fromRow][rookToCol] = { ...rook, hasMoved: true }
          newBoard[fromRow][rookFromCol] = null
        }
      }
      
      const mover = state.currentPlayer
      const opponent = mover === 'white' ? 'black' : 'white'
      const opponentInCheck = isKingInCheck(newBoard, opponent)
      
      // Determine game status for the player to move (opponent)
      const baseStatus = isCheckmate(newBoard, opponent)
        ? 'checkmate'
        : isStalemate(newBoard, opponent)
          ? 'stalemate'
          : 'active'
      const finalStatus = baseStatus !== 'active' ? baseStatus : (opponentInCheck ? 'check' : 'active')
      
      // Update castling rights based on the redone move
      const nextCastlingRights = updateCastlingRightsForMove(
        state.castlingRights,
        moveToRedo.piece,
        moveToRedo.from,
        moveToRedo.to,
        moveToRedo.captured
      )
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: opponent,
        moveHistory: [...state.moveHistory, moveToRedo],
        redoHistory: state.redoHistory.slice(0, -1),
        selectedSquare: null,
        validMoves: [],
        isInCheck: opponentInCheck,
        gameStatus: finalStatus,
        castlingRights: nextCastlingRights
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
  
  const redoMove = useCallback(() => {
    dispatch({ type: 'REDO_MOVE' })
  }, [])
  
  return {
    gameState,
    handleSquareClick,
    handlePieceDrop,
    resetGame,
    undoMove,
    redoMove
  }
}