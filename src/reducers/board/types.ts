import {BoardData, Color} from '../../constants/piece';
import PieceData, {Position} from '../../components/Piece/PieceData';

export interface BoardState {
    board: BoardData;
    pieces: { [key in Color]: Array<PieceData> };
    activeColor: Color;
    castlesAvailable: {
        [key in Color]: {
            queenSide: boolean;
            kingSide: boolean;
        }
    };
    enPassant?: Position;
    checks: { [key in Color]: boolean };
}

export enum BoardActionType {
    SET_ACTIVE_COLOR = 'SET_ACTIVE_COLOR',
    SET_BOARD = 'SET_BOARD',
    SET_PIECES = 'SET_PIECES'
}

export interface SetActiveColor {
    type: BoardActionType.SET_ACTIVE_COLOR;
    payload: Color;
}

export interface SetBoard {
    type: BoardActionType.SET_BOARD;
    payload: BoardData;
}

export interface SetPieces {
    type: BoardActionType.SET_PIECES;
    payload: {
        color: Color;
        pieces: Array<PieceData>;
    };
}

export type BoardActionTypes = SetActiveColor | SetBoard | SetPieces;
