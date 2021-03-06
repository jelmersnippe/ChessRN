import {BoardActionType, BoardActionTypes, BoardState} from './types';
import {Color} from '../../constants/piece';

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
    }
};

const boardReducer = (state = initialState, action: BoardActionTypes): BoardState => {
    console.log(action);
    switch (action.type) {
        case BoardActionType.SET_ACTIVE_COLOR:
            return {
                ...state,
                activeColor: action.payload
            };
        case BoardActionType.SET_BOARD:
            return {
                ...state,
                board: action.payload
            };
        case BoardActionType.SET_PIECES:
            return {
                ...state,
                pieces: {
                    ...state.pieces,
                    [action.payload.color]: action.payload.pieces
                }
            };
        default:
            return state;
    }
};

export default boardReducer;
