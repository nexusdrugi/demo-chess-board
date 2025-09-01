# Chess Game

A fully functional chess game built with React, TypeScript, and Tailwind CSS. Features a complete chess implementation with proper piece movement validation, drag-and-drop functionality, and an intuitive user interface.

## Features

- **Complete Chess Implementation**: All standard chess pieces with proper movement rules
- **Drag & Drop Interface**: Intuitive piece movement using mouse drag and drop
- **Move Validation**: Comprehensive validation for all piece types including:
  - Pawn moves (including en passant)
  - Rook, Bishop, Queen linear movements
  - Knight L-shaped moves
  - King single-square moves
  - Castling support
- **Visual Feedback**: 
  - Highlighted selected pieces
  - Valid move indicators
  - Chess board with alternating square colors
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
4. **Turn System**: Players alternate turns (white moves first)
5. **Game Controls**: Use the "New Game" button to restart

## Game Rules Implemented

- Standard chess piece movements
- Turn-based gameplay
- Basic move validation
- Piece capture mechanics
- Visual feedback for valid moves

## Future Enhancements

Potential features that could be added:
- Check and checkmate detection
- En passant capture
- Castling
- Pawn promotion
- Game history and move notation
- AI opponent
- Online multiplayer

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).