import {BoardData, Color} from '../../constants/piece';
import {getType, Reducer} from 'typesafe-actions';
import {
    BoardActionTypes,
    increaseTurnsAction,
    setActiveColorAction,
    setBoardAction,
    setChecksAction,
    setInitialStateAction,
    setPossibleMovesAction
} from './actions';
import {Position} from '../../components/Piece/PieceData';
import {CheckedState} from '../../utils/pieceMovement';
import {fenToJson} from '../../utils/fen';

export type CastlesAvailable = {
    [key in Color]: {
        queenSide: boolean;
        kingSide: boolean;
    }
}

export interface BoardState {
    board: BoardData | null;
    activeColor: Color;
    castlesAvailable: CastlesAvailable;
    enPassant?: Position;
    checks: { [key in Color]: CheckedState | false };
    turns: number;
}

const initialState: BoardState = {
    board: null,
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
    console.log(state);
    console.log(action);
    switch (action.type) {
        case getType(setInitialStateAction):
            const gameState = fenToJson(action.payload);

            const newState = {
                board: gameState.board,
                activeColor: gameState.activeColor,
                castlesAvailable: gameState.castlingPossibilities,
                turns: gameState.fullMoveNumber
            };

            return {
                ...initialState,
                ...newState
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
                board: action.payload
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
        default:
            return state;
    }
};

export default boardReducer;
