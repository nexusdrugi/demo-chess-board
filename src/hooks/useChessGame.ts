import { useReducer, useCallback } from 'react'
import { GameState, GameAction, Square, Move, ChessPiece } from '../types/chess'
import { createInitialBoard, getPieceAtSquare, isValidSquare, BOARD_SIZE, createInitialCastlingRights, updateCastlingRightsForMove, generateAlgebraicNotation, getCoordinatesFromSquare, computeEnPassantTarget, applyCastlingRookMove, undoCastlingRookMove } from '../utils/chessUtils'
import { getValidMoves, isEnPassantMove, computeGameStatus } from '../utils/moveValidation'

// Initial game state
export const initialGameState: GameState = {
  board: createInitialBoard(),
  currentPlayer: 'white',
  moveHistory: [],
  redoHistory: [],
  gameStatus: 'active',
  selectedSquare: null,
  validMoves: [],
  isInCheck: false,
  castlingRights: createInitialCastlingRights(),
  enPassantTarget: null,
  pendingPromotion: null
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
        const validMoves = getValidMoves(state.board, square, piece.color, state.castlingRights, state.enPassantTarget)
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

      // Check for promotion candidate: pawn reaching back rank
      const toRank = parseInt(to[1])
      const willPromote = piece.type === 'pawn' && ((piece.color === 'white' && toRank === 8) || (piece.color === 'black' && toRank === 1))
      if (willPromote) {
        // Request promotion instead of finalizing the move now
        return {
          ...state,
          pendingPromotion: { from, to, color: piece.color },
          // Keep selection on from square for clarity
          selectedSquare: from,
        }
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
      
      // Check if this is an en passant move
      const isEnPassant = isEnPassantMove(state.board, from, to, state.enPassantTarget)
      let enPassantCaptureSquare: Square | undefined
      let enPassantCapturedPiece: ChessPiece | null = null
      
      // Handle en passant capture
      if (isEnPassant && state.enPassantTarget) {
        const [enPassantRow, enPassantCol] = getCoordinatesFromSquare(state.enPassantTarget)
        const captureRow = piece.color === 'white' ? enPassantRow + 1 : enPassantRow - 1
        enPassantCaptureSquare = `${String.fromCharCode('a'.charCodeAt(0) + enPassantCol)}${BOARD_SIZE - captureRow}` as Square
        enPassantCapturedPiece = newBoard[captureRow][enPassantCol]
        newBoard[captureRow][enPassantCol] = null // Remove the captured pawn
      }
      
      // Update board state
      newBoard[toRow][toCol] = { ...piece, hasMoved: true }
      newBoard[fromRow][fromCol] = null
      
// Handle castling: move the rook as well
      if (isCastling) {
        applyCastlingRookMove(newBoard, fromRow, fromCol, toCol)
      }
      
// Determine new en passant target
      let newEnPassantTarget: Square | null = null
      if (piece.type === 'pawn') {
        newEnPassantTarget = computeEnPassantTarget(fromRow, toRow, fromCol)
      }

      // Update castling rights based on this move (including captured rook handling)
      const nextCastlingRights = updateCastlingRightsForMove(
        state.castlingRights,
        piece,
        from,
        to,
        enPassantCapturedPiece || capturedPiece
      )
      
      const mover = state.currentPlayer
      const opponent = mover === 'white' ? 'black' : 'white'
      const finalStatus = computeGameStatus(newBoard, opponent, nextCastlingRights, newEnPassantTarget)
      const opponentInCheck = finalStatus === 'check' || finalStatus === 'checkmate'

      // Create move record capturing previous states for undo with proper algebraic notation
      const move: Move = {
        from,
        to,
        piece,
        notation: '',
        timestamp: new Date(),
        captured: enPassantCapturedPiece || capturedPiece || undefined,
        prevHasMoved: movedPiecePrevHasMoved,
        prevCapturedHasMoved: capturedPrevHasMoved,
        prevCastlingRights: state.castlingRights,
        isEnPassant: isEnPassant || undefined,
        enPassantCaptureSquare: enPassantCaptureSquare,
        prevEnPassantTarget: state.enPassantTarget
      }
      const notation = generateAlgebraicNotation(state.board, move, finalStatus)
      move.notation = notation

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
        castlingRights: nextCastlingRights,
        enPassantTarget: newEnPassantTarget
      }
    }
    
    case 'REQUEST_PROMOTION': {
      const { from, to, color } = action
      // Allow UI to request promotion explicitly (optional entrypoint)
      return {
        ...state,
        pendingPromotion: { from, to, color },
      }
    }

    case 'COMPLETE_PROMOTION': {
      const pp = state.pendingPromotion
      if (!pp) return state
      const promoPieceType = action.piece
      // Execute the move with promotion
      const newBoard = state.board.map(row => [...row])
      const [fromRow, fromCol] = [BOARD_SIZE - parseInt(pp.from[1]), pp.from.charCodeAt(0) - 'a'.charCodeAt(0)]
      const [toRow, toCol] = [BOARD_SIZE - parseInt(pp.to[1]), pp.to.charCodeAt(0) - 'a'.charCodeAt(0)]
      const piece = getPieceAtSquare(state.board, pp.from)
      if (!piece) return { ...state, pendingPromotion: null }

      const capturedPiece = newBoard[toRow][toCol]
      const movedPiecePrevHasMoved = piece.hasMoved
      const capturedPrevHasMoved = capturedPiece ? capturedPiece.hasMoved : undefined

      // Place promoted piece on destination
      newBoard[toRow][toCol] = { type: promoPieceType, color: piece.color, hasMoved: true }
      newBoard[fromRow][fromCol] = null

      // En passant target after promotion: none
      const nextCastlingRights = updateCastlingRightsForMove(
        state.castlingRights,
        { type: promoPieceType, color: piece.color, hasMoved: true },
        pp.from,
        pp.to,
        capturedPiece
      )

      const mover = state.currentPlayer
      const opponent = mover === 'white' ? 'black' : 'white'
      const opponentInCheck = computeGameStatus(newBoard, opponent, nextCastlingRights, state.enPassantTarget) === 'check' || computeGameStatus(newBoard, opponent, nextCastlingRights, state.enPassantTarget) === 'checkmate'
      const finalStatus = computeGameStatus(newBoard, opponent, nextCastlingRights, state.enPassantTarget)

      const move: Move = {
        from: pp.from,
        to: pp.to,
        piece,
        notation: '',
        timestamp: new Date(),
        captured: capturedPiece || undefined,
        prevHasMoved: movedPiecePrevHasMoved,
        prevCapturedHasMoved: capturedPrevHasMoved,
        prevCastlingRights: state.castlingRights,
        prevEnPassantTarget: state.enPassantTarget,
        promotion: promoPieceType
      }
      const notation = generateAlgebraicNotation(state.board, move, finalStatus)
      move.notation = notation

      return {
        ...state,
        board: newBoard,
        currentPlayer: opponent,
        moveHistory: [...state.moveHistory, move],
        redoHistory: [],
        selectedSquare: null,
        validMoves: [],
        isInCheck: opponentInCheck,
        gameStatus: finalStatus,
        castlingRights: nextCastlingRights,
        enPassantTarget: null,
        pendingPromotion: null,
      }
    }

    case 'CANCEL_PROMOTION': {
      return {
        ...state,
        pendingPromotion: null,
        // Clear any selection/valid moves to reduce confusion
        selectedSquare: null,
        validMoves: [],
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
      
      // Handle en passant undo
      if (lastMove.isEnPassant && lastMove.enPassantCaptureSquare && lastMove.captured) {
        // Clear the destination square
        newBoard[toRow][toCol] = null
        // Restore the captured pawn to its original position
        const [captureRow, captureCol] = getCoordinatesFromSquare(lastMove.enPassantCaptureSquare)
        newBoard[captureRow][captureCol] = { ...lastMove.captured, hasMoved: lastMove.prevCapturedHasMoved ?? lastMove.captured.hasMoved }
      } else {
        // Regular move undo: restore captured piece (if any) with its previous hasMoved state
        if (lastMove.captured) {
          newBoard[toRow][toCol] = { ...lastMove.captured, hasMoved: lastMove.prevCapturedHasMoved ?? lastMove.captured.hasMoved }
        } else {
          newBoard[toRow][toCol] = null
        }
      }
      
      // Handle castling undo: restore the rook as well
      if (wasCastling) {
        undoCastlingRookMove(newBoard, fromRow, fromCol, toCol)
      }
      
      const nextCurrent = state.currentPlayer === 'white' ? 'black' : 'white'
      const finalStatus = computeGameStatus(newBoard, nextCurrent, lastMove.prevCastlingRights, lastMove.prevEnPassantTarget || null)
      const nextInCheck = finalStatus === 'check' || finalStatus === 'checkmate'

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
        castlingRights: lastMove.prevCastlingRights,
        enPassantTarget: lastMove.prevEnPassantTarget || null
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

      // Handle promotion redo: replace piece type at destination
      if (moveToRedo.promotion) {
        newBoard[toRow][toCol] = { type: moveToRedo.promotion, color: moveToRedo.piece.color, hasMoved: true }
      }
      
      // Handle en passant redo
      if (moveToRedo.isEnPassant && moveToRedo.enPassantCaptureSquare) {
        // Remove the captured pawn from its original position
        const [captureRow, captureCol] = getCoordinatesFromSquare(moveToRedo.enPassantCaptureSquare)
        newBoard[captureRow][captureCol] = null
      }
      
      // Handle castling: move the rook as well
      if (isCastling) {
        applyCastlingRookMove(newBoard, fromRow, fromCol, toCol)
      }
      
      // Determine en passant target for the redone move
      let redoEnPassantTarget: Square | null = null
      if (moveToRedo.piece.type === 'pawn') {
        redoEnPassantTarget = computeEnPassantTarget(fromRow, toRow, fromCol)
      }
      
      const mover = state.currentPlayer
      const opponent = mover === 'white' ? 'black' : 'white'
      const finalStatus = computeGameStatus(newBoard, opponent, state.castlingRights, redoEnPassantTarget)
      const opponentInCheck = finalStatus === 'check' || finalStatus === 'checkmate'
      
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
        castlingRights: nextCastlingRights,
        enPassantTarget: redoEnPassantTarget
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
export const useChessGame = (initialState: GameState = initialGameState) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)
  
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

  const completePromotion = useCallback((piece: 'queen' | 'rook' | 'bishop' | 'knight') => {
    dispatch({ type: 'COMPLETE_PROMOTION', piece })
  }, [])

  const cancelPromotion = useCallback(() => {
    dispatch({ type: 'CANCEL_PROMOTION' })
  }, [])
  
  return {
    gameState,
    handleSquareClick,
    handlePieceDrop,
    resetGame,
    undoMove,
    redoMove,
    completePromotion,
    cancelPromotion,
  }
}
