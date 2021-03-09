import {PieceData, Position} from '../components/Piece/PieceData';
import {createPiecesListFromBoard} from './fen';
import {calculatePossibleMoves} from './pieceMovement';
import {Color, PieceType} from '../constants/piece';
import isEqual from 'lodash.isequal';
import {getOppositeColor} from './conversions';
import {BoardState} from '../reducers/board/types';

export interface Move {
    startingSquare: Position;
    targetSquare: Position;
    capture: PieceData | null;
    piece: PieceType;
}

// TODO: Make color optional
// Currently when the turn switches and we only generate the moves for the 'new' active color
// The check state does not update because the opponents possible moves are not updated
export const generatePseudoLegalMoves = (pieces: Array<PieceData>, gameState: BoardState): Array<Move> => {
    let pseudoLegalMoves: Array<Move> = [];

    if (!gameState.board) {
        throw new Error('No game state board passed to generateLegalMoves function');
    }

    for (const piece of pieces) {
        const movesForPiece = calculatePossibleMoves(piece, gameState.board, gameState.enPassant);
        pseudoLegalMoves = pseudoLegalMoves.concat(movesForPiece);
    }

    return pseudoLegalMoves;
};

export const generateLegalMoves = (gameState: BoardState, color: Color): Array<Move> => {
    const pieces = createPiecesListFromBoard(gameState.board);
    const pseudoLegalMoves = generatePseudoLegalMoves(pieces[color], gameState);

    const legalMoves: Array<Move> = [];

    let updatedGameState = gameState;

    const king = pieces[color].find((piece) => piece.type === PieceType.KING);
    for (const move of pseudoLegalMoves) {
        // Play the move on the board
        updatedGameState = makeMove(updatedGameState, move);

        // Get all pieces from the board so we can find the kings position
        // If the piece currently moving is the king, take the target square of his move, otherwise look up the kings position in the list of pieces
        const kingPosition = move.piece === PieceType.KING ? move.targetSquare : king?.position;

        if (!kingPosition) {
            throw new Error('No king found while generating legal moves');
        }

        // Filter out the captured piece from the list of opposing pieces
        // Otherwise capturing the piece that targets the king is considered invalid
        // because the piece will still be in the list, and the engine will consider it as if it is still targeting the king
        const opposingPieces = pieces[getOppositeColor(color)].filter((opposingPiece) => !isEqual(opposingPiece.position, move.targetSquare));

        // Generate all possible opposing moves with the new game state
        // If none of the opposing moves can target our king, the move is legal
        // This prevents us making a move where we check ourself, and forces us to break a check
        const opposingMoves = generatePseudoLegalMoves(opposingPieces, updatedGameState);
        if (!opposingMoves.some((opposingMove) => isEqual(opposingMove.targetSquare, kingPosition))) {
            legalMoves.push(move);
        }

        // Undo the move so we have a 'reset' board again
        updatedGameState = undoMove(updatedGameState, move);
    }

    return legalMoves;
};

export const makeMove = (gameState: BoardState, move: Move): BoardState => {
    const board = gameState.board;
    const {startingSquare, targetSquare} = move;
    const pieceToMove = board[startingSquare.rank][startingSquare.file];

    if (!pieceToMove) {
        throw new Error('Trying to make a move with a starting square without a piece on it');
    }

    // Update our position on the board
    pieceToMove.position = targetSquare;
    pieceToMove.timesMoved++;
    board[targetSquare.rank][targetSquare.file] = pieceToMove;
    board[startingSquare.rank][startingSquare.file] = null;

    // If pawn made two pushes -> set en passant
    // Else set en passant to undefined
    return {
        ...gameState,
        board: board,
        enPassant: (pieceToMove.type === PieceType.PAWN && Math.abs(startingSquare.rank - targetSquare.rank) > 1) ?
            {
                rank: targetSquare.rank + Math.sign(startingSquare.rank - targetSquare.rank),
                file: targetSquare.file
            }
            : undefined
    };
};

export const undoMove = (gameState: BoardState, move: Move): BoardState => {
    const board = gameState.board;
    const {startingSquare, targetSquare} = move;
    const pieceToMove = board[targetSquare.rank][targetSquare.file];

    if (!pieceToMove) {
        throw new Error('Trying to undo a move with a target square without a piece on it');
    }

    // Set our own piece back to it's starting position
    // If we captured a piece we put it back, otherwise move.capture contains null and will simply create an empty square
    pieceToMove.position = startingSquare;
    pieceToMove.timesMoved--;
    board[startingSquare.rank][startingSquare.file] = pieceToMove;
    board[targetSquare.rank][targetSquare.file] = move.capture;

    return {
        ...gameState,
        board: board
    };
};
