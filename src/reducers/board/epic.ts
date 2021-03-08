import {combineEpics, Epic, StateObservable} from 'redux-observable';
import {
    calculatePossibleMovesAction,
    checkCastlingAvailabilityAction,
    commitMovementAction,
    increaseTurnsAction,
    setActiveColorAction,
    setBoardAction,
    setCastlingAvailabilityAction,
    setChecksAction,
    setEnPassantAction,
    setInitialStateAction,
    setPossibleMovesAction
} from './actions';
import {filter, map, mergeMap} from 'rxjs/operators';
import {anyCastlesAvailable, getCastlingAvailability, getCheckedStatus, getOppositeColor, isChecked} from '../../utils/pieceMovement';
import {RootState} from '../../config/store';
import {isActionOf} from 'typesafe-actions';
import {Color, PieceType} from '../../constants/piece';
import {of} from 'rxjs';
import {createDuplicateBoard, createPiecesListFromBoard} from '../../utils/fen';
import {CastlingAvailability} from './index';
import {generateLegalMoves} from '../../utils/moveGeneration';
import isEqual from 'lodash.isequal';

const setInitialStateEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setInitialStateAction)),
    map(() => calculatePossibleMovesAction(state$.value.board.activeColor))
);

const setBoardEpic: Epic = (action$, state$: StateObservable<RootState>) => action$.pipe(
    filter(isActionOf(setBoardAction)),
    mergeMap(() => of(
        checkCastlingAvailabilityAction(),
        setActiveColorAction(getOppositeColor(state$.value.board.activeColor))
    ))
);

const increaseTurnsEpic: Epic = (action$) => action$.pipe(
    filter(isActionOf(setActiveColorAction)),
    // filter((action) => action.payload === Color.WHITE),
    mergeMap((action) => of(
        calculatePossibleMovesAction(action.payload),
        increaseTurnsAction()
    ))
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
    filter((action) => state$.value.board.possibleMoves[state$.value.board.activeColor].some((move) => isEqual(move.targetSquare, action.payload.position) && isEqual(move.startingSquare, action.payload.piece.position))),
    mergeMap((action) => {
        const {board, enPassant} = state$.value.board;
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

        // TODO: These have to be taken into account when calculating movement
        // Currently you can capture a pawn in En Passant and put your own king in check, which is illegal

        // Castle move
        if (piece.type === PieceType.KING && Math.abs(oldPosition.file - position.file) > 1) {
            const currentRookFile = position.file < 4 ? 0 : 7;
            const rook = updatedBoard[position.rank][currentRookFile];

            if (!rook) {
                throw new Error('Tried to castle without a rook');
            }

            const newRookFile = position.file < 4 ? position.file + 1 : position.file - 1;

            updatedBoard[position.rank][currentRookFile] = null;
            updatedBoard[position.rank][newRookFile] = rook;
            rook.hasMoved = true;
            rook.position = {rank: position.rank, file: newRookFile};
        }

        // En passant
        if (piece.type === PieceType.PAWN && enPassant && position.rank === enPassant.rank && position.file === enPassant.file) {
            updatedBoard[oldPosition.rank][position.file] = null;
        }

        return of(
            setBoardAction([...updatedBoard]),
            calculatePossibleMovesAction(piece.color),
            setEnPassantAction((piece.type === PieceType.PAWN && Math.abs(oldPosition.rank - position.rank) > 1) ? {
                rank: position.rank + Math.sign(oldPosition.rank - position.rank),
                file: position.file
            } : undefined)
        );
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
