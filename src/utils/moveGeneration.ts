import {PieceData, Position} from '../components/Piece/PieceData';
import {BoardState} from '../reducers/board';
import {createPiecesListFromBoard} from './fen';
import {calculatePossibleMoves, getOppositeColor} from './pieceMovement';
import {Color, PieceType} from '../constants/piece';
import isEqual from 'lodash.isequal';

export interface Move {
    startingSquare: Position;
    targetSquare: Position;
    capture: PieceData | null;
    piece: PieceType;
}

// TODO: Make color optional
// Currently when the turn switches and we only generate the moves for the 'new' active color
// The check state does not update because the opponents possible moves are not updated
export const generatePseudoLegalMoves = (gameState: BoardState, color: Color): Array<Move> => {
    let pseudoLegalMoves: Array<Move> = [];

    if (!gameState.board) {
        throw new Error('No game state board passed to generateLegalMoves function');
    }

    const pieces = createPiecesListFromBoard(gameState.board);

    for (const piece of pieces[color]) {
        const movesForPiece = calculatePossibleMoves(piece, gameState.board, gameState.enPassant);
        pseudoLegalMoves = pseudoLegalMoves.concat(movesForPiece);
    }

    return pseudoLegalMoves;
};

export const generateLegalMoves = (gameState: BoardState, color: Color): Array<Move> => {
    const pseudoLegalMoves = generatePseudoLegalMoves(gameState, color);

    const legalMoves: Array<Move> = [];

    let updatedGameState = gameState;

    for (const move of pseudoLegalMoves) {
        // Play the move on the board
        updatedGameState = makeMove(updatedGameState, move);

        // Get all pieces from the board so we can find the kings position
        // If the piece currently moving is the king, take the target square of his move, otherwise look up the kings position in the list of pieces
        const pieces = createPiecesListFromBoard(updatedGameState.board);
        const kingPosition = move.piece === PieceType.KING ? move.targetSquare : pieces[color].find((piece) => piece.type === PieceType.KING)?.position;

        if (!kingPosition) {
            throw new Error('No king found while generating legal moves');
        }

        // Generate all possible opposing moves with the new game state
        // If none of the opposing moves can target our king, the move is legal
        // This prevents us making a move where we check ourself, and forces us to break a check
        const opposingMoves = generatePseudoLegalMoves(updatedGameState, getOppositeColor(color));
        if (!opposingMoves.some((opposingMove) => isEqual(opposingMove.targetSquare, kingPosition))) {
            legalMoves.push(move);
        }

        // Undo the move so we have a 'reset' board again
        updatedGameState = undoMove(gameState, move);
    }

    return legalMoves;
};

export const makeMove = (gameState: BoardState, move: Move): BoardState => {
    const board = gameState.board;
    const {startingSquare, targetSquare} = move;

    // Update our position on the board
    board[targetSquare.rank][targetSquare.file] = board[startingSquare.rank][startingSquare.file];
    board[startingSquare.rank][startingSquare.file] = null;

    return {
        ...gameState,
        board: board
    };
};

export const undoMove = (gameState: BoardState, move: Move): BoardState => {
    const board = gameState.board;
    const {startingSquare, targetSquare} = move;

    // Set our own piece back to it's starting position
    // If we captured a piece we put it back, otherwise move.capture contains null and will simply create an empty square
    board[startingSquare.rank][startingSquare.file] = board[targetSquare.rank][targetSquare.file];
    board[targetSquare.rank][targetSquare.file] = move.capture;

    return {
        ...gameState,
        board: board
    };
};
