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
            return orthogonalMoves.map((row, rowIndex) => row.map((cell, cellIndex) => cell ? cell : diagonalMoves[rowIndex][cellIndex]));
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
        const row: Array<boolean> = [];

        for (let x = 0; x < board[y].length; x++) {
            row.push(false);
        }

        movementPossible.push(row);
    }

    return movementPossible;
};

const orthogonalMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    // Check to the left
    let cellToCheck = piece.boardPosition.x - 1;
    while (cellToCheck >= 0) {
        const move = validateMove({x: cellToCheck, y: piece.boardPosition.y}, piece.color, board);
        movementPossible[piece.boardPosition.y][cellToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        cellToCheck--;
    }

    // Check to the right
    cellToCheck = piece.boardPosition.x + 1;
    while (cellToCheck < 8) {
        const move = validateMove({x: cellToCheck, y: piece.boardPosition.y}, piece.color, board);
        movementPossible[piece.boardPosition.y][cellToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        cellToCheck++;
    }

    // Check above
    let rowToCheck = piece.boardPosition.y - 1;
    while (rowToCheck >= 0) {
        const move = validateMove({x: piece.boardPosition.x, y: rowToCheck}, piece.color, board);
        movementPossible[rowToCheck][piece.boardPosition.x] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rowToCheck--;
    }

    // Check below
    rowToCheck = piece.boardPosition.y + 1;
    while (rowToCheck < 8) {
        const move = validateMove({x: piece.boardPosition.x, y: rowToCheck}, piece.color, board);
        movementPossible[rowToCheck][piece.boardPosition.x] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rowToCheck++;
    }

    return movementPossible;
};

const diagonalMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    let rowToCheck = piece.boardPosition.y - 1;
    let cellToCheck = piece.boardPosition.x - 1;

    while (rowToCheck >= 0 && cellToCheck >= 0) {
        const move = validateMove({x: cellToCheck, y: rowToCheck}, piece.color, board);
        movementPossible[rowToCheck][cellToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rowToCheck--;
        cellToCheck--;
    }

    rowToCheck = piece.boardPosition.y + 1;
    cellToCheck = piece.boardPosition.x + 1;
    while (rowToCheck < 8 && cellToCheck < 8) {
        const move = validateMove({x: cellToCheck, y: rowToCheck}, piece.color, board);
        movementPossible[rowToCheck][cellToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rowToCheck++;
        cellToCheck++;
    }

    rowToCheck = piece.boardPosition.y - 1;
    cellToCheck = piece.boardPosition.x + 1;
    while (rowToCheck >= 0 && cellToCheck < 8) {
        const move = validateMove({x: cellToCheck, y: rowToCheck}, piece.color, board);
        movementPossible[rowToCheck][cellToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rowToCheck--;
        cellToCheck++;
    }

    rowToCheck = piece.boardPosition.y + 1;
    cellToCheck = piece.boardPosition.x - 1;
    while (rowToCheck < 8 && cellToCheck >= 0) {
        const move = validateMove({x: cellToCheck, y: rowToCheck}, piece.color, board);
        movementPossible[rowToCheck][cellToCheck] = move.valid;

        if (!move.valid || move.capture) {
            break;
        }

        rowToCheck++;
        cellToCheck--;
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

            movementPossible[rank][file] = validateMove({
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

            movementPossible[rank][file] = validateMove({
                x: file,
                y: rank
            }, piece.color, board).valid;
        }
    }

    return movementPossible;
};

const pawnMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    if (piece.color === Color.BLACK && piece.boardPosition.y + 1 < 8
        && validateMove({x: piece.boardPosition.x, y: piece.boardPosition.y + 1}, piece.color, board).valid) {
        movementPossible[piece.boardPosition.y + 1][piece.boardPosition.x] = true;
    } else if (piece.color === Color.WHITE && piece.boardPosition.y - 1 >= 0
        && validateMove({x: piece.boardPosition.x, y: piece.boardPosition.y - 1}, piece.color, board).valid) {
        movementPossible[piece.boardPosition.y - 1][piece.boardPosition.x] = true;
    }

    return movementPossible;
};

const validateMove = (position: Position, pieceColor: Color, board: BoardData): {valid: boolean, capture: boolean} => {
    if (position.x < 0 || position.x > 7 || position.y < 0 || position.y > 7) {
        return {
            valid: false,
            capture: false
        };
    }

    const cellToCheck = board[position.y][position.x];
    return {
        valid: cellToCheck === null || cellToCheck.color !== pieceColor,
        capture: cellToCheck !== null && cellToCheck.color !== pieceColor
    };
};
