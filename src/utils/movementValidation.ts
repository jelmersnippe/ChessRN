import {PieceData, Position} from '../components/Piece/PieceData';
import {BoardData, Color, PieceType} from '../constants/piece';
import {Move} from './moveGeneration';
import isEqual from 'lodash.isequal';
import {CheckedState} from './pieceMovement';
import {CastlingAvailability} from '../reducers/board';

export const checkSquare = (position: Position, pieceColor: Color, board: BoardData): { valid: boolean, capture: null | PieceData } => {
    if (position.rank < 0 || position.rank > 7 || position.file < 0 || position.file > 7) {
        throw new Error(`Tried to validate a position outside of the board.\nRank: ${position.rank}\tFile: ${position.file}`);
    }

    const squareToCheck = board[position.rank][position.file];
    return {
        valid: squareToCheck === null || squareToCheck.color !== pieceColor,
        capture: squareToCheck?.color === pieceColor ? null : squareToCheck
    };
};

export const isChecked = (opposingMoves: Array<Move>, kingPosition: Position): boolean => {
    return opposingMoves.some((opposingMove) => isEqual(opposingMove.targetSquare, kingPosition));
};

export const getCheckedStatus = (checked: boolean, movesLeft: number): CheckedState | false => {
    if (movesLeft > 0) {
        return checked ? CheckedState.CHECK : false;
    }

    return checked ? CheckedState.CHECKMATE : CheckedState.STALEMATE;
};


export const getCastlingAvailability = (pieces: Array<PieceData>): { kingSide: boolean, queenSide: boolean } => {
    const king = pieces.find((piece) => piece.type === PieceType.KING && !piece.hasMoved);
    const queenSideRook = pieces.find((piece) => piece.type === PieceType.ROOK && !piece.hasMoved && piece.position.file === 0);
    const kingSideRook = pieces.find((piece) => piece.type === PieceType.ROOK && !piece.hasMoved && piece.position.file === 7);

    return {
        kingSide: !!king && !!kingSideRook,
        queenSide: !!king && !!queenSideRook
    };
};

export const anyCastlesAvailable = (castlingAvailabilities: CastlingAvailability) => {
    const colors = Object.keys(castlingAvailabilities) as Array<Color>;
    for (const color of colors) {
        if (castlingAvailabilities[color].kingSide || castlingAvailabilities[color].queenSide) {
            return true;
        }
    }

    return false;
};

export const validateCastle = (king: PieceData, side: 'queen' | 'king', board: BoardData): boolean => {
    // const opposingPieces = createPiecesListFromBoard(board)[getOppositeColor(king.color)];

    for (
        let file = side === 'queen' ? king.position.file - 1 : king.position.file + 1;
        side === 'queen' ? file > 0 : file < 7;
        side === 'queen' ? file-- : file++
    ) {
        const move = checkSquare({
            rank: king.position.rank,
            file
        }, king.color, board);

        if (!move.valid || move.capture) {
            return false;
        }

        // TODO: Re-add this check
        // It checks all the squares from the king to the rook it wants to castle with
        // To see if they are attackable by the opponent, because this makes the castle illegal

        // for (const opposingPiece of opposingPieces) {
        //     if (opposingPiece.possibleMoves[king.position.rank][file].valid) {
        //         return false;
        //     }
        // }
    }

    return true;
};
