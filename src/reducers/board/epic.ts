import {combineEpics, Epic, StateObservable} from 'redux-observable';
import {
    increaseTurnsAction,
    setActiveColorAction,
    setBoardAction,
    setChecksAction,
    setInitialStateAction,
    updatePossibleMovesAction,
    validateChecksAction
} from './actions';
import {filter, map, mapTo, mergeMap} from 'rxjs/operators';
import {getCheckedStatus, getMovesLeft, isChecked} from '../../utils/pieceMovement';
import {RootState} from '../../config/store';
import {isActionOf} from 'typesafe-actions';
import {Color} from '../../constants/piece';
import {of} from 'rxjs';

const setInitialStateEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setInitialStateAction)),
    mapTo(updatePossibleMovesAction())
);

const setBoardEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setBoardAction)),
    mergeMap(() => of(
        updatePossibleMovesAction(),
        setActiveColorAction(state$.value.board.activeColor === Color.WHITE ? Color.BLACK : Color.WHITE)
    ))
);

const increaseTurnsEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setActiveColorAction)),
    filter((action) => action.payload === Color.WHITE),
    mapTo(increaseTurnsAction())
);

const updatePossibleMovesEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(updatePossibleMovesAction)),
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
    filter(() => state$.value.board.turns > 1),
    map(() => {
        const movesLeft = {
            [Color.WHITE]: getMovesLeft(state$.value.board.pieces[Color.WHITE]),
            [Color.BLACK]: getMovesLeft(state$.value.board.pieces[Color.BLACK])
        };
        const checked = {
            [Color.WHITE]: isChecked(state$.value.board.pieces, Color.WHITE),
            [Color.BLACK]: isChecked(state$.value.board.pieces, Color.BLACK)
        };

        const checks = {
            [Color.WHITE]: getCheckedStatus(checked[Color.WHITE], movesLeft[Color.WHITE]),
            [Color.BLACK]: getCheckedStatus(checked[Color.BLACK], movesLeft[Color.BLACK])
        };

        return setChecksAction(checks);
    })
);

const boardEpic: Epic = combineEpics(
    setInitialStateEpic,
    setBoardEpic,
    increaseTurnsEpic,
    updatePossibleMovesEpic,
    validateChecksEpic
);

export default boardEpic;
