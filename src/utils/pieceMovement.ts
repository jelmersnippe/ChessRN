import PieceData, {Position} from '../components/Piece/PieceData';
import {BoardData, Color, PieceType} from '../constants/piece';
import {createDuplicateBoard, createPiecesListFromBoard} from './fen';

export type MovePossibilityData = Array<Array<boolean>>;

export const validateMovesForCheck = (piece: PieceData, board: BoardData): MovePossibilityData => {
    const possibleMoves = piece.possibleMoves;

    if (possibleMoves.length === 0) {
        return [];
    }

    for (let rank = 0; rank < board.length; rank++) {
        for (let file = 0; file < board[rank].length; file++) {
            if (!possibleMoves[rank][file]) {
                continue;
            }

            const tempBoard = createDuplicateBoard(board);

            const selectedPiece = tempBoard[piece.boardPosition.y][piece.boardPosition.x];
            if (!selectedPiece) {
                continue;
            }

            selectedPiece.boardPosition = {x: file, y: rank};
            tempBoard[rank][file] = selectedPiece;
            tempBoard[piece.boardPosition.y][piece.boardPosition.x] = null;

            const tempPieces = createPiecesListFromBoard(tempBoard);

            for (const tempPiece of tempPieces.filter((tempPiece) => tempPiece.color !== selectedPiece.color)) {
                tempPiece?.calculatePossibleMoves(tempBoard, tempPieces);
            }

            possibleMoves[rank][file] = !isKingChecked(tempPieces, piece.color);
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
            possibleMoves = orthogonalMoves.map((rank, rankIndex) => rank.map((file, fileIndex) => file ? file : diagonalMoves[rankIndex][fileIndex]));
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
                movementPossible[rankToCheck][piece.boardPosition.x - 1] = checkSquare({
                    x: piece.boardPosition.x - 1,
                    y: rankToCheck
                }, piece.color, board).capture;
            }
            if (piece.boardPosition.x + 1 < 8) {
                movementPossible[rankToCheck][piece.boardPosition.x + 1] = checkSquare({
                    x: piece.boardPosition.x + 1,
                    y: rankToCheck
                }, piece.color, board).capture;
            }
        }
    }

    return movementPossible;
};

const checkSquare = (position: Position, pieceColor: Color, board: BoardData): { valid: boolean, capture: boolean } => {
    if (position.x < 0 || position.x > 7 || position.y < 0 || position.y > 7) {
        throw new Error(`Tried to validate a position outside of the board.\nRank: ${position.y}\tFile: ${position.x}`);
    }

    const squareToCheck = board[position.y][position.x];
    return {
        valid: squareToCheck === null || squareToCheck.color !== pieceColor,
        capture: squareToCheck !== null && squareToCheck.color !== pieceColor
    };
};

export const checksKing = (piece: PieceData, pieces: Array<PieceData>): boolean => {
    const opposingKing = pieces.find((pieceToCheck) => pieceToCheck.color !== piece.color && pieceToCheck.type === PieceType.KING);

    if (!opposingKing) {
        throw new Error('No king of opposing color on the board');
    }

    return !!piece.possibleMoves?.[opposingKing.boardPosition.y][opposingKing.boardPosition.x];
};

export const isKingChecked = (pieces: Array<PieceData>, colorToCheck: Color) => !!pieces.find((piece) => piece?.checksKing && piece.color !== colorToCheck);

export const isCheckmate = (pieces: Array<PieceData>, colorToCheck: Color) =>
    pieces.reduce((possibleMoves, piece) => {
        return piece.color === colorToCheck ?
            possibleMoves + (piece.possibleMoves ? piece.possibleMoves.flat(1).filter((possible) => possible).length : 0)
            : possibleMoves;
    }, 0) === 0;
