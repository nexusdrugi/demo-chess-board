# Changelog

All notable changes to this project will be documented in this file.

## 2025-09-01

### Added
- Comprehensive drag-and-drop input validation.
  - components/ChessPiece.tsx: validate and sanitize square on dragstart; prevent invalid drags; try/catch and error logging.
  - components/ChessSquare.tsx: validate drag data (isValidDragData) and both squares (isValidSquare) on drop; prevent same-square drops; try/catch with error logging.
- Error boundary for graceful error handling.
  - components/ErrorBoundary.tsx: reusable error boundary with fallback UI and Reset button; logs errors via componentDidCatch.
  - components/ChessBoard.tsx: wrap board grid and file labels with ErrorBoundary.

### Changed
- Extracted magic number 8 to a constant and used it across utilities and move validation.
  - utils/chessUtils.ts: introduced BOARD_SIZE = 8; replaced hardcoded values in coordinate conversion, board setup, and validation; added helpers isValidDragData and sanitizeSquareInput.
  - utils/moveValidation.ts: use BOARD_SIZE for rook and bishop range loops instead of hardcoded 8.
  - hooks/useChessGame.ts: use BOARD_SIZE in MAKE_MOVE/UNDO_MOVE coordinate conversions; enhanced handlePieceDrop validation (format checks and from !== to) with error logging.

