import PieceData, {Position} from '../components/Piece/PieceData';
import {BoardData, Color, PieceType} from '../constants/piece';

type MovePossibilityData = Array<Array<boolean>>;

export const calculatePossibleMoves = (piece: PieceData, board: BoardData): MovePossibilityData => {
    switch (piece.type) {
        case PieceType.KING:
            return kingMovement(piece, board);
        case PieceType.QUEEN:
            const orthogonalMoves = orthogonalMovement(piece, board);
            const diagonalMoves = diagonalMovement(piece, board);
            return orthogonalMoves.map((rank, rankIndex) => rank.map((file, fileIndex) => file ? file : diagonalMoves[rankIndex][fileIndex]));
        case PieceType.KNIGHT:
            return knightMovement(piece, board);
        case PieceType.ROOK:
            return orthogonalMovement(piece, board);
        case PieceType.BISHOP:
            return diagonalMovement(piece, board);
        case PieceType.PAWN:
            return pawnMovement(piece, board);
    }
};

const generateFalseMovementObject = (board: BoardData) => {
    const movementPossible: Array<Array<boolean>> = [];

    for (let y = 0; y < board.length; y++) {
        const rank: Array<boolean> = [];

        for (let x = 0; x < board[y].length; x++) {
            rank.push(false);
        }

        movementPossible.push(rank);
    }

    return movementPossible;
};

const orthogonalMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    // Check to the left
    let fileToCheck = piece.boardPosition.x - 1;
    while (fileToCheck >= 0) {
        const move = checkSquare({x: fileToCheck, y: piece.boardPosition.y}, piece.color, board);
        movementPossible[piece.boardPosition.y][fileToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        fileToCheck--;
    }

    // Check to the right
    fileToCheck = piece.boardPosition.x + 1;
    while (fileToCheck < 8) {
        const move = checkSquare({x: fileToCheck, y: piece.boardPosition.y}, piece.color, board);
        movementPossible[piece.boardPosition.y][fileToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        fileToCheck++;
    }

    // Check above
    let rankToCheck = piece.boardPosition.y - 1;
    while (rankToCheck >= 0) {
        const move = checkSquare({x: piece.boardPosition.x, y: rankToCheck}, piece.color, board);
        movementPossible[rankToCheck][piece.boardPosition.x] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck--;
    }

    // Check below
    rankToCheck = piece.boardPosition.y + 1;
    while (rankToCheck < 8) {
        const move = checkSquare({x: piece.boardPosition.x, y: rankToCheck}, piece.color, board);
        movementPossible[rankToCheck][piece.boardPosition.x] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck++;
    }

    return movementPossible;
};

const diagonalMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    let rankToCheck = piece.boardPosition.y - 1;
    let fileToCheck = piece.boardPosition.x - 1;

    while (rankToCheck >= 0 && fileToCheck >= 0) {
        const move = checkSquare({x: fileToCheck, y: rankToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck--;
        fileToCheck--;
    }

    rankToCheck = piece.boardPosition.y + 1;
    fileToCheck = piece.boardPosition.x + 1;
    while (rankToCheck < 8 && fileToCheck < 8) {
        const move = checkSquare({x: fileToCheck, y: rankToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck++;
        fileToCheck++;
    }

    rankToCheck = piece.boardPosition.y - 1;
    fileToCheck = piece.boardPosition.x + 1;
    while (rankToCheck >= 0 && fileToCheck < 8) {
        const move = checkSquare({x: fileToCheck, y: rankToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rankToCheck--;
        fileToCheck++;
    }

    rankToCheck = piece.boardPosition.y + 1;
    fileToCheck = piece.boardPosition.x - 1;
    while (rankToCheck < 8 && fileToCheck >= 0) {
        const move = checkSquare({x: fileToCheck, y: rankToCheck}, piece.color, board);
        movementPossible[rankToCheck][fileToCheck] = move.valid;

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

    for (let rank = piece.boardPosition.y - 2; rank <= piece.boardPosition.y + 2; rank++) {
        // Outside of the board
        if (rank < 0 || rank >= 8) {
            continue;
        }

        for (let file = piece.boardPosition.x - 2; file <= piece.boardPosition.x + 2; file++) {
            // Outside of the board
            if (file < 0 || file >= 8) {
                continue;
            }

            // File and rank movement delta are equal - Not allowed by Knight rules
            if (Math.abs(piece.boardPosition.x - file) === Math.abs(piece.boardPosition.y - rank)) {
                continue;
            }

            // Orthogonal movement - Not allowed by knight rules
            if (file === piece.boardPosition.x || rank === piece.boardPosition.y) {
                continue;
            }

            movementPossible[rank][file] = checkSquare({
                x: file,
                y: rank
            }, piece.color, board).valid;
        }
    }

    return movementPossible;
};

const kingMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    for (let rank = piece.boardPosition.y - 1; rank <= piece.boardPosition.y + 1; rank++) {
        // Outside of the board
        if (rank < 0 || rank >= 8) {
            continue;
        }

        for (let file = piece.boardPosition.x - 1; file <= piece.boardPosition.x + 1; file++) {
            // Outside of the board
            if (file < 0 || file >= 8) {
                continue;
            }

            // Own square
            if (file === piece.boardPosition.x && rank === piece.boardPosition.y) {
                continue;
            }

            movementPossible[rank][file] = checkSquare({
                x: file,
                y: rank
            }, piece.color, board).valid;
        }
    }

    return movementPossible;
};

const pawnMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    const squaresToCheck = piece.hasMoved ? 1 : 2;

    for (let moveAmount = 1; moveAmount <= squaresToCheck; moveAmount++) {
        const fileDelta = piece.color === Color.WHITE ? -moveAmount : moveAmount;
        const rankToCheck = piece.boardPosition.y + fileDelta;

        if (rankToCheck < 0 || rankToCheck + fileDelta >= 8) {
            break;
        }

        const forwardSquare = checkSquare({x: piece.boardPosition.x, y: rankToCheck}, piece.color, board);
        movementPossible[rankToCheck][piece.boardPosition.x] = (forwardSquare.valid && !forwardSquare.capture);

        // Check diagonals for captures
        if (moveAmount === 1) {
            if (piece.boardPosition.x - 1 >= 0) {
                movementPossible[rankToCheck][piece.boardPosition.x - 1] = checkSquare({x: piece.boardPosition.x - 1, y: rankToCheck}, piece.color, board).capture;
            }
            if (piece.boardPosition.x + 1 < 8) {
                movementPossible[rankToCheck][piece.boardPosition.x + 1] = checkSquare({x: piece.boardPosition.x + 1, y: rankToCheck}, piece.color, board).capture;
            }
        }
    }

    return movementPossible;
};

const checkSquare = (position: Position, pieceColor: Color, board: BoardData): {valid: boolean, capture: boolean} => {
    if (position.x < 0 || position.x > 7 || position.y < 0 || position.y > 7) {
        throw new Error(`Tried to validate a position outside of the board.\nRank: ${position.y}\tFile: ${position.x}`);
    }

    const squareToCheck = board[position.y][position.x];
    return {
        valid: squareToCheck === null || squareToCheck.color !== pieceColor,
        capture: squareToCheck !== null && squareToCheck.color !== pieceColor
    };
};
