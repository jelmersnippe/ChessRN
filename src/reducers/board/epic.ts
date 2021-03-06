import {combineEpics, Epic, StateObservable} from 'redux-observable';
import {setActiveColorAction, setBoardAction, setChecksAction, validateChecksAction} from './actions';
import {filter, map} from 'rxjs/operators';
import {getCheckedStatus} from '../../utils/pieceMovement';
import {RootState} from '../../config/store';
import {isActionOf} from 'typesafe-actions';
import {Color} from '../../constants/piece';

const setBoardEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setBoardAction)),
    map(() => setActiveColorAction(state$.value.board.activeColor === Color.WHITE ? Color.BLACK : Color.WHITE))
);

const updatePossibleMovesEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setBoardAction)),
    map(() => {
        const pieces = state$.value.board.pieces;
        const pieceColors = Object.keys(pieces) as Array<Color>;
        for (const color of pieceColors) {
            for (const piece of pieces[color]) {
                piece?.updatePossibleMoves(state$.value.board.board, pieces);
            }
        }
        return validateChecksAction();
    })
);

const validateChecksEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(validateChecksAction)),
    map(() => {
        const checks = {
            [Color.WHITE]: getCheckedStatus(state$.value.board.pieces, Color.WHITE),
            [Color.BLACK]: getCheckedStatus(state$.value.board.pieces, Color.BLACK)
        };

        return setChecksAction(checks);
    })
);

const boardEpic: Epic = combineEpics(
    setBoardEpic,
    updatePossibleMovesEpic,
    validateChecksEpic
);

export default boardEpic;
