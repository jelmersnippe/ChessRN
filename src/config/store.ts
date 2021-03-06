import {combineReducers, createStore} from 'redux';
import boardReducer from '../reducers/board';

const rootReducer = combineReducers({
    board: boardReducer
});

const store = createStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer>;
export default store;
