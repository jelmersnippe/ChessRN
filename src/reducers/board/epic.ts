import {combineEpics, Epic, StateObservable} from 'redux-observable';
import {
    calculatePossibleMovesAction,
    checkCastlingAvailabilityAction, commitMovementAction,
    increaseTurnsAction,
    setActiveColorAction,
    setBoardAction,
    setCastlingAvailabilityAction,
    setChecksAction,
    setInitialStateAction,
    setPossibleMovesAction
} from './actions';
import {filter, map, mapTo, mergeMap} from 'rxjs/operators';
import {
    anyCastlesAvailable,
    calculatePossibleMoves,
    canCaptureKing, getCastlingAvailability,
    getCheckedStatus,
    getMovesLeft,
    getOppositeColor,
    isChecked,
    validateMovesForCheck
} from '../../utils/pieceMovement';
import {RootState} from '../../config/store';
import {isActionOf} from 'typesafe-actions';
import {Color, PieceType} from '../../constants/piece';
import {of} from 'rxjs';
import {createDuplicateBoard, createPiecesListFromBoard} from '../../utils/fen';
import {CastlingAvailability} from './index';

const setInitialStateEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setInitialStateAction)),
    mapTo(calculatePossibleMovesAction())
);

const setBoardEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setBoardAction)),
    mergeMap(() => of(
        calculatePossibleMovesAction(),
        checkCastlingAvailabilityAction(),
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
        const {board} = state$.value.board;

        if (!board) {
            throw new Error('No board');
        }

        const pieces = createPiecesListFromBoard(board);
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
    filter((action) => action.payload.piece.possibleMoves[action.payload.position.rank][action.payload.position.file].valid),
    map((action) => {
        const {board} = state$.value.board;
        const {piece, position} = action.payload;

        if (!board) {
            throw new Error('No board');
        }

        const updatedBoard = createDuplicateBoard(board);

        const oldPosition = {rank: piece.position.rank, file: piece.position.file};
        updatedBoard[piece.position.rank][piece.position.file] = null;
        updatedBoard[position.rank][position.file] = piece;

        piece.hasMoved = true;
        piece.position = {rank: position.rank, file: position.file};

        // Castle move
        if (piece.type === PieceType.KING && Math.abs(oldPosition.file - position.file) > 1) {
            const currentRookFile = position.file < 4 ? 0 : 7;
            const rook = updatedBoard[position.rank][currentRookFile];

            if (!rook) {
                return;
            }

            const newRookFile = position.file < 4 ? position.file + 1 : position.file - 1;

            updatedBoard[position.rank][currentRookFile] = null;
            updatedBoard[position.rank][newRookFile] = rook;
            rook.hasMoved = true;
            rook.position = {rank: position.rank, file: newRookFile};
        }

        return setBoardAction([...updatedBoard]);
    })
);

const boardEpic: Epic = combineEpics(
    setInitialStateEpic,
    setBoardEpic,
    increaseTurnsEpic,
    updatePossibleMovesEpic,
    validateChecksEpic,
    checkCastlingAvailabilityEpic,
    commitMovementEpic
);

export default boardEpic;
