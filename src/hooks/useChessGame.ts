import { useReducer, useCallback } from 'react'
import { GameState, GameAction, Square, PieceColor, CastlingRights, Move } from '../types/chess'
import { createInitialBoard, getPieceAtSquare, isValidSquare, BOARD_SIZE, createInitialCastlingRights, updateCastlingRightsForMove, generateAlgebraicNotation, getCoordinatesFromSquare } from '../utils/chessUtils'
import { getValidMoves, isKingInCheck, isCheckmate, isStalemate, isEnPassantMove } from '../utils/moveValidation'

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
  enPassantTarget: null
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
        const isKingSide = toCol > fromCol
        const rookFromCol = isKingSide ? 7 : 0 // h-file or a-file
        const rookToCol = isKingSide ? 5 : 3   // f-file or d-file
        
        const rook = newBoard[fromRow][rookFromCol]
        if (rook) {
          newBoard[fromRow][rookToCol] = { ...rook, hasMoved: true }
          newBoard[fromRow][rookFromCol] = null
        }
      }
      
      // Determine new en passant target
      let newEnPassantTarget: Square | null = null
      if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
        // Pawn moved two squares, set en passant target
        const enPassantRow = (fromRow + toRow) / 2
        newEnPassantTarget = `${String.fromCharCode('a'.charCodeAt(0) + fromCol)}${BOARD_SIZE - enPassantRow}` as Square
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
      const opponentInCheck = isKingInCheck(newBoard, opponent)

      // Determine game status for the player to move (opponent)
      const baseStatus = isCheckmate(newBoard, opponent)
        ? 'checkmate'
        : isStalemate(newBoard, opponent)
          ? 'stalemate'
          : 'active'
      const finalStatus = baseStatus !== 'active' ? baseStatus : (opponentInCheck ? 'check' : 'active')

      // Create move record capturing previous states for undo with proper algebraic notation
      const move: Move = {
        from,
        to,
        piece,
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
      
      // Handle en passant redo
      if (moveToRedo.isEnPassant && moveToRedo.enPassantCaptureSquare) {
        // Remove the captured pawn from its original position
        const [captureRow, captureCol] = getCoordinatesFromSquare(moveToRedo.enPassantCaptureSquare)
        newBoard[captureRow][captureCol] = null
      }
      
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
      
      // Determine en passant target for the redone move
      let redoEnPassantTarget: Square | null = null
      if (moveToRedo.piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
        const enPassantRow = (fromRow + toRow) / 2
        redoEnPassantTarget = `${String.fromCharCode('a'.charCodeAt(0) + fromCol)}${BOARD_SIZE - enPassantRow}` as Square
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
  
  return {
    gameState,
    handleSquareClick,
    handlePieceDrop,
    resetGame,
    undoMove,
    redoMove
  }
}