import {BoardData, Color} from '../../constants/piece';
import PieceData from '../../components/Piece/PieceData';

export interface BoardState {
    board: BoardData;
    pieces: Array<PieceData>;
    activeColor: Color;
}

export enum BoardActionType {
    SET_ACTIVE_COLOR = 'SET_ACTIVE_COLOR',
    SET_BOARD = 'SET_BOARD',
    SET_PIECES = 'SET_PIECES',
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
    payload: Array<PieceData>;
}

export type BoardActionTypes = SetActiveColor | SetBoard | SetPieces;
