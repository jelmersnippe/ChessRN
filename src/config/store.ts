import {applyMiddleware, combineReducers, createStore} from 'redux';
import boardReducer from '../reducers/board';
import {combineEpics, createEpicMiddleware} from 'redux-observable';
import boardEpic from '../reducers/board/epic';
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly';

const epicMiddleware = createEpicMiddleware();

const rootEpic = combineEpics(
    boardEpic
);

const rootReducer = combineReducers({
    board: boardReducer
});

const store = createStore(
    rootReducer,
    composeWithDevTools(
        applyMiddleware(epicMiddleware)
    )
);

epicMiddleware.run(rootEpic);

export type RootState = ReturnType<typeof rootReducer>;
export default store;
