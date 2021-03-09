import {Color} from '../constants/piece';
import {Position} from '../components/Piece/PieceData';

export const getOppositeColor = (color: Color) => color === Color.WHITE ? Color.BLACK : Color.WHITE;

export const positionToSquare = (position: Position): string => {
    const files = 'abcdefgh';

    let square = '';

    square += files[position.file];
    square += Math.abs(position.rank - 8).toString();

    return square;
};
