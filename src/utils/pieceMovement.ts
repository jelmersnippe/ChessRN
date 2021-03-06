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
    const movementPossible: MovePossibilityData = [];

    for (let y = 0; y < board.length; y++) {
        const row: Array<boolean> = [];

        for (let x = 0; x < board[y].length; x++) {
            if (piece.boardPosition.x === x && piece.boardPosition.y === y) {
                row.push(false);
            } else if (piece.boardPosition.x === x || piece.boardPosition.y === y) {
                row.push(true);
            } else {
                row.push(false);
            }
        }

        movementPossible.push(row);
    }

    return movementPossible;
};

const diagonalMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = [];

    for (let y = 0; y < board.length; y++) {
        const row: Array<boolean> = [];

        for (let x = 0; x < board[y].length; x++) {
            if (piece.boardPosition.x === x && piece.boardPosition.y === y) {
                row.push(false);
            } else if (Math.abs(piece.boardPosition.x - x) === Math.abs(piece.boardPosition.y - y)) {
                row.push(true);
            } else {
                row.push(false);
            }
        }

        movementPossible.push(row);
    }

    return movementPossible;
};

const knightMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    const canMoveLeft = piece.boardPosition.x - 1 >= 0;
    const canMoveRight = piece.boardPosition.x + 1 < 8;
    const canMoveUp = piece.boardPosition.y - 1 >= 0;
    const canMoveDown = piece.boardPosition.y + 1 < 8;

    if (canMoveLeft) {
        if (piece.boardPosition.y + 2 < 8) {
            movementPossible[piece.boardPosition.y + 2][piece.boardPosition.x - 1] = isValidMove({
                x: piece.boardPosition.x - 1,
                y: piece.boardPosition.y + 2
            }, piece.color, board);
        }
        if (piece.boardPosition.y - 2 >= 0) {
            movementPossible[piece.boardPosition.y - 2][piece.boardPosition.x - 1] = isValidMove({
                x: piece.boardPosition.x - 1,
                y: piece.boardPosition.y - 2
            }, piece.color, board);
        }
    }

    if (canMoveRight) {
        if (piece.boardPosition.y + 2 < 8) {
            movementPossible[piece.boardPosition.y + 2][piece.boardPosition.x + 1] = isValidMove({
                x: piece.boardPosition.x + 1,
                y: piece.boardPosition.y + 2
            }, piece.color, board);
        }
        if (piece.boardPosition.y - 2 >= 0) {
            movementPossible[piece.boardPosition.y - 2][piece.boardPosition.x + 1] = isValidMove({
                x: piece.boardPosition.x + 1,
                y: piece.boardPosition.y - 2
            }, piece.color, board);
        }
    }

    if (canMoveUp) {
        if (piece.boardPosition.x + 2 < 8) {
            movementPossible[piece.boardPosition.y - 1][piece.boardPosition.x + 2] = isValidMove({
                x: piece.boardPosition.x + 2,
                y: piece.boardPosition.y - 1
            }, piece.color, board);
        }
        if (piece.boardPosition.x - 2 >= 0) {
            movementPossible[piece.boardPosition.y - 1][piece.boardPosition.x - 2] = isValidMove({
                x: piece.boardPosition.x - 2,
                y: piece.boardPosition.y - 1
            }, piece.color, board);
        }
    }

    if (canMoveDown) {
        if (piece.boardPosition.x + 2 < 8) {
            movementPossible[piece.boardPosition.y + 1][piece.boardPosition.x + 2] = isValidMove({
                x: piece.boardPosition.x + 2,
                y: piece.boardPosition.y + 1
            }, piece.color, board);
        }
        if (piece.boardPosition.x - 2 >= 0) {
            movementPossible[piece.boardPosition.y + 1][piece.boardPosition.x - 2] = isValidMove({
                x: piece.boardPosition.x - 2,
                y: piece.boardPosition.y + 1
            }, piece.color, board);
        }
    }

    return movementPossible;
};

const kingMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    const canMoveLeft = piece.boardPosition.x - 1 >= 0;
    const canMoveRight = piece.boardPosition.x + 1 < 8;

    if (piece.boardPosition.y - 1 >= 0) {
        movementPossible[piece.boardPosition.y - 1][piece.boardPosition.x] = isValidMove({
            x: piece.boardPosition.x,
            y: piece.boardPosition.y - 1
        }, piece.color, board);
        movementPossible[piece.boardPosition.y - 1][piece.boardPosition.x - 1] = canMoveLeft && isValidMove({
            x: piece.boardPosition.x - 1,
            y: piece.boardPosition.y - 1
        }, piece.color, board);
        movementPossible[piece.boardPosition.y - 1][piece.boardPosition.x + 1] = canMoveRight && isValidMove({
            x: piece.boardPosition.x + 1,
            y: piece.boardPosition.y - 1
        }, piece.color, board);
    }

    movementPossible[piece.boardPosition.y][piece.boardPosition.x - 1] = canMoveLeft && isValidMove({
        x: piece.boardPosition.x - 1,
        y: piece.boardPosition.y
    }, piece.color, board);
    movementPossible[piece.boardPosition.y][piece.boardPosition.x + 1] = canMoveRight && isValidMove({
        x: piece.boardPosition.x + 1,
        y: piece.boardPosition.y
    }, piece.color, board);

    if (piece.boardPosition.y + 1 < 8) {
        movementPossible[piece.boardPosition.y + 1][piece.boardPosition.x] = isValidMove({
            x: piece.boardPosition.x,
            y: piece.boardPosition.y + 1
        }, piece.color, board);
        movementPossible[piece.boardPosition.y + 1][piece.boardPosition.x - 1] = canMoveLeft && isValidMove({
            x: piece.boardPosition.x - 1,
            y: piece.boardPosition.y + 1
        }, piece.color, board);
        movementPossible[piece.boardPosition.y + 1][piece.boardPosition.x + 1] = canMoveRight && isValidMove({
            x: piece.boardPosition.x + 1,
            y: piece.boardPosition.y + 1
        }, piece.color, board);
    }

    return movementPossible;
};

const pawnMovement = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    if (piece.color === Color.BLACK && piece.boardPosition.y + 1 < 8
        && isValidMove({x: piece.boardPosition.x, y: piece.boardPosition.y + 1}, piece.color, board)) {
        movementPossible[piece.boardPosition.y + 1][piece.boardPosition.x] = true;
    } else if (piece.color === Color.WHITE && piece.boardPosition.y - 1 >= 0
        && isValidMove({x: piece.boardPosition.x, y: piece.boardPosition.y - 1}, piece.color, board)) {
        movementPossible[piece.boardPosition.y - 1][piece.boardPosition.x] = true;
    }

    return movementPossible;
};

const isValidMove = (position: Position, pieceColor: Color, board: BoardData): boolean => {
    const cellToCheck = board[position.y][position.x];
    console.log(cellToCheck);
    return cellToCheck === null || cellToCheck.color !== pieceColor;
};
