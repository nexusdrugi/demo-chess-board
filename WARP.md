# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project commands

- Setup
  - npm install
  - Requires Node.js 16 or higher (per README)
- Development server
  - npm run dev
  - Vite server opens browser on http://localhost:3000 (see vite.config.ts)
- Build
  - npm run build
  - Runs TypeScript type-checker (tsc) then Vite build; output in dist with sourcemaps
- Preview production build
  - npm run preview
- Lint
  - npm run lint
  - ESLint runs on . with ts/tsx extensions and max-warnings=0
- Tests
  - Not configured in this repository (no test runner or scripts present)

## Architecture overview

- Stack and tooling
  - React 18 + TypeScript + Vite + Tailwind CSS
  - ESLint configured for TypeScript and react-refresh
  - Vite config: server.port = 3000, open = true; build outputs dist with sourcemaps
  - Tailwind config extends theme with chess-specific colors and fonts
- App composition (top-level flow)
  - src/main.tsx mounts <App />; App renders <ChessGame /> as the main container
  - ChessGame composes:
    - ChessBoard: renders the 8x8 board grid, rank/file labels, highlights selection and valid moves
    - GameControls: shows current player, status, move history; provides Reset and Undo actions
- State management and game logic
  - src/hooks/useChessGame.ts encapsulates all game state using useReducer
    - State: board (8×8), currentPlayer, moveHistory, gameStatus, selectedSquare, validMoves, isInCheck
    - Actions: SELECT_SQUARE, MAKE_MOVE, RESET_GAME, UNDO_MOVE, SET_VALID_MOVES, UPDATE_GAME_STATUS
    - Workflow: clicks or drops dispatch actions; reducer updates board and history, toggles player
  - src/types/chess.ts defines core types (PieceType, PieceColor, Square, Board, GameState, Move, props interfaces)
- Board representation and helpers
  - src/utils/chessUtils.ts
    - createInitialBoard(): sets up pieces and pawns with hasMoved = false
    - Square/coordinate conversions and occupancy checks (own/opponent/empty)
    - getPieceSymbol(): maps type/color to Unicode chess glyphs used by the UI
- Move validation (per piece)
  - src/utils/moveValidation.ts
    - getValidMoves(board, square, piece): delegates to piece-specific generators
    - Implements pawn (forward + diagonal captures), rook, knight, bishop, queen, king movement
    - Does not implement check detection, castling, or en passant (isInCheck currently a TODO)
- Interaction boundaries and DnD
  - ChessPiece sets dataTransfer with its square on dragstart; visual feedback via Tailwind classes
  - ChessSquare handles click selection and onDrop (from → to) and forwards to useChessGame handlers
  - ChessBoard computes square color and pulls piece data from gameState.board
- Styling
  - Tailwind utilities via src/index.css (@layer components) define chess-square and chess-piece classes
  - tailwind.config.js defines custom colors: chess-light, chess-dark, highlight-blue, valid-move

## Notes

- Package manager: npm (package-lock.json present)
- README.md includes quickstart (npm install, npm run dev/build/preview/lint) and feature overview

