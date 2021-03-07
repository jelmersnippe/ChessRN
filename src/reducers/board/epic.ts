import {combineEpics, Epic, StateObservable} from 'redux-observable';
import {
    calculatePossibleMovesAction,
    increaseTurnsAction,
    setActiveColorAction,
    setBoardAction,
    setChecksAction,
    setInitialStateAction,
    setPossibleMovesAction
} from './actions';
import {filter, map, mapTo, mergeMap} from 'rxjs/operators';
import {
    calculatePossibleMoves,
    canCaptureKing,
    getCheckedStatus,
    getMovesLeft, getOppositeColor,
    isChecked,
    validateMovesForCheck
} from '../../utils/pieceMovement';
import {RootState} from '../../config/store';
import {isActionOf} from 'typesafe-actions';
import {Color} from '../../constants/piece';
import {of} from 'rxjs';
import {createDuplicateBoard, createPiecesListFromBoard} from '../../utils/fen';

const setInitialStateEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setInitialStateAction)),
    mapTo(calculatePossibleMovesAction())
);

const setBoardEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setBoardAction)),
    mergeMap(() => of(
        calculatePossibleMovesAction(),
        setActiveColorAction(getOppositeColor(state$.value.board.activeColor))
    ))
);

const increaseTurnsEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setActiveColorAction)),
    filter((action) => action.payload === Color.WHITE),
    mapTo(increaseTurnsAction())
);

const updatePossibleMovesEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(calculatePossibleMovesAction)),
    filter(() => state$.value.board.board !== null),
    map(() => {
        const {board} = state$.value.board;

        if (!board) {
            throw new Error('No board');
        }

        const pieces = createPiecesListFromBoard(board);
        const updatedBoard = createDuplicateBoard(board);
        const pieceColors = Object.keys(pieces) as Array<Color>;

        for (const color of pieceColors) {
            for (const piece of pieces[color]) {
                const opposingColor = getOppositeColor(piece.color);

                const possibleMoves = calculatePossibleMoves(piece, board);
                const validatedPossibleMoves = validateMovesForCheck(piece.position, possibleMoves, opposingColor, board);

                const checksKing = canCaptureKing(validatedPossibleMoves, pieces[opposingColor]);

                updatedBoard[piece.position.rank][piece.position.file] = {
                    ...piece,
                    possibleMoves: validatedPossibleMoves,
                    checksKing: checksKing
                };
            }
        }
        return setPossibleMovesAction(updatedBoard);
    })
);

const validateChecksEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setPossibleMovesAction)),
    filter(() => state$.value.board.board !== null),
    filter(() => state$.value.board.turns > 1),
    map(() => {
        if (!state$.value.board.board) {
            return;
        }

        const pieces = createPiecesListFromBoard(state$.value.board.board);
        const movesLeft = {
            [Color.WHITE]: getMovesLeft(pieces[Color.WHITE]),
            [Color.BLACK]: getMovesLeft(pieces[Color.BLACK])
        };
        const checked = {
            [Color.WHITE]: isChecked(pieces, Color.WHITE),
            [Color.BLACK]: isChecked(pieces, Color.BLACK)
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
