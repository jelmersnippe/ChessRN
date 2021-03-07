import {PieceData, Position} from '../components/Piece/PieceData';
import {BoardData, Color, PieceType} from '../constants/piece';
import {createDuplicateBoard, createPiecesListFromBoard} from './fen';
import {CastlingAvailability} from '../reducers/board';
import store from '../config/store';

export type MovePossibilityData = Array<Array<{ valid: boolean, capture: boolean }>>;

export enum CheckedState {
    CHECK = 'Check',
    CHECKMATE = 'Checkmate',
    STALEMATE = 'Stalemate'
}

export const validateMovesForCheck = (currentPosition: Position, possibleMoves: MovePossibilityData, opposingColor: Color, board: BoardData): MovePossibilityData => {
    if (possibleMoves.length === 0) {
        return [];
    }

    for (let rank = 0; rank < possibleMoves.length; rank++) {
        for (let file = 0; file < possibleMoves[rank].length; file++) {
            if (!possibleMoves[rank][file].valid) {
                continue;
            }

            const tempBoard = createDuplicateBoard(board);
            const selectedPiece = tempBoard[currentPosition.rank][currentPosition.file];

            if (!selectedPiece) {
                throw new Error('Trying to validate an invalid position');
            }

            // Set new position for selected piece
            selectedPiece.position = {rank, file};
            tempBoard[rank][file] = selectedPiece;

            // Clear old position for selected piece
            tempBoard[currentPosition.rank][currentPosition.file] = null;

            const pieces = createPiecesListFromBoard(tempBoard);
            const ownPieces = pieces[getOppositeColor(opposingColor)];
            const opposingPieces = pieces[opposingColor];

            for (const opposingPiece of opposingPieces) {
                const opposingPossibleMoves = calculatePossibleMoves(opposingPiece, tempBoard);
                const opposingPieceChecksKing = canCaptureKing(opposingPossibleMoves, ownPieces);

                // By making this move an opposing piece can capture our king, so the move is invalid
                // We can skip the rest of the opposing pieces because this move is already considered invalid
                if (opposingPieceChecksKing) {
                    possibleMoves[rank][file].valid = false;
                    break;
                }
            }
        }
    }

    return possibleMoves;
};

export const calculatePossibleMoves = (piece: PieceData, board: BoardData): MovePossibilityData => {
    let possibleMoves: MovePossibilityData = [];

    switch (piece.type) {
        case PieceType.KING:
            possibleMoves = kingMovement(piece, board);
            break;
        case PieceType.QUEEN:
            const orthogonalMoves = orthogonalMovement(piece, board);
            const diagonalMoves = diagonalMovement(piece, board);
            possibleMoves = orthogonalMoves.map((rank, rankIndex) =>
                rank.map((file, fileIndex) => ({
                    valid: file.valid || diagonalMoves[rankIndex][fileIndex].valid,
                    capture: file.capture || diagonalMoves[rankIndex][fileIndex].capture
                }))
            );
            break;
        case PieceType.KNIGHT:
            possibleMoves = knightMovement(piece, board);
            break;
        case PieceType.ROOK:
            possibleMoves = orthogonalMovement(piece, board);
            break;
        case PieceType.BISHOP:
            possibleMoves = diagonalMovement(piece, board);
            break;
        case PieceType.PAWN:
            possibleMoves = pawnMovement(piece, board);
            break;
    }

    return possibleMoves;
};

const generateFalseMovementObject = (board: BoardData) => {
    const movementPossible: Array<Array<{ valid: boolean, capture: boolean }>> = [];

    for (let y = 0; y < board.length; y++) {
        const rank: Array<{ valid: boolean, capture: boolean }> = [];

        for (let x = 0; x < board[y].length; x++) {
            rank.push({
                valid: false,
                capture: false
            });
        }

        movementPossible.push(rank);
    }

    return movementPossible;
};

const orthogonalMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    // Check to the left
    let fileToCheck = piece.position.file - 1;
    while (fileToCheck >= 0) {
        const move = checkSquare({rank: piece.position.rank, file: fileToCheck}, piece.color, board);
        movementPossible[piece.position.rank][fileToCheck] = move;

        if (!move.valid || move.capture) {
            break;
        }

        fileToCheck--;
    }

    // Check to the right
    fileToCheck = piece.position.file + 1;
    while (fileToCheck < 8) {
        const move = checkSquare({rank: piece.position.rank, file: fileToCheck}, piece.color, board);
        movementPossible[piece.position.rank][fileToCheck] = move;

        if (!move.valid || move.capture) {
            break;
        }

        fileToCheck++;
    }

    // Check above
    let rankToCheck = piece.position.rank - 1;
    while (rankToCheck >= 0) {
        const move = checkSquare({rank: rankToCheck, file: piece.position.file}, piece.color, board);
        movementPossible[rankToCheck][piece.position.file] = move;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck--;
    }

    // Check below
    rankToCheck = piece.position.rank + 1;
    while (rankToCheck < 8) {
        const move = checkSquare({rank: rankToCheck, file: piece.position.file}, piece.color, board);
        movementPossible[rankToCheck][piece.position.file] = move;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck++;
    }

    return movementPossible;
};

const diagonalMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    let rankToCheck = piece.position.rank - 1;
    let fileToCheck = piece.position.file - 1;

    while (rankToCheck >= 0 && fileToCheck >= 0) {
        const move = checkSquare({rank: rankToCheck, file: fileToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck--;
        fileToCheck--;
    }

    rankToCheck = piece.position.rank + 1;
    fileToCheck = piece.position.file + 1;
    while (rankToCheck < 8 && fileToCheck < 8) {
        const move = checkSquare({rank: rankToCheck, file: fileToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck++;
        fileToCheck++;
    }

    rankToCheck = piece.position.rank - 1;
    fileToCheck = piece.position.file + 1;
    while (rankToCheck >= 0 && fileToCheck < 8) {
        const move = checkSquare({rank: rankToCheck, file: fileToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck--;
        fileToCheck++;
    }

    rankToCheck = piece.position.rank + 1;
    fileToCheck = piece.position.file - 1;
    while (rankToCheck < 8 && fileToCheck >= 0) {
        const move = checkSquare({rank: rankToCheck, file: fileToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck++;
        fileToCheck--;
    }

    return movementPossible;
};

const knightMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

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

            movementPossible[rank][file] = checkSquare({
                rank,
                file
            }, piece.color, board);
        }
    }

    return movementPossible;
};

const kingMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

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

            movementPossible[rank][file] = checkSquare({
                rank,
                file
            }, piece.color, board);
        }

        const isChecked = store.getState().board.checks[piece.color];
        const availableCastles = store.getState().board.castlesAvailable[piece.color];

        if (!isChecked && !piece.hasMoved) {
            movementPossible[piece.position.rank][piece.position.file - 2].valid = availableCastles.queenSide && validateCastle(piece, 'queen', board);
            movementPossible[piece.position.rank][piece.position.file + 2].valid = availableCastles.kingSide && validateCastle(piece, 'king', board);
        }
    }

    return movementPossible;
};

const validateCastle = (king: PieceData, side: 'queen' | 'king', board: BoardData): boolean => {
    const opposingPieces = createPiecesListFromBoard(board)[getOppositeColor(king.color)];

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

        for (const opposingPiece of opposingPieces) {
            if (opposingPiece.possibleMoves[king.position.rank][file].valid) {
                return false;
            }
        }
    }

    return true;
};

export const getCastlingAvailability = (pieces: Array<PieceData>): {kingSide: boolean, queenSide: boolean} => {
    const king = pieces.find((piece) => piece.type === PieceType.KING && !piece.hasMoved);
    const queenSideRook = pieces.find((piece) => piece.type === PieceType.ROOK && !piece.hasMoved && piece.position.file === 0);
    const kingSideRook = pieces.find((piece) => piece.type === PieceType.ROOK && !piece.hasMoved && piece.position.file === 7);

    return {
        kingSide: !!king && !!kingSideRook,
        queenSide: !!king && !!queenSideRook
    };
};

export const anyCastlesAvailable = (castlingAvailabilities: CastlingAvailability) =>  {
    const colors = Object.keys(castlingAvailabilities) as Array<Color>;
    for (const color of colors) {
        if (castlingAvailabilities[color].kingSide || castlingAvailabilities[color].queenSide) {
            return true;
        }
    }

    return false;
};

const pawnMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    const squaresToCheck = piece.hasMoved ? 1 : 2;

    for (let moveAmount = 1; moveAmount <= squaresToCheck; moveAmount++) {
        const fileDelta = piece.color === Color.WHITE ? -moveAmount : moveAmount;
        const rankToCheck = piece.position.rank + fileDelta;

        if (rankToCheck < 0 || rankToCheck + fileDelta >= 8) {
            break;
        }

        movementPossible[rankToCheck][piece.position.file] = checkSquare({rank: rankToCheck, file: piece.position.file}, piece.color, board);

        /* TODO: En passant
           If the pawn is on the 5th rank (4th for black)
           and there is an enemy pawn on an adjacent file that has moved two steps in the previous turn
           it may be captured by crossing it diagonally
        */
        // Check diagonals for captures
        if (moveAmount === 1) {
            if (piece.position.file - 1 >= 0) {
                const diagonalSquare = checkSquare({
                    rank: rankToCheck,
                    file: piece.position.file - 1
                }, piece.color, board);

                movementPossible[rankToCheck][piece.position.file - 1] = {
                    valid: diagonalSquare.capture,
                    capture: diagonalSquare.capture
                };
            }
            if (piece.position.file + 1 < 8) {
                const diagonalSquare = checkSquare({
                    rank: rankToCheck,
                    file: piece.position.file + 1
                }, piece.color, board);

                movementPossible[rankToCheck][piece.position.file - 1] = {
                    valid: diagonalSquare.capture,
                    capture: diagonalSquare.capture
                };
            }
        }

        if (!movementPossible[rankToCheck][piece.position.file].valid) {
            break;
        }
    }

    return movementPossible;
};

const checkSquare = (position: Position, pieceColor: Color, board: BoardData): { valid: boolean, capture: boolean } => {
    if (position.rank < 0 || position.rank > 7 || position.file < 0 || position.file > 7) {
        throw new Error(`Tried to validate a position outside of the board.\nRank: ${position.rank}\tFile: ${position.file}`);
    }

    const squareToCheck = board[position.rank][position.file];
    return {
        valid: squareToCheck === null || squareToCheck.color !== pieceColor,
        capture: squareToCheck !== null && squareToCheck.color !== pieceColor
    };
};

export const canCaptureKing = (possibleMoves: MovePossibilityData, opposingPieces: Array<PieceData>): boolean => {
    const opposingKing = opposingPieces.find((piece) => piece.type === PieceType.KING);

    if (!opposingKing) {
        throw new Error('No king of opposing color on the board');
    }

    return !!possibleMoves?.[opposingKing.position.rank][opposingKing.position.file].valid;
};

export const isChecked = (pieces: { [key in Color]: Array<PieceData> }, colorToCheck: Color): boolean => {
    const oppositeColor = getOppositeColor(colorToCheck);
    return !!pieces[oppositeColor].find((piece) => piece.checksKing);
};

export const getMovesLeft = (pieces: Array<PieceData>) =>
    pieces.reduce((possibleMoves, piece) => {
        return possibleMoves + (piece.possibleMoves ? piece.possibleMoves.flat(1).filter((possible) => possible.valid).length : 0);
    }, 0);

export const getCheckedStatus = (checked: boolean, movesLeft: number): CheckedState | false => {
    if (movesLeft > 0) {
        return checked ? CheckedState.CHECK : false;
    }

    return checked ? CheckedState.CHECKMATE : CheckedState.STALEMATE;
};

export const getOppositeColor = (color: Color) => color === Color.WHITE ? Color.BLACK : Color.WHITE;
