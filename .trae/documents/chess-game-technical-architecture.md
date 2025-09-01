# Modern Chess Game Web Client - Technical Architecture Document

## 1. Architecture design

```mermaid
graph TD
  A[User Browser] --> B[React Frontend Application]
  B --> C[Chess Game Logic]
  B --> D[UI Components]
  B --> E[State Management]

  subgraph "Frontend Layer"
    B
    C
    D
    E
  end

  subgraph "Browser APIs"
    F[Local Storage]
    G[Drag & Drop API]
  end

  B --> F
  B --> G
```

## 2. Technology Description

* Frontend: React\@18 + TypeScript\@5 + Vite\@5 + Tailwind CSS\@3

* State Management: React Context API + useReducer

* Chess Logic: Custom TypeScript implementation

* Styling: Tailwind CSS with custom chess board components

* Build Tool: Vite for fast development and optimized builds

## 3. Route definitions

| Route | Purpose                                      |
| ----- | -------------------------------------------- |
| /     | Main chess game page with board and controls |

## 4. API definitions

No backend APIs required for this demo application. All functionality is handled client-side.

## 5. Server architecture diagram

No server-side architecture required. This is a pure frontend application.

## 6. Data model

### 6.1 Data model definition

```mermaid
erDiagram
  GAME_STATE {
    string currentPlayer
    array board
    array moveHistory
    string gameStatus
    object selectedSquare
    array validMoves
  }
  
  PIECE {
    string type
    string color
    string position
    boolean hasMoved
  }
  
  MOVE {
    string from
    string to
    string piece
    string notation
    timestamp timestamp
  }
  
  GAME_STATE ||--o{ PIECE : contains
  GAME_STATE ||--o{ MOVE : tracks
```

### 6.2 Data Definition Language

TypeScript interfaces for the chess game data structures:

```typescript
// Core game types
type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';
type Square = string; // e.g., 'e4', 'a1'
type GameStatus = 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw';

// Piece interface
interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean;
}

// Castling rights interface
interface CastlingRights {
  white: { kingSide: boolean; queenSide: boolean };
  black: { kingSide: boolean; queenSide: boolean };
}

// Move interface
interface Move {
  from: Square;
  to: Square;
  piece: ChessPiece;
  notation: string;
  timestamp: Date;
  captured?: ChessPiece;
  // State tracking for proper undo functionality
  prevHasMoved: boolean;
  prevCapturedHasMoved?: boolean;
  prevCastlingRights: CastlingRights;
}

// Board state (8x8 array)
type Board = (ChessPiece | null)[][];

// Game state interface
interface GameState {
  board: Board;
  currentPlayer: PieceColor;
  moveHistory: Move[];
  redoHistory: Move[];  // Stack of moves that can be redone
  gameStatus: GameStatus;
  selectedSquare: Square | null;
  validMoves: Square[];
  isInCheck: boolean;
  castlingRights: CastlingRights;
}
}

// Component props interfaces
interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (square: Square) => void;
  onPieceDrop: (from: Square, to: Square) => void;
}

interface ChessPieceProps {
  piece: ChessPiece;
  square: Square;
  isSelected: boolean;
  isValidMove: boolean;
  onDragStart: (square: Square) => void;
  onDragEnd: (from: Square, to: Square) => void;
}

interface GameControlsProps {
  gameState: GameState;
  onResetGame: () => void;
  onUndoMove: () => void;
  onRedoMove: () => void;
}
}

// Chess logic utility types
interface MoveValidationResult {
  isValid: boolean;
  reason?: string;
  wouldBeInCheck?: boolean;
}

interface SquareInfo {
  file: string; // a-h
  rank: number; // 1-8
  color: 'light' | 'dark';
  coordinates: [number, number]; // [row, col] in array
}
```

### Component Architecture

```typescript
// Main application component structure
interface ComponentHierarchy {
  App: {
    ErrorBoundary: {  // Error boundary wrapper for graceful error handling
      ChessGame: {
        ChessBoard: {
          ChessSquare: {
            ChessPiece: {};
          };
        };
        GameControls: {
          MoveHistory: {};  // Displays moves in Standard Algebraic Notation
          GameStatus: {};   // Shows current player, check/checkmate/stalemate
          ActionButtons: {}; // Reset (with confirmation) and Undo buttons
          ConfirmationDialog: {}; // Modal for reset confirmation
        };
      };
    };
  };
}

// UI Component Types (from src/types/ui.ts)
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// State management actions
type GameAction = 
  | { type: 'SELECT_SQUARE'; square: Square }
  | { type: 'MAKE_MOVE'; from: Square; to: Square }
  | { type: 'RESET_GAME' }
  | { type: 'UNDO_MOVE' }
  | { type: 'REDO_MOVE' }
  | { type: 'SET_VALID_MOVES'; moves: Square[] }
  | { type: 'UPDATE_GAME_STATUS'; status: GameStatus };
```

## 10. Check Detection and Legal Move Filtering (Implemented)

- Move validation (utils/moveValidation.ts)
  - findKingPosition(board, color): locate the king square for a color.
  - isKingInCheck(board, color, kingSquare?): determines if a king is attacked by scanning opponent pseudo-legal moves.
  - getPawnAttacks(board, from, piece): special function for pawn diagonal attacks (used in check detection).
  - isMoveLegal(board, from, to, piece): simulates a move and returns false if it leaves own king in check.
  - getValidMoves(...) now filters out moves that would place own king in check.
  - getKingMoves(...) includes full castling validation with safety checks.
- Game reducer (hooks/useChessGame.ts)
  - After MAKE_MOVE: computes opponent check state via isKingInCheck(newBoard, opponent) and sets gameState.isInCheck.
  - After UNDO_MOVE: recomputes isInCheck for the next current player based on the restored board.
  - Handles castling move execution by moving both king and rook.
  - Supports castling move undo by restoring both pieces to original positions.
  - Sets gameStatus to 'check' when player is in check but game continues.

## 11. Testing Architecture

- Testing framework: Vitest with React Testing Library
- Test organization:
  - Unit tests located in `src/**/__tests__/` directories
  - Tests for hooks: `src/hooks/__tests__/useChessGame.test.ts`
  - Tests for utilities: `src/utils/__tests__/chessUtils.test.ts`
- Test commands:
  - `npm test` - Run test suite in watch mode
  - `npm run test:ui` - Open Vitest UI for interactive testing
- Coverage includes:
  - Chess utility functions (coordinate conversion, board initialization)
  - Game state reducer logic
  - Move validation and check detection
  - Castling rights management

## 12. Endgame Detection (Implemented)

- Checkmate and Stalemate Detection (utils/moveValidation.ts)
  - hasAnyLegalMoves(board, color): checks if a player has any legal moves by scanning all pieces
  - isCheckmate(board, color): returns true if player is in check AND has no legal moves
  - isStalemate(board, color): returns true if player is NOT in check but has no legal moves
- Game State Updates (hooks/useChessGame.ts)
  - After each move, automatically detects endgame conditions
  - Sets gameStatus to 'checkmate' when checkmate is detected
  - Sets gameStatus to 'stalemate' when stalemate is detected
  - Sets gameStatus to 'check' when king is in check but game continues
  - Sets gameStatus to 'active' for normal play
- UI Updates (components/GameControls.tsx)
  - Displays "Checkmate - [Winner] Wins!" with winner announcement
  - Displays "Stalemate - Draw!" for stalemate situations
  - Displays "Check!" warning when king is under attack
  - Undo remains enabled after game end to allow review of final position

## 13. Standard Algebraic Notation (SAN) System (Implemented)

- Move Notation Generation (utils/chessUtils.ts)
  - generateAlgebraicNotation(board, piece, from, to, captured, gameStatus): creates standard chess notation
  - Piece notation: K (King), Q (Queen), R (Rook), B (Bishop), N (Knight), pawns have no letter
  - Disambiguation: adds file (a-h) or rank (1-8) when multiple pieces can make the same move
  - Capture notation: uses 'x' for captures (e.g., "Bxe5", "exd4")
  - Check/Checkmate: appends '+' for check, '#' for checkmate
  - Special moves: "O-O" for kingside castling, "O-O-O" for queenside (when implemented)
  - Future support for promotion (e.g., "e8=Q") and en passant (e.g., "exd6 e.p.")
- Move History Display
  - All moves shown in standard chess notation in GameControls
  - Includes move numbers and from/to squares for clarity
  - Professional chess notation for better game analysis

## 14. Castling Implementation (Fully Implemented)

- Move Validation (utils/moveValidation.ts)
  - getKingMoves() accepts castlingRights parameter for castling validation
  - Validates all castling conditions:
    - King and rook haven't moved
    - Path between king and rook is clear
    - King is not in check
    - King doesn't move through or into check
  - Adds castling squares (g1/g8 for kingside, c1/c8 for queenside) to valid moves
- Move Execution (hooks/useChessGame.ts)
  - Detects castling moves (king moving 2 squares horizontally)
  - Automatically moves rook to correct position (f-file for kingside, d-file for queenside)
  - Updates castling rights after king or rook moves
- Undo/Redo Support
  - Properly restores both king and rook positions when undoing castling
  - Restores hasMoved flags for both pieces
  - Maintains castling rights history through moves
- Notation
  - Displays "O-O" for kingside castling
  - Displays "O-O-O" for queenside castling
  - Properly appends check/checkmate indicators

## 15. Undo/Redo System (Implemented)

- State Management
  - moveHistory: Array of completed moves
  - redoHistory: Stack of undone moves available for redo
  - Making a new move clears redoHistory
- Undo Operation (UNDO_MOVE action)
  - Removes last move from moveHistory
  - Restores board state to previous position
  - Handles special cases (castling, captures)
  - Adds undone move to redoHistory
  - Recalculates game status and check state
- Redo Operation (REDO_MOVE action)
  - Takes last move from redoHistory
  - Re-executes the move on the board
  - Restores move to moveHistory
  - Maintains all move metadata and notation
- UI Controls (GameControls.tsx)
  - Undo button disabled when moveHistory is empty
  - Redo button disabled when redoHistory is empty
  - Visual feedback with hover states and disabled states

## 16. User Experience Enhancements

- Confirmation Dialogs (components/ConfirmationDialog.tsx)
  - Reusable modal component for user confirmations
  - Used for reset game confirmation to prevent accidental resets
  - Accessible with keyboard navigation (Escape to cancel)
  - Focus management for better accessibility
  - Smooth animations with fade and scale effects
- Reset Confirmation Flow
  - Reset button opens confirmation dialog
  - User must explicitly confirm to reset the game
  - Prevents accidental loss of game progress
- SSR-Safe Implementation
  - Portal-based rendering for proper modal layering
  - Guards against server-side rendering issues
  - Graceful mounting/unmounting with animations

