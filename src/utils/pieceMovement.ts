import {PieceData, Position} from '../components/Piece/PieceData';
import {BoardData, Color, PieceType} from '../constants/piece';
import {CastlingAvailability} from '../reducers/board';
import store from '../config/store';
import {Move} from './moveGeneration';
import isEqual from 'lodash.isequal';

export type MovePossibilityData = Array<Array<{ valid: boolean, capture: boolean }>>;

export enum CheckedState {
    CHECK = 'Check',
    CHECKMATE = 'Checkmate',
    STALEMATE = 'Stalemate'
}

export const calculatePossibleMoves = (piece: PieceData, board: BoardData, enPassant: Position | undefined): Array<Move> => {
    switch (piece.type) {
        case PieceType.KING:
            return kingMovement(piece, board);
        case PieceType.QUEEN:
            return slidingMovement(piece, board, (rankDelta, fileDelta) => !(rankDelta === 0 && fileDelta === 0));
        case PieceType.KNIGHT:
            return knightMovement(piece, board);
        case PieceType.ROOK:
            return slidingMovement(piece, board, (rankDelta, fileDelta) => Math.abs(rankDelta) !== Math.abs(fileDelta));
        case PieceType.BISHOP:
            return slidingMovement(piece, board, (rankDelta, fileDelta) => rankDelta !== 0 && fileDelta !== 0);
        case PieceType.PAWN:
            return pawnMovement(piece, board, enPassant);
    }
};

const moveUntilCaptureOrBlock = (piece: PieceData, rankDelta: number, fileDelta: number, board: BoardData): Array<Move> => {
    const possibleMoves: Array<Move> = [];

    let currentRankDistance = rankDelta;
    let currentFileDistance = fileDelta;

    // If the square is inside the board
    while (piece.position.rank + currentRankDistance >= 0 && piece.position.rank + currentRankDistance < 8 &&
    piece.position.file + currentFileDistance >= 0 && piece.position.file + currentFileDistance < 8) {

        const targetSquare = {rank: piece.position.rank + currentRankDistance, file: piece.position.file + currentFileDistance};
        const move = checkSquare(targetSquare, piece.color, board);

        if (move.valid) {
            possibleMoves.push({
                startingSquare: piece.position,
                targetSquare: targetSquare,
                capture: move.capture,
                piece: piece.type
            });
        }

        if (!move.valid || move.capture) {
            break;
        }

        currentRankDistance += rankDelta;
        currentFileDistance += fileDelta;
    }

    return possibleMoves;
};

const slidingMovement = (piece: PieceData, board: BoardData, isValidSquare: (rankDelta: number, fileDelta: number) => boolean): Array<Move> => {
    let possibleMoves: Array<Move> = [];

    for (let rankDelta = -1; rankDelta <= 1; rankDelta++) {
        for (let fileDelta = -1; fileDelta <= 1; fileDelta++) {
            if (!isValidSquare(rankDelta, fileDelta)) {
                continue;
            }

            // Merge just found moves with the already known possible moves
            const partialPossibleMoves = moveUntilCaptureOrBlock(piece, rankDelta, fileDelta, board);
            possibleMoves = possibleMoves.concat(partialPossibleMoves);
        }
    }

    return possibleMoves;
};

const knightMovement = (piece: PieceData, board: BoardData): Array<Move> => {
    const possibleMoves: Array<Move> = [];

    for (let rank = piece.position.rank - 2; rank <= piece.position.rank + 2; rank++) {
        // Outside of the board
        if (rank < 0 || rank >= 8) {
            continue;
        }

        for (let file = piece.position.file - 2; file <= piece.position.file + 2; file++) {
            // Outside of the board
            if (file < 0 || file >= 8) {
                continue;
            }

            // File and rank movement delta are equal - Not allowed by Knight rules
            if (Math.abs(piece.position.file - file) === Math.abs(piece.position.rank - rank)) {
                continue;
            }

            // Orthogonal movement - Not allowed by knight rules
            if (file === piece.position.file || rank === piece.position.rank) {
                continue;
            }

            const move = checkSquare({
                rank,
                file
            }, piece.color, board);

            if (move.valid) {
                possibleMoves.push({
                    startingSquare: piece.position,
                    targetSquare: {rank, file},
                    capture: move.capture,
                    piece: piece.type
                });
            }
        }
    }

    return possibleMoves;
};

const kingMovement = (piece: PieceData, board: BoardData): Array<Move> => {
    const possibleMoves: Array<Move> = [];

    for (let rank = piece.position.rank - 1; rank <= piece.position.rank + 1; rank++) {
        // Outside of the board
        if (rank < 0 || rank >= 8) {
            continue;
        }

        for (let file = piece.position.file - 1; file <= piece.position.file + 1; file++) {
            // Outside of the board
            if (file < 0 || file >= 8) {
                continue;
            }

            // Own square
            if (file === piece.position.file && rank === piece.position.rank) {
                continue;
            }

            const move = checkSquare({
                rank,
                file
            }, piece.color, board);

            if (move.valid) {
                possibleMoves.push({
                    startingSquare: piece.position,
                    targetSquare: {rank, file},
                    capture: move.capture,
                    piece: piece.type
                });
            }
        }

        // TODO: pass these as parameters by passing the state from the calculate possible moves epic
        const isChecked = store.getState().board.checks[piece.color];
        const availableCastles = store.getState().board.castlesAvailable[piece.color];

        if (!isChecked && !piece.hasMoved && (availableCastles.kingSide || availableCastles.queenSide)) {
            if (availableCastles.queenSide && validateCastle(piece, 'queen', board)) {
                possibleMoves.push({
                    startingSquare: piece.position,
                    targetSquare: {rank: piece.position.rank, file: piece.position.file - 2},
                    capture: null,
                    piece: piece.type
                });
            }

            if (availableCastles.queenSide && validateCastle(piece, 'king', board)) {
                possibleMoves.push({
                    startingSquare: piece.position,
                    targetSquare: {rank: piece.position.rank, file: piece.position.file + 2},
                    capture: null,
                    piece: piece.type
                });
            }
        }
    }

    return possibleMoves;
};

const validateCastle = (king: PieceData, side: 'queen' | 'king', board: BoardData): boolean => {
    // const opposingPieces = createPiecesListFromBoard(board)[getOppositeColor(king.color)];

    for (
        let file = side === 'queen' ? king.position.file - 1 : king.position.file + 1;
        side === 'queen' ? file > 0 : file < 7;
        side === 'queen' ? file-- : file++
    ) {
        const move = checkSquare({
            rank: king.position.rank,
            file
        }, king.color, board);

        if (!move.valid || move.capture) {
            return false;
        }

        // TODO: Re-add this check
        // It checks all the squares from the king to the rook it wants to castle with
        // To see if they are attackable by the opponent, because this makes the castle illegal

        // for (const opposingPiece of opposingPieces) {
        //     if (opposingPiece.possibleMoves[king.position.rank][file].valid) {
        //         return false;
        //     }
        // }
    }

    return true;
};

export const getCastlingAvailability = (pieces: Array<PieceData>): { kingSide: boolean, queenSide: boolean } => {
    const king = pieces.find((piece) => piece.type === PieceType.KING && !piece.hasMoved);
    const queenSideRook = pieces.find((piece) => piece.type === PieceType.ROOK && !piece.hasMoved && piece.position.file === 0);
    const kingSideRook = pieces.find((piece) => piece.type === PieceType.ROOK && !piece.hasMoved && piece.position.file === 7);

    return {
        kingSide: !!king && !!kingSideRook,
        queenSide: !!king && !!queenSideRook
    };
};

export const anyCastlesAvailable = (castlingAvailabilities: CastlingAvailability) => {
    const colors = Object.keys(castlingAvailabilities) as Array<Color>;
    for (const color of colors) {
        if (castlingAvailabilities[color].kingSide || castlingAvailabilities[color].queenSide) {
            return true;
        }
    }

    return false;
};

const pawnMovement = (piece: PieceData, board: BoardData, enPassant: Position | undefined): Array<Move> => {
    const possibleMoves: Array<Move> = [];

    const rankDelta = piece.color === Color.WHITE ? -1 : 1;

    // TODO: Reached the final line -> should be promoted
    if (piece.position.rank + rankDelta < 0 || piece.position.rank + rankDelta > 7) {
        return possibleMoves;
    }

    for (let fileDelta = -1; fileDelta <= 1; fileDelta++) {
        if (piece.position.file + fileDelta >= 0 && piece.position.file + fileDelta < 8) {
            const targetSquare = {rank: piece.position.rank + rankDelta, file: piece.position.file + fileDelta};
            const move = checkSquare(targetSquare, piece.color, board);

            if (enPassant && isEqual(enPassant, targetSquare)) {
                possibleMoves.push({
                    startingSquare: piece.position,
                    targetSquare: targetSquare,
                    capture: board[targetSquare.rank][targetSquare.file],
                    piece: piece.type
                });
            }
            // Valid forward move that is not a capture, or a diagonal capture
            else if ((fileDelta === 0 && (move.valid && !move.capture)) || (fileDelta !== 0 && !!move.capture)) {
                possibleMoves.push({
                    startingSquare: piece.position,
                    targetSquare: targetSquare,
                    capture: move.capture,
                    piece: piece.type
                });

                // If the pawn hasn't moved yet and it can move one step forward
                // Check if a double push is possible
                if (!piece.hasMoved && fileDelta === 0) {
                    const doublePushTargetSquare = {rank: piece.position.rank + (rankDelta * 2), file: piece.position.file};
                    const doublePushMove = checkSquare(doublePushTargetSquare, piece.color, board);
                    if (doublePushMove.valid && !doublePushMove.capture) {
                        possibleMoves.push({
                            startingSquare: piece.position,
                            targetSquare: doublePushTargetSquare,
                            capture: doublePushMove.capture,
                            piece: piece.type
                        });
                    }
                }
            }
        }
    }

    return possibleMoves;
};

const checkSquare = (position: Position, pieceColor: Color, board: BoardData): { valid: boolean, capture: null | PieceData } => {
    if (position.rank < 0 || position.rank > 7 || position.file < 0 || position.file > 7) {
        throw new Error(`Tried to validate a position outside of the board.\nRank: ${position.rank}\tFile: ${position.file}`);
    }

    const squareToCheck = board[position.rank][position.file];
    return {
        valid: squareToCheck === null || squareToCheck.color !== pieceColor,
        capture: squareToCheck?.color === pieceColor ? null : squareToCheck
    };
};

export const isChecked = (opposingMoves: Array<Move>, kingPosition: Position): boolean => {
    return opposingMoves.some((opposingMove) => isEqual(opposingMove.targetSquare, kingPosition));
};

export const getCheckedStatus = (checked: boolean, movesLeft: number): CheckedState | false => {
    if (movesLeft > 0) {
        return checked ? CheckedState.CHECK : false;
    }

    return checked ? CheckedState.CHECKMATE : CheckedState.STALEMATE;
};

export const getOppositeColor = (color: Color) => color === Color.WHITE ? Color.BLACK : Color.WHITE;
