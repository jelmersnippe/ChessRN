import {ActionType, createAction} from 'typesafe-actions';
import {BoardData, Color} from '../../constants/piece';
import PieceData from '../../components/Piece/PieceData';
import {CheckedState} from '../../utils/pieceMovement';

export const setActiveColorAction = createAction(
    'SET_ACTIVE_COLOR'
)<Color>();

export const setBoardAction = createAction(
    'SET_BOARD'
)<BoardData>();

export const setPiecesAction = createAction(
    'SET_PIECES'
)<{
    color: Color;
    pieces: Array<PieceData>;
}>();

export const setChecksAction = createAction(
    'SET_CHECKS'
)<Partial<{ [key in Color]: CheckedState | false }>>();

export const updatePossibleMovesAction = createAction(
    'UPDATE_POSSIBLE_MOVES'
)<void>();

export const validateChecksAction = createAction(
    'VALIDATE_CHECKS'
)<void>();

export type BoardActionTypes =
    ActionType<typeof setActiveColorAction> |
    ActionType<typeof setBoardAction> |
    ActionType<typeof setPiecesAction> |
    ActionType<typeof setChecksAction> |
    ActionType<typeof updatePossibleMovesAction> |
    ActionType<typeof validateChecksAction>
