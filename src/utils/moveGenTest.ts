// The moves for 1 color are considered 1 depth
// The moves for 1 color AND the follow up moves for the other color are considered 1 ply
// So depth 2 = one turn for white + one turn for black, or 1 ply

import {BoardState} from '../reducers/board';
import {generateLegalMoves, makeMove, undoMove} from './moveGeneration';
import {getOppositeColor} from './pieceMovement';
import cloneDeep from 'lodash.clonedeep';

export const Perft = (gameState: BoardState, depth: number): number => {
    if (depth === 0) {
        return 1;
    }

    const legalMoves = generateLegalMoves(gameState, gameState.activeColor);
    let possibleMoves = 0;

    let updatedGameState = cloneDeep(gameState);
    for (const move of legalMoves) {
        updatedGameState = makeMove(updatedGameState, move);

        possibleMoves += Perft({
            ...updatedGameState,
            activeColor: getOppositeColor(updatedGameState.activeColor)
        }, depth - 1);

        updatedGameState = undoMove(updatedGameState, move);
    }

    return possibleMoves;
};

// import {createDuplicateBoard, createPiecesListFromBoard, fenToJson} from './fen';
// import {Color} from '../constants/piece';
// import {canCaptureKing, generateLegalMoves, generatePseudoLegalMoves, getOppositeColor} from './pieceMovement';
//
//
// const gameState = fenToJson(fenString);
//
// export const Perft = (, depth: number) => {
//
//     if (depth === 0) {
//         return 0;
//     }
//
//     let possibleMoves = 0;
//
//     const pieces = createPiecesListFromBoard(gameState.board);
//     const updatedBoard = createDuplicateBoard(gameState.board);
//     const pieceColors = Object.keys(pieces) as Array<Color>;
//
//     for (const color of pieceColors) {
//         for (const piece of pieces[color]) {
//             const opposingColor = getOppositeColor(piece.color);
//
//             // TODO: Pass the state to these instead of passing everything seperately
//             const pseudoLegalMoves = generatePseudoLegalMoves(piece, gameState.board, undefined);
//             const legalMoves = generateLegalMoves(piece.position, pseudoLegalMoves, opposingColor, gameState.board, undefined);
//
//             const checksKing = canCaptureKing(legalMoves, pieces[opposingColor]);
//
//             possibleMoves += legalMoves.filter((rank) => rank.map((file) => file.valid)).length;
//
//             updatedBoard[piece.position.rank][piece.position.file] = {
//                 ...piece,
//                 possibleMoves: legalMoves,
//                 checksKing: checksKing
//             };
//         }
//     }
//
//     return possibleMoves;
// };
