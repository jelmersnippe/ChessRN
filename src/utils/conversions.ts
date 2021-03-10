import {Color, PieceType} from '../constants/piece';
import {Position} from '../components/Piece/PieceData';

export const getOppositeColor = (color: Color) => color === Color.WHITE ? Color.BLACK : Color.WHITE;

export const positionToSquare = (position: Position): string => {
    const files = 'abcdefgh';

    let square = '';

    square += files[position.file];
    square += Math.abs(position.rank - 8).toString();

    return square;
};

export const pieceToColor = (piece: string) => piece === piece.toUpperCase() ? Color.WHITE : Color.BLACK;

export const pieceToType = (piece: string): PieceType => {
    switch (piece.toLowerCase()) {
        case 'k':
            return PieceType.KING;
        case 'q':
            return PieceType.QUEEN;
        case 'r':
            return PieceType.ROOK;
        case 'b':
            return PieceType.BISHOP;
        case 'n':
            return PieceType.KNIGHT;
        case 'p':
            return PieceType.PAWN;
        default:
            throw new Error('unrecognized piece');
    }
};
