# Changelog

All notable changes to this project will be documented in this file.

## 2025-09-01 - Endgame Detection

### Added
- Checkmate and stalemate detection via `isCheckmate`, `isStalemate`, and `hasAnyLegalMoves` (utils/moveValidation.ts).

### Changed
- hooks/useChessGame.ts now sets `gameStatus` automatically after each move and undo; `isInCheck` reflects the player to move.
- components/GameControls.tsx displays explicit endgame messages and a "Check!" warning while active; disables Undo after the game ends.

### Documentation
- Updated README.md to reflect endgame detection and control behavior.

## 2025-09-01 - Documentation Accuracy Update

### Documentation
- Fixed critical inaccuracies in project documentation to reflect actual implementation:
  - **WARP.md**: 
    - Corrected statement that tests are not configured (tests ARE configured with Vitest)
    - Updated move validation section to reflect that check detection IS fully implemented
    - Added documentation for castling rights management functions
    - Added ErrorBoundary component to interaction boundaries section
    - Added input validation utilities documentation
  - **Technical Architecture Document**:
    - Added missing `CastlingRights` interface to type definitions
    - Updated `Move` interface to include undo-related fields (`prevHasMoved`, `prevCapturedHasMoved`, `prevCastlingRights`)
    - Updated `GameState` interface to include `castlingRights` field
    - Added ErrorBoundary to component hierarchy
    - Added new Testing Architecture section documenting Vitest setup
    - Clarified that check detection is implemented (section 10)
  - **Requirements Document**:
    - Updated constraints section to clarify castling rights ARE tracked (but moves not implemented)
    - Added checkmarks to show check detection requirements are met
    - Added new Testing Requirements section

## 2025-09-01 - Previous Updates

### Added
- Comprehensive drag-and-drop input validation.
  - components/ChessPiece.tsx: validate and sanitize square on dragstart; prevent invalid drags; try/catch and error logging.
  - components/ChessSquare.tsx: validate drag data (isValidDragData) and both squares (isValidSquare) on drop; prevent same-square drops; try/catch with error logging.
- Error boundary for graceful error handling.
  - components/ErrorBoundary.tsx: reusable error boundary with fallback UI and Reset button; logs errors via componentDidCatch.
  - components/ChessBoard.tsx: wrap board grid and file labels with ErrorBoundary.
- Testing infrastructure and unit tests.
  - Added Vitest config and scripts; devDependencies include vitest, @vitest/ui, jsdom, and @testing-library/react.
  - src/hooks/__tests__/useChessGame.test.ts: tests for undo behavior, captures, rook/king moves affecting castling rights, captured rook effects, and restoration on undo.
  - src/utils/__tests__/chessUtils.test.ts: tests for castling rights helpers and updates, including captured rook scenarios.

### Changed
- Extracted magic number 8 to a constant and used it across utilities and move validation.
  - utils/chessUtils.ts: introduced BOARD_SIZE = 8; replaced hardcoded values in coordinate conversion, board setup, and validation; added helpers isValidDragData and sanitizeSquareInput.
  - utils/moveValidation.ts: use BOARD_SIZE for rook and bishop range loops instead of hardcoded 8.
  - hooks/useChessGame.ts: use BOARD_SIZE in MAKE_MOVE/UNDO_MOVE coordinate conversions; enhanced handlePieceDrop validation (format checks and from !== to) with error logging.
- Undo and castling rights handling.
  - types: extended Move to store prevHasMoved, prevCapturedHasMoved, and prevCastlingRights; GameState now tracks castlingRights.
  - utils/chessUtils.ts: added createInitialCastlingRights, isKingMove, isRookMove, and updateCastlingRightsForMove(rights, piece, from, to, captured?) to disable castling when king/rook moves or a rook is captured on a1/h1/a8/h8.
  - hooks/useChessGame.ts: fixed UNDO bug to restore hasMoved and captured piece state; records previous states in move history and updates/restores castling rights accordingly.
- Check detection and legal-move filtering.
  - utils/moveValidation.ts: added findKingPosition, isKingInCheck, and isMoveLegal; getValidMoves now filters out moves that leave own king in check.
  - hooks/useChessGame.ts: after MAKE_MOVE, sets isInCheck if opponent king is in check; after UNDO_MOVE, recomputes isInCheck for the next current player.

