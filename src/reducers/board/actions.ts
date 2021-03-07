import {ActionType, createAction} from 'typesafe-actions';
import {BoardData, Color} from '../../constants/piece';
import PieceData, {Position} from '../../components/Piece/PieceData';
import {CheckedState} from '../../utils/pieceMovement';
import {BoardState} from './index';

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

export const increaseTurnsAction = createAction(
    'INCREASE_TURNS'
)<void>();

export const setInitialStateAction = createAction(
    'SET_INITIAL_STATE'
)<BoardState>();

export const commitMovementAction = createAction(
    'COMMIT_MOVEMENT'
)<{ piece: PieceData, position: Position }>();

export const handleCaptureAction = createAction(
    'HANDLE_CAPTURE'
)<BoardState>();

export type BoardActionTypes =
    ActionType<typeof setActiveColorAction> |
    ActionType<typeof setBoardAction> |
    ActionType<typeof setPiecesAction> |
    ActionType<typeof setChecksAction> |
    ActionType<typeof updatePossibleMovesAction> |
    ActionType<typeof validateChecksAction> |
    ActionType<typeof increaseTurnsAction> |
    ActionType<typeof setInitialStateAction> |
    ActionType<typeof commitMovementAction> |
    ActionType<typeof handleCaptureAction>
