import {BoardActionType, SetActiveColor, SetBoard, SetPieces} from './types';
import {BoardData, Color} from '../../constants/piece';
import PieceData from '../../components/Piece/PieceData';

export const setActiveColor = (color: Color): SetActiveColor => {
    return {
        type: BoardActionType.SET_ACTIVE_COLOR,
        payload: color
    };
};

export const setBoard = (board: BoardData): SetBoard => {
    return {
        type: BoardActionType.SET_BOARD,
        payload: [...board]
    };
};

export const setPieces = (pieces: Array<PieceData>, color: Color): SetPieces => {
    return {
        type: BoardActionType.SET_PIECES,
        payload: {
            color: color,
            pieces: [...pieces.filter((piece) => piece.color === color)]
        }
    };
};
