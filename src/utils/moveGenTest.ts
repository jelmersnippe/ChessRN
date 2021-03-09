import {generateLegalMoves, makeMove, undoMove} from './moveGeneration';
import cloneDeep from 'lodash.clonedeep';
import {BoardData} from '../constants/piece';
import {BoardState} from '../reducers/board/types';
import {fenToJson} from './fen';
import {getOppositeColor, positionToSquare} from './conversions';

type PerftResult = {
    nodesSearched: number;
    results: { [key: number]: { [key: string]: number } };
}
let captures = 0;

export const Perft = (gameState: BoardState, depth: number): PerftResult => {
    if (depth === 0) {
        return {
            nodesSearched: 1,
            results: {[depth]: {}}
        };
    }

    const legalMoves = generateLegalMoves(gameState, gameState.activeColor);
    const results: { [key: string]: number } = {};
    let nodesSearched = 0;

    console.log(`---- depth ${depth} -----`);

    let updatedGameState = cloneDeep(gameState);
    let moveIndex = 0;
    for (const move of legalMoves) {
        if (depth === 3 && moveIndex > 1) {
            // throw new Error();
        }
        console.log(`${positionToSquare(move.startingSquare)}${positionToSquare(move.targetSquare)}`);

        // if (depth === 1) {
        //     console.log('pre-move');
        //     consoleLogBoard(updatedGameState.board);
        // }

        updatedGameState = makeMove(updatedGameState, move);

        // if (depth === 1) {
        //     console.log('post-move');
        //     consoleLogBoard(updatedGameState.board);
        // }

        const possibleMovesForMove = Perft({
            ...updatedGameState,
            activeColor: getOppositeColor(updatedGameState.activeColor)
        }, depth - 1);

        results[`${positionToSquare(move.startingSquare)}${positionToSquare(move.targetSquare)}`] = possibleMovesForMove.nodesSearched;
        if (depth === 1 && move.capture) {
            captures++;
        }

        nodesSearched += possibleMovesForMove.nodesSearched;

        updatedGameState = undoMove(updatedGameState, move);
        moveIndex++;
    }

    return {
        nodesSearched: nodesSearched,
        results: {[depth]: results}
    };
};

export const consoleLogBoard = (board: BoardData): void => {
    let boardString = '';

    for (let rank = 0; rank < board.length; rank++) {
        boardString += '+---+---+---+---+---+---+---+---+\n';
        for (let file = 0; file < board[rank].length; file++) {
            boardString += `| ${board[rank][file]?.type ?? ' '} `;
        }
        boardString += `| ${Math.abs(rank - 8)}\n`;
    }
    boardString += '+---+---+---+---+---+---+---+---+\n';
    boardString += '  a   b   c   d   e   f   g   h';

    console.log(boardString);
};

const depth = 4;
const gameState = fenToJson('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ');
// const gameState = fenToJson('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ');
const perftResults = Perft(gameState, depth);

console.log('');
const results = perftResults.results[depth];
const moves = Object.keys(results);
const sortedMoves = moves.sort();
for (const move of sortedMoves) {
    console.log(`${move}: ${results[move]}`);
}
console.log('Nodes searched: ', perftResults.nodesSearched);
console.log('Captures: ', captures);
