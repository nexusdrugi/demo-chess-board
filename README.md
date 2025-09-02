# Chess Game

A fully functional chess game built with React, TypeScript, and Tailwind CSS. Features a complete chess implementation with proper piece movement validation, drag-and-drop functionality, and an intuitive user interface.

## Features

- **Complete Chess Implementation**: All standard chess pieces with proper movement rules
- **Drag & Drop Interface**: Intuitive piece movement using mouse drag and drop
- **Move Validation**: Comprehensive validation for all piece types, with illegal moves filtered so your king is never left in check:
  - Pawn moves
  - Rook, Bishop, Queen linear movements
  - Knight L-shaped moves
  - King single-square moves
  - Castling moves (king-side and queen-side)
- **Endgame Detection**:
  - Automatic detection of checkmate and stalemate
  - "Check!" warning while the game is active
- **Move Notation**: Move history uses Standard Algebraic Notation (SAN) with disambiguation, captures, castling, and check/checkmate indicators
- **Visual Feedback**: 
  - Highlighted selected pieces
  - Valid move indicators
  - Chess board with alternating square colors
- **Game Controls**:
  - Prominent Reset button with confirmation dialog
  - Undo move support (even after game end)
  - Redo move support to restore previously undone moves
- **Game State Management**: Turn-based gameplay with proper state tracking
- **Responsive Design**: Clean, modern UI that works on different screen sizes

## Technology Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd demo-chess-board
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage (text, lcov, html reports in coverage/)

## Testing and Coverage

- Run tests: `npm test`
- Coverage: `npm run test:coverage`
- Reports: generated under `coverage/` (text summary in terminal; HTML report at `coverage/index.html`)
- Thresholds: statements ≥ 80%, lines ≥ 80%, functions ≥ 80%, branches ≥ 70% (enforced via vitest.config.ts)

## Project Structure

```
src/
├── components/          # React components
│   ├── ChessBoard.tsx   # Main chess board component
│   ├── ChessSquare.tsx  # Individual square component
│   ├── ChessPiece.tsx   # Chess piece component
│   └── GameControls.tsx # Game control buttons
├── hooks/               # Custom React hooks
│   └── useChessGame.ts  # Main game logic hook
├── utils/               # Utility functions
│   ├── chessUtils.ts    # Chess helper functions
│   └── moveValidation.ts # Move validation logic
├── types/               # TypeScript type definitions
│   └── chess.ts         # Chess-related types
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## How to Play

1. **Select a Piece**: Click on any of your pieces (white pieces move first)
2. **Move the Piece**: 
   - **Click Method**: Click on a valid destination square
   - **Drag & Drop**: Drag the piece to a valid destination square
3. **Valid Moves**: Valid destination squares are highlighted when a piece is selected
4. **Castling**: 
   - **King-side Castling**: Move the king two squares toward the rook on the king's side
   - **Queen-side Castling**: Move the king two squares toward the rook on the queen's side
   - **Requirements**: King and rook must not have moved, no pieces between them, king not in check, and king doesn't move through or into check
5. **Turn System**: Players alternate turns (white moves first)
6. **Game Controls**: Use the "Reset Game" button to restart (you'll be asked to confirm); use "Undo Move" to revert the last move; use "Redo Move" to restore a previously undone move.

## Game Rules Implemented

- Standard chess piece movements
- Turn-based gameplay
- Move validation that prevents leaving your king in check
- Check alert while active and automatic endgame detection (checkmate, stalemate)
- Piece capture mechanics
- Castling moves (king-side and queen-side)
- En passant capture (with SAN "e.p." notation)
- Visual feedback for valid moves

## Future Enhancements

Potential features that could be added:
- Pawn promotion
- Enhanced game notation and export
- AI opponent
- Online multiplayer

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).