import {ActionType, createAction} from 'typesafe-actions';
import {Color} from '../../constants/piece';
import {Position} from '../../components/Piece/PieceData';
import {CheckedState} from '../../utils/pieceMovement';
import {Move} from '../../utils/moveGeneration';
import {BoardState, CastlingAvailability} from './types';

export const setInitialStateAction = createAction(
    'SET_INITIAL_STATE'
)<string>();

export const setGameStateAction = createAction(
    'SET_GAME_STATE'
)<BoardState>();

export const setActiveColorAction = createAction(
    'SET_ACTIVE_COLOR'
)<Color>();

export const setChecksAction = createAction(
    'SET_CHECKS'
)<Partial<{ [key in Color]: CheckedState | false }>>();

export const increaseTurnsAction = createAction(
    'INCREASE_TURNS'
)<void>();

export const commitMovementAction = createAction(
    'COMMIT_MOVEMENT'
)<Move>();

export const calculatePossibleMovesAction = createAction(
    'CALCULATE_POSSIBLE_MOVES'
)<Color>();

export const setPossibleMovesAction = createAction(
    'SET_POSSIBLE_MOVES'
)<{ color: Color, possibleMoves: Array<Move> }>();

export const checkCastlingAvailabilityAction = createAction(
    'CHECK_CASTLING_AVAILABILITY'
)<void>();

export const setCastlingAvailabilityAction = createAction(
    'SET_CASTLING_AVAILABILITY'
)<CastlingAvailability>();

export const setEnPassantAction = createAction(
    'SET_EN_PASSANT'
)<Position | undefined>();

export type BoardActionTypes =
    ActionType<typeof setActiveColorAction> |
    ActionType<typeof setGameStateAction> |
    ActionType<typeof setChecksAction> |
    ActionType<typeof setPossibleMovesAction> |
    ActionType<typeof calculatePossibleMovesAction> |
    ActionType<typeof increaseTurnsAction> |
    ActionType<typeof setInitialStateAction> |
    ActionType<typeof commitMovementAction> |
    ActionType<typeof checkCastlingAvailabilityAction> |
    ActionType<typeof setCastlingAvailabilityAction> |
    ActionType<typeof setEnPassantAction>
