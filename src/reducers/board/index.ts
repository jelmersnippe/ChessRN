import {BoardActionType, BoardActionTypes, BoardState} from './types';
import {Color} from '../../constants/piece';

const initialState: BoardState = {
    board: [],
    pieces: [],
    activeColor: Color.WHITE
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
                pieces: action.payload
            };
        default:
            return state;
    }
};

export default boardReducer;
