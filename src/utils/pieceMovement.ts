import PieceData, {Position} from '../components/Piece/PieceData';
import {BoardData, Color, PieceType} from '../constants/piece';

type MovePossibilityData = Array<Array<boolean>>;

export const calculatePossibleMoves = (piece: PieceData, board: BoardData): MovePossibilityData => {
    switch (piece.type) {
        case PieceType.KING:
            return kingMovement(piece.boardPosition, board);
        case PieceType.QUEEN:
            const orthogonalMoves = orthogonalMovement(piece.boardPosition, board);
            const diagonalMoves = diagonalMovement(piece.boardPosition, board);
            return orthogonalMoves.map((row, rowIndex) => row.map((cell, cellIndex) => cell ? cell : diagonalMoves[rowIndex][cellIndex]));
        case PieceType.KNIGHT:
            return knightMovement(piece.boardPosition, board);
        case PieceType.ROOK:
            return orthogonalMovement(piece.boardPosition, board);
        case PieceType.BISHOP:
            return diagonalMovement(piece.boardPosition, board);
        case PieceType.PAWN:
            return pawnMovement(piece.boardPosition, piece.color, board);
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

const orthogonalMovement = (piecePosition: Position, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = [];

    for (let y = 0; y < board.length; y++) {
        const row: Array<boolean> = [];

        for (let x = 0; x < board[y].length; x++) {
            if (piecePosition.x === x && piecePosition.y === y) {
                row.push(false);
            } else if (piecePosition.x === x || piecePosition.y === y) {
                row.push(true);
            } else {
                row.push(false);
            }
        }

        movementPossible.push(row);
    }

    return movementPossible;
};

const diagonalMovement = (piecePosition: Position, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = [];

    for (let y = 0; y < board.length; y++) {
        const row: Array<boolean> = [];

        for (let x = 0; x < board[y].length; x++) {
            if (piecePosition.x === x && piecePosition.y === y) {
                row.push(false);
            } else if (Math.abs(piecePosition.x - x) === Math.abs(piecePosition.y - y)) {
                row.push(true);
            } else {
                row.push(false);
            }
        }

        movementPossible.push(row);
    }

    return movementPossible;
};

const knightMovement = (piecePosition: Position, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    const canMoveLeft = piecePosition.x - 1 >= 0;
    const canMoveRight = piecePosition.x + 1 < 8;
    const canMoveUp = piecePosition.y - 1 >= 0;
    const canMoveDown = piecePosition.y + 1 < 8;

    if (canMoveLeft) {
        if (piecePosition.y + 2 < 8) {
            movementPossible[piecePosition.y + 2][piecePosition.x - 1] = true;
        }
        if (piecePosition.y - 2 >= 0) {
            movementPossible[piecePosition.y - 2][piecePosition.x - 1] = true;
        }
    }

    if (canMoveRight) {
        if (piecePosition.y + 2 < 8) {
            movementPossible[piecePosition.y + 2][piecePosition.x + 1] = true;
        }
        if (piecePosition.y - 2 >= 0) {
            movementPossible[piecePosition.y - 2][piecePosition.x + 1] = true;
        }
    }

    if (canMoveUp) {
        if (piecePosition.x + 2 < 8) {
            movementPossible[piecePosition.y - 1][piecePosition.x + 2] = true;
        }
        if (piecePosition.x - 2 >= 0) {
            movementPossible[piecePosition.y - 1][piecePosition.x - 2] = true;
        }
    }

    if (canMoveDown) {
        if (piecePosition.x + 2 < 8) {
            movementPossible[piecePosition.y + 1][piecePosition.x + 2] = true;
        }
        if (piecePosition.x - 2 >= 0) {
            movementPossible[piecePosition.y + 1][piecePosition.x - 2] = true;
        }
    }

    return movementPossible;
};

const kingMovement = (piecePosition: Position, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    const canMoveLeft = piecePosition.x - 1 >= 0;
    const canMoveRight = piecePosition.x + 1 < 8;

    if (piecePosition.y - 1 >= 0) {
        movementPossible[piecePosition.y - 1][piecePosition.x] = true;
        movementPossible[piecePosition.y - 1][piecePosition.x - 1] = canMoveLeft;
        movementPossible[piecePosition.y - 1][piecePosition.x + 1] = canMoveRight;
    }

    movementPossible[piecePosition.y][piecePosition.x - 1] = canMoveLeft;
    movementPossible[piecePosition.y][piecePosition.x + 1] = canMoveRight;

    if (piecePosition.y + 1 < 8) {
        movementPossible[piecePosition.y + 1][piecePosition.x] = true;
        movementPossible[piecePosition.y + 1][piecePosition.x - 1] = canMoveLeft;
        movementPossible[piecePosition.y + 1][piecePosition.x + 1] = canMoveRight;
    }

    return movementPossible;
};

const pawnMovement = (piecePosition: Position, pieceColor: Color, board: BoardData): MovePossibilityData => {
    const movementPossible: MovePossibilityData = generateFalseMovementObject(board);

    if (pieceColor === Color.BLACK && piecePosition.y + 1 < 8) {
        movementPossible[piecePosition.y + 1][piecePosition.x] = true;
    } else if (pieceColor === Color.WHITE && piecePosition.y - 1 >= 0) {
        movementPossible[piecePosition.y - 1][piecePosition.x] = true;
    }

    return movementPossible;
};

