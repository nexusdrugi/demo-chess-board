# Changelog

All notable changes to this project will be documented in this file.

## 2025-09-01 - Documentation Update for Recent Features

### Documentation
- Updated all documentation to reflect recently implemented features:
  - **Technical Architecture Document**:
    - Added Section 12: Endgame Detection with checkmate/stalemate functions
    - Added Section 13: Standard Algebraic Notation (SAN) System
    - Added Section 14: User Experience Enhancements (confirmation dialogs)
    - Updated component hierarchy to include ConfirmationDialog and UI types
    - Added getPawnAttacks() to check detection section
  - **Requirements Document**:
    - Added Section 10: Endgame Detection Requirements (all implemented ✅)
    - Added Section 11: Move Notation Requirements (SAN implementation ✅)
    - Added Section 12: User Confirmation Requirements (reset dialog ✅)
    - Updated status display to reflect checkmate/stalemate/check indicators
    - Updated move history to mention Standard Algebraic Notation
  - **WARP.md**:
    - Added endgame detection functions to move validation section
    - Added generateAlgebraicNotation() to utils documentation
    - Added ConfirmationDialog component to app composition
    - Updated GameControls description to include SAN notation and endgame status

## 2025-09-01 - Confirmation Dialog UX & SSR Improvements

### Changed
- Remove global Enter-to-confirm; rely on focused button to avoid accidental or double confirmation.
- Store dialog handlers in refs; main effect depends only on `isOpen` to prevent re-subscribe and focus flicker.
- SSR-safe portal mount via `mounted` guard; return `null` on server or before mount.
- Exit animation for smooth fade-out/scale, with delayed unmount to allow transition.

### Chore
- Move `ConfirmationDialogProps` from chess domain types to `src/types/ui.ts`.

## 2025-09-01 - Reset Confirmation & SAN Notation

### Added
- Reusable, accessible ConfirmationDialog component and integration into GameControls. Reset now shows a confirmation dialog before clearing the game.
- Standard Algebraic Notation (SAN) in move history with disambiguation, captures, castling, and check/checkmate indicators.
- SAN generator support for future promotions and en passant formatting.

### Changed
- Pawn attack detection uses diagonal-only attack generator for accurate check detection.
- Game status now sets 'check' when applicable (not just active/checkmate/stalemate).
- Undo is allowed after game end to let users step back from checkmate/stalemate positions.

### Documentation
- Updated README.md with SAN move history and reset confirmation dialog details.

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

## 2025-01-22 - Castling Implementation

### Added
- Full castling functionality for both king-side and queen-side castling
- Castling move validation in `getKingMoves` function with comprehensive checks:
  - Castling rights verification (king and rook haven't moved)
  - Path clearance validation (no pieces between king and rook)
  - Safety validation (king not in check, doesn't move through check, doesn't end in check)
- Castling move execution in game reducer:
  - Automatic rook movement when king castles
  - Proper castling rights updates
  - Undo support for castling moves (restores both king and rook positions)
- Standard Algebraic Notation support for castling (O-O for king-side, O-O-O for queen-side)

### Changed
- Updated `getKingMoves` function to accept `castlingRights` parameter
- Enhanced `getValidMoves` function to pass castling rights to king move validation
- Modified game reducer to handle castling move execution and undo operations

### Documentation
- Updated README.md to include castling in implemented features and game rules
- Added castling instructions to "How to Play" section
- Removed castling from "Future Enhancements" list

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

