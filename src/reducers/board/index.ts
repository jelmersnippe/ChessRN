import {Color} from '../../constants/piece';
import {getType, Reducer} from 'typesafe-actions';
import {
    BoardActionTypes,
    increaseTurnsAction,
    setActiveColorAction,
    setBoardAction,
    setCastlingAvailabilityAction,
    setChecksAction,
    setEnPassantAction,
    setInitialStateAction,
    setPossibleMovesAction
} from './actions';
import {fenToJson} from '../../utils/fen';
import {BoardState} from './types';

const initialState: BoardState = {
    board: [],
    possibleMoves: {
        [Color.WHITE]: [],
        [Color.BLACK]: []
    },
    activeColor: Color.WHITE,
    castlesAvailable: {
        [Color.WHITE]: {
            queenSide: true,
            kingSide: true
        },
        [Color.BLACK]: {
            queenSide: true,
            kingSide: true
        }
    },
    checks: {
        [Color.WHITE]: false,
        [Color.BLACK]: false
    },
    turns: 1
};

const boardReducer: Reducer<BoardState, BoardActionTypes> = (state = initialState, action: BoardActionTypes): BoardState => {
    switch (action.type) {
        case getType(setInitialStateAction):
            const gameState = fenToJson(action.payload);

            return {
                ...initialState,
                ...gameState
            };
        case getType(setActiveColorAction):
            return {
                ...state,
                activeColor: action.payload
            };
        case getType(setBoardAction):
            return {
                ...state,
                board: action.payload
            };
        case getType(setPossibleMovesAction):
            return {
                ...state,
                possibleMoves: {
                    ...state.possibleMoves,
                    [action.payload.color]: action.payload.possibleMoves
                }
            };
        case getType(setChecksAction):
            return {
                ...state,
                checks: {
                    ...state.checks,
                    ...action.payload
                }
            };
        case getType(increaseTurnsAction):
            return {
                ...state,
                turns: state.turns + 1
            };
        case getType(setCastlingAvailabilityAction):
            return {
                ...state,
                castlesAvailable: action.payload
            };
        case getType(setEnPassantAction):
            return {
                ...state,
                enPassant: action.payload
            };
        default:
            return state;
    }
};

export default boardReducer;
