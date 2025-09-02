# SOLID-DRY Refactoring Guide for demo-chess-board

Purpose
- Improve adherence to SOLID and DRY without changing observable behavior, UI, accessibility, or test outcomes.
- Keep architecture simple and idiomatic for React + TypeScript. Prefer composition over inheritance.
- Maintain or increase test coverage (statements ≥ 80%, functions ≥ 80%, lines ≥ 80%, branches ≥ 70%).

Key references (current repo)
- State logic: src/hooks/useChessGame.ts
- Rules and helpers: src/utils/moveValidation.ts, src/utils/chessUtils.ts
- Types: src/types/chess.ts, src/types/ui.ts
- UI: src/components/*
- Tests: src/**/__tests__/*

Guiding principles (tailored)
- SRP (Single Responsibility):
  - moveValidation: move generation, check, endgame detection
  - chessUtils: board primitives, coordinates, notation, castling rights, small immutable helpers
  - useChessGame: orchestrates state transitions (dispatch), delegates rules and board math to utils
  - Components: render/interaction only
- OCP (Open/Closed):
  - Centralize rules in moveValidation and small utils so new rule refinements rarely touch UI or reducer flows.
- ISP (Interface Segregation):
  - Keep narrow utility functions and typed params/returns for testability.
- DIP (Dependency Inversion):
  - useChessGame depends on abstractions (pure helpers) rather than baking rules inline.
- DRY:
  - Extract common algorithms once (sliding pieces, status computation, castling rook motion, en passant target). Reuse everywhere.

Refactor plan (incremental, test-driven)
1) Extract slidingMoves for rook/bishop/queen
   Why: The three functions share 95% logic. Consolidating reduces duplication and risk of divergence.
   Changes (src/utils/moveValidation.ts):
   - Add helper:
     ```ts
     export const slidingMoves = (
       board: Board,
       square: Square,
       color: PieceColor,
       directions: Array<[number, number]>
     ): Square[] => {
       const out: Square[] = []
       const [row, col] = getCoordinatesFromSquare(square)
       for (const [dRow, dCol] of directions) {
         for (let i = 1; i < BOARD_SIZE; i++) {
           const s = getSquareFromCoordinates(row + i * dRow, col + i * dCol)
           if (!isValidSquare(s)) break
           if (isEmptySquare(board, s)) {
             out.push(s)
             continue
           }
           if (isOpponentPiece(board, s, color)) out.push(s)
           break
         }
       }
       return out
     }
     ```
   - Refactor generators:
     ```ts
     export const getRookMoves = (board: Board, square: Square, color: PieceColor): Square[] =>
       slidingMoves(board, square, color, [[0,1],[0,-1],[1,0],[-1,0]])

     export const getBishopMoves = (board: Board, square: Square, color: PieceColor): Square[] =>
       slidingMoves(board, square, color, [[1,1],[1,-1],[-1,1],[-1,-1]])

     export const getQueenMoves = (board: Board, square: Square, color: PieceColor): Square[] =>
       slidingMoves(board, square, color, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]])
     ```
   Tests:
   - Reuse existing tests (should pass unchanged). Optionally add a parametric test to assert equivalence with old logic on random positions.

2) Centralize game status computation
   Why: MAKE_MOVE, COMPLETE_PROMOTION, UNDO_MOVE, REDO_MOVE all re-implement the same “active/check/checkmate/stalemate” logic.
   Changes (src/utils/moveValidation.ts):
   - Add helper:
     ```ts
     import type { GameStatus } from '../types/chess'

     export const computeGameStatus = (
       board: Board,
       nextToMove: PieceColor,
       castlingRights?: CastlingRights,
       enPassantTarget?: Square | null
     ): GameStatus => {
       const inCheck = isKingInCheck(board, nextToMove)
       const base = isCheckmate(board, nextToMove, castlingRights, enPassantTarget)
         ? 'checkmate'
         : isStalemate(board, nextToMove, castlingRights, enPassantTarget)
           ? 'stalemate'
           : 'active'
       return base !== 'active' ? base : (inCheck ? 'check' : 'active')
     }
     ```
   - Update src/hooks/useChessGame.ts to call computeGameStatus in the four cases mentioned.
   Tests:
   - Add targeted unit tests in utils/__tests__/moveValidation.test.ts for computeGameStatus over representative board states.

3) Deduplicate castling rook motion
   Why: Rook motion during castling is implemented in MAKE_MOVE/REDO_MOVE and undone in UNDO_MOVE.
   Changes (src/utils/chessUtils.ts):
   - Add helpers:
     ```ts
     export const applyCastlingRookMove = (board: Board, row: number, kingFromCol: number, kingToCol: number): void => {
       const isKingSide = kingToCol > kingFromCol
       const rookFromCol = isKingSide ? 7 : 0
       const rookToCol = isKingSide ? 5 : 3
       const rook = board[row][rookFromCol]
       if (rook) {
         board[row][rookToCol] = { ...rook, hasMoved: true }
         board[row][rookFromCol] = null
       }
     }

     export const undoCastlingRookMove = (board: Board, row: number, kingFromCol: number, kingToCol: number): void => {
       const isKingSide = kingToCol > kingFromCol
       const rookFromCol = isKingSide ? 7 : 0
       const rookToCol = isKingSide ? 5 : 3
       const rook = board[row][rookToCol]
       if (rook) {
         board[row][rookFromCol] = { ...rook, hasMoved: false }
         board[row][rookToCol] = null
       }
     }
     ```
   - Replace inline rook moves in useChessGame.ts with these helpers.
   Tests:
   - Add tests in utils/__tests__/chessUtils.test.ts to verify rook positions and hasMoved flags after apply/undo for both sides/colors.

4) Centralize en passant target computation
   Why: The same computation appears in MAKE_MOVE and REDO_MOVE.
   Changes (src/utils/chessUtils.ts):
   - Add helper:
     ```ts
     export const computeEnPassantTarget = (fromRow: number, toRow: number, fromCol: number): Square | null => {
       if (Math.abs(toRow - fromRow) !== 2) return null
       const enPassantRow = (fromRow + toRow) / 2
       return `${String.fromCharCode('a'.charCodeAt(0) + fromCol)}${BOARD_SIZE - enPassantRow}` as Square
     }
     ```
   - Use it in MAKE_MOVE and REDO_MOVE when updating enPassantTarget.
   Tests:
   - Add tests in utils/__tests__/chessUtils.test.ts for white and black double-steps from starting ranks.

5) Optionally standardize Move record construction (SRP/DRY)
   Why: Construction of the Move object repeats the same boilerplate.
   Changes (src/utils/chessUtils.ts):
   - Add helper:
     ```ts
     export const buildMoveRecord = (args: {
       from: Square
       to: Square
       piece: ChessPiece
       captured?: ChessPiece | null
       prevHasMoved: boolean
       prevCapturedHasMoved?: boolean
       prevCastlingRights: CastlingRights
       prevEnPassantTarget: Square | null
       isEnPassant?: boolean
       enPassantCaptureSquare?: Square
       promotion?: PieceType
     }): Move => {
       const {
         from, to, piece, captured,
         prevHasMoved, prevCapturedHasMoved,
         prevCastlingRights, prevEnPassantTarget,
         isEnPassant, enPassantCaptureSquare, promotion
       } = args
       return {
         from,
         to,
         piece,
         notation: '',
         timestamp: new Date(),
         captured: captured || undefined,
         prevHasMoved,
         prevCapturedHasMoved,
         prevCastlingRights,
         prevEnPassantTarget,
         isEnPassant,
         enPassantCaptureSquare,
         promotion,
       }
     }
     ```
   - Use in MAKE_MOVE and COMPLETE_PROMOTION to reduce boilerplate (keep generateAlgebraicNotation usage unchanged).
   Tests:
   - Small unit test to assert correct defaulting of optional fields.

6) Minor SRP/typing improvements (non-breaking)
   - Prefer early returns for guard clauses (already used). Keep consistent across reducers.
   - Narrow types via explicit imports (e.g., import PieceType where needed). Already good, just maintain.
   - Keep utils pure (no console.* in utils; logging belongs in UI/hook when needed).

Safety/compatibility notes
- All helpers are pure or mutate only the provided temp/new board instances (consistent with existing patterns in reducer). Do not mutate state directly.
- Keep generateAlgebraicNotation and existing tests as the source of truth for SAN output.
- Accessibility flows (keyboard/touch) must remain unchanged; refactor only utils and reducer body wiring.

Concrete edit checklist
- src/utils/moveValidation.ts
  - [ ] Add slidingMoves (section 1)
  - [ ] Add computeGameStatus (section 2)
  - [ ] Refactor getRookMoves/getBishopMoves/getQueenMoves to use slidingMoves
- src/utils/chessUtils.ts
  - [ ] Add applyCastlingRookMove, undoCastlingRookMove (section 3)
  - [ ] Add computeEnPassantTarget (section 4)
  - [ ] Add buildMoveRecord (section 5, optional)
- src/hooks/useChessGame.ts
  - [ ] Replace status computation with computeGameStatus in MAKE_MOVE, COMPLETE_PROMOTION, UNDO_MOVE, REDO_MOVE
  - [ ] Replace inline rook moves with applyCastlingRookMove/undoCastlingRookMove
  - [ ] Replace enPassant target math with computeEnPassantTarget
  - [ ] Optionally use buildMoveRecord to construct Move objects

Testing and verification
- Unit tests
  - [ ] Add tests for slidingMoves via existing piece generators (rook/bishop/queen should remain behaviorally identical)
  - [ ] Tests for computeGameStatus: active/check/checkmate/stalemate cases
  - [ ] Tests for castling rook helpers (apply/undo) on both colors and both sides
  - [ ] Tests for computeEnPassantTarget (white/black, correct mid square)
  - [ ] Tests for buildMoveRecord defaulting and field mapping
- Integration tests
  - [ ] Ensure existing useChessGame tests for castling, promotion, undo/redo, en passant still pass unchanged
  - [ ] Ensure UI tests (DnD, keyboard, a11y) pass unchanged
- Commands
  - [ ] npm ci || npm install
  - [ ] npm test
  - [ ] npm run test:coverage (ensure ≥ thresholds; user preference is to keep coverage reporting)
  - [ ] npm run lint

Acceptance criteria
- No changes to public behavior (UI state, SAN output, move legality, undo/redo semantics).
- All tests pass; coverage meets thresholds (statements ≥ 80%, functions ≥ 80%, lines ≥ 80%, branches ≥ 70%).
- Reducer code in useChessGame.ts is shorter and easier to read; duplication removed per items 1–4.
- Utils remain composable/pure; no new coupling introduced.

Suggested commit structure
- chore(utils): add slidingMoves and computeGameStatus; refactor rook/bishop/queen
- chore(utils): add castling rook helpers + en passant target computation
- refactor(hooks): use computeGameStatus + helpers; remove duplication
- test(utils): add coverage for new helpers

Task checklist (for tracking)
- [ ] Implement refactors in utils
- [ ] Update reducer to use new helpers
- [ ] Add/adjust tests and run coverage
- [ ] Verify UI and a11y tests
- [ ] Update TEST-IMPROVEMENTS.md with any coverage deltas and next test ideas (user rule)
- [ ] Commit changes

Notes
- Keep SOLID/DRY pragmatic: prefer simple, transparent helpers over over-abstracted layers.
- If future enhancements (timers, variants) are planned, consider introducing a lightweight GameRules service later; for now, the above is sufficient and aligned with the current architecture.

