import {combineEpics, Epic, StateObservable} from 'redux-observable';
import {
    calculatePossibleMovesAction,
    checkCastlingAvailabilityAction,
    commitMovementAction,
    increaseTurnsAction,
    setActiveColorAction,
    setCastlingAvailabilityAction,
    setChecksAction,
    setGameStateAction,
    setInitialStateAction,
    setPossibleMovesAction
} from './actions';
import {filter, map, mapTo, mergeMap} from 'rxjs/operators';
import {RootState} from '../../config/store';
import {isActionOf} from 'typesafe-actions';
import {Color, PieceType} from '../../constants/piece';
import {of} from 'rxjs';
import {createPiecesListFromBoard} from '../../utils/fen';
import {generateLegalMoves, makeMove} from '../../utils/moveGeneration';
import {anyCastlesAvailable, getCastlingAvailability, getCheckedStatus, isChecked} from '../../utils/movementValidation';
import {CastlingAvailability} from './types';
import {getOppositeColor} from '../../utils/conversions';

const setInitialStateEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setInitialStateAction)),
    map(() => calculatePossibleMovesAction(state$.value.board.activeColor))
);

const setBoardEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setGameStateAction)),
    mergeMap(() => of(
        checkCastlingAvailabilityAction(),
        setActiveColorAction(getOppositeColor(state$.value.board.activeColor))
    ))
);

const increaseTurnsEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setActiveColorAction)),
    filter((action) => action.payload === Color.WHITE),
    mapTo(increaseTurnsAction())
);

const calculatePossibleMovesEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setActiveColorAction)),
    map((action) => calculatePossibleMovesAction(action.payload))
);

const updatePossibleMovesEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(calculatePossibleMovesAction)),
    map((action) => {
        const newGenerationMethodsLegalMoves = generateLegalMoves(state$.value.board, action.payload);

        return setPossibleMovesAction({color: state$.value.board.activeColor, possibleMoves: newGenerationMethodsLegalMoves});
    })
);

const validateChecksEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setPossibleMovesAction)),
    filter(() => state$.value.board.board !== null),
    filter(() => state$.value.board.turns > 1),
    map(() => {
        const {board, possibleMoves, activeColor} = state$.value.board;

        if (!board) {
            throw new Error('No board');
        }

        // We need to get the kings position -> either find it in the board or
        const pieces = createPiecesListFromBoard(board)[activeColor];
        const kingPosition = pieces.find((piece) => piece.type === PieceType.KING)?.position;

        if (!kingPosition) {
            throw new Error('No king found on the board while checking for checks');
        }

        const movesLeft = possibleMoves[activeColor].length;
        const checked = isChecked(possibleMoves[getOppositeColor(activeColor)], kingPosition);

        const checks = {
            [activeColor]: getCheckedStatus(checked, movesLeft)
        };

        return setChecksAction(checks);
    })
);

const checkCastlingAvailabilityEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(checkCastlingAvailabilityAction)),
    filter(() => state$.value.board.board !== null),
    filter(() => anyCastlesAvailable(state$.value.board.castlesAvailable)),
    map(() => {
        const {board} = state$.value.board;

        if (!board) {
            throw new Error('No board');
        }

        const pieces = createPiecesListFromBoard(board);

        const availableCastles: CastlingAvailability = {
            [Color.WHITE]: getCastlingAvailability(pieces[Color.WHITE]),
            [Color.BLACK]: getCastlingAvailability(pieces[Color.BLACK])
        };

        return setCastlingAvailabilityAction(availableCastles);
    })
);

const commitMovementEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(commitMovementAction)),
    filter(() => state$.value.board.board !== null),
    map((action) => {
        const updatedGameState = makeMove(state$.value.board, action.payload);

        return setGameStateAction(updatedGameState);
    })
);

const boardEpic: Epic = combineEpics(
    setInitialStateEpic,
    setBoardEpic,
    increaseTurnsEpic,
    updatePossibleMovesEpic,
    validateChecksEpic,
    checkCastlingAvailabilityEpic,
    commitMovementEpic,
    calculatePossibleMovesEpic
);

export default boardEpic;
