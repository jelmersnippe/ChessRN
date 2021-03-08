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
//
// const perftResult = Perft({
//         board: fenToJson(fenString).board,
//         possibleMoves: [],
//         activeColor: Color.WHITE,
//         castlesAvailable: {
//             [Color.WHITE]: {
//                 queenSide: true,
//                 kingSide: true
//             },
//             [Color.BLACK]: {
//                 queenSide: true,
//                 kingSide: true
//             }
//         },
//         checks: {
//             [Color.WHITE]: false,
//             [Color.BLACK]: false
//         },
//         turns: 1
//     }
//     , 2);
//
// console.log(perftResult);
