import {BoardData, Color} from '../../constants/piece';
import {getType, Reducer} from 'typesafe-actions';
import {
    BoardActionTypes,
    increaseTurnsAction,
    setActiveColorAction,
    setBoardAction,
    setChecksAction,
    setInitialStateAction,
    setPiecesAction
} from './actions';
import PieceData, {Position} from '../../components/Piece/PieceData';
import {CheckedState} from '../../utils/pieceMovement';

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
    checks: { [key in Color]: CheckedState | false };
    turns: number;
}


const initialState: BoardState = {
    board: [],
    pieces: {
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
    console.log(state);
    console.log(action);
    switch (action.type) {
        case getType(setInitialStateAction):
            return {
                ...state,
                ...action.payload
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
        case getType(setPiecesAction):
            return {
                ...state,
                pieces: {
                    ...state.pieces,
                    [action.payload.color]: action.payload.pieces
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
        default:
            return state;
    }
};

export default boardReducer;
