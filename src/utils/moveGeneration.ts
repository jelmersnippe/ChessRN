import {PieceData, Position} from '../components/Piece/PieceData';
import {createPiecesListFromBoard} from './fen';
import {calculatePossibleMoves} from './pieceMovement';
import {BoardData, Color, PieceType} from '../constants/piece';
import isEqual from 'lodash.isequal';
import {getOppositeColor} from './conversions';
import {BoardState} from '../reducers/board/types';
import cloneDeep from 'lodash.clonedeep';

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
        const movesForPiece = calculatePossibleMoves(piece, gameState);
        pseudoLegalMoves = pseudoLegalMoves.concat(movesForPiece);
    }

    return pseudoLegalMoves;
};

export const generateLegalMoves = (gameState: BoardState, color: Color): Array<Move> => {
    let duplicatedGameState = cloneDeep(gameState);

    const pieces = createPiecesListFromBoard(duplicatedGameState.board);
    const pseudoLegalMoves = generatePseudoLegalMoves(pieces[color], duplicatedGameState);

    const legalMoves: Array<Move> = [];


    const king = pieces[color].find((piece) => piece.type === PieceType.KING);
    for (const move of pseudoLegalMoves) {
        // Play the move on the board
        duplicatedGameState = makeMove(duplicatedGameState, move);

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
        const opposingMoves = generatePseudoLegalMoves(opposingPieces, duplicatedGameState);
        if (!opposingMoves.some((opposingMove) => isEqual(opposingMove.targetSquare, kingPosition))) {
            legalMoves.push(move);
        }

        // Undo the move so we have a 'reset' board again
        duplicatedGameState = undoMove(duplicatedGameState, move);
    }

    return legalMoves;
};

export const makeMove = (gameState: BoardState, move: Move): BoardState => {
    let board = gameState.board;
    let enPassant;

    const {startingSquare, targetSquare} = move;
    const pieceToMove = board[startingSquare.rank][startingSquare.file];

    if (!pieceToMove) {
        throw new Error('Trying to make a move with a starting square without a piece on it');
    }

    pieceToMove.position = targetSquare;
    pieceToMove.timesMoved++;
    board[targetSquare.rank][targetSquare.file] = pieceToMove;
    board[startingSquare.rank][startingSquare.file] = null;

    if (pieceToMove.type === PieceType.KING) {
        board = castleMove(pieceToMove, move, gameState.board);
    }

    if (pieceToMove.type === PieceType.PAWN) {
        board = enPassantCapture(pieceToMove, move, gameState);
        enPassant = doublePawnPush(pieceToMove, move);
    }

    return {
        ...gameState,
        board,
        enPassant
    };
};

export const undoMove = (gameState: BoardState, move: Move): BoardState => {
    const board = gameState.board;
    const {startingSquare, targetSquare} = move;
    const pieceToMove = board[targetSquare.rank][targetSquare.file];
    let enPassant;

    if (!pieceToMove) {
        throw new Error('Trying to undo a move with a target square without a piece on it');
    }

    // Revert our piece back to it's starting position
    pieceToMove.position = startingSquare;
    pieceToMove.timesMoved--;
    board[startingSquare.rank][startingSquare.file] = pieceToMove;
    board[targetSquare.rank][targetSquare.file] = null;

    // If we captured a piece we put it back
    if (move.capture) {
        board[move.capture.position.rank][move.capture.position.file] = move.capture;

        // If the targetSquare and captured piece's position are not the same it is an En Passant capture
        // so we put the En Passant position back in the game state
        if (!isEqual(move.capture.position, move.targetSquare)) {
            enPassant = move.targetSquare;
        }
    }

    // TODO: Put back En Castle possibilities & return rook to it's original position
    // If piece.type = king & it moved two squares

    return {
        ...gameState,
        board,
        enPassant
    };
};

const enPassantCapture = (piece: PieceData, move: Move, gameState: BoardState): BoardData => {
    const {startingSquare, targetSquare} = move;

    if (gameState.enPassant && piece.type === PieceType.PAWN && isEqual(targetSquare, gameState.enPassant)) {
        gameState.board[startingSquare.rank][targetSquare.file] = null;
    }

    return gameState.board;
};

const doublePawnPush = (piece: PieceData, move: Move): Position | undefined => {
    const {startingSquare, targetSquare} = move;

    return (piece.type === PieceType.PAWN && Math.abs(startingSquare.rank - targetSquare.rank) > 1)
        ? {
            rank: targetSquare.rank + Math.sign(startingSquare.rank - targetSquare.rank),
            file: targetSquare.file
        }
        : undefined;
};

const castleMove = (piece: PieceData, move: Move, board: BoardData) => {
    const {startingSquare, targetSquare} = move;

    if (piece.type === PieceType.KING && Math.abs(startingSquare.file - targetSquare.file) > 1) {
        const currentRookFile = targetSquare.file < 4 ? 0 : 7;
        const rook = board[targetSquare.rank][currentRookFile];

        if (!rook) {
            throw new Error('Tried to castle without a rook');
        }

        const newRookFile = targetSquare.file < 4 ? targetSquare.file + 1 : targetSquare.file - 1;

        board[targetSquare.rank][currentRookFile] = null;
        board[targetSquare.rank][newRookFile] = rook;
        rook.timesMoved++;
        rook.position = {rank: targetSquare.rank, file: newRookFile};
    }

    return board;
};
