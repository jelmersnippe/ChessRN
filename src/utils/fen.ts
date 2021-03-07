/*
Fen Notation:

1. Board

k = king
q = queen
r = rook
b = bishop
n = knight
p = pawn
number = empty spaces
/ = next rank

capital = white
lowercase = black


2. Active color

w = white
b= black


3. Castle possibility
KQkq

4. En passant possibility
- = not possible
e3 =
    rank < 4 -> pawn at rank +1 can be taken (black can take white)
    rank > 4 -> pawn at rank-1 can be taken (white can take black)

Possibility only lasts for one turn


5. Half move counter
Amount of moves since last pawn movement or capture


6. Total turn counter
Starts at 1 and increases after every BLACK move


Notation for starting board
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1


 */

import {BoardData, Color, PieceType, RankData} from '../constants/piece';
import {PieceData} from '../components/Piece/PieceData';
import {CastlingAvailability} from '../reducers/board';

const fenPieces = {
    p: 'Pawn',
    r: 'Rook',
    n: 'Knight',
    b: 'Bishop',
    k: 'King',
    q: 'Queen'
};

export const fenToJson = (fen: string) => {
    const fenElements = fen.split(' ');

    const board: BoardData = parseFenBoard(fenElements[0]);
    const activeColor: Color = fenElements[1] === Color.WHITE ? Color.WHITE : Color.BLACK;
    const castlingPossibilities: CastlingAvailability = parseFenCastlingPossibilities(fenElements[2]);

    const halfMoveClock = parseInt(fenElements[4], 10);
    const fullMoveNumber = parseInt(fenElements[5], 10);

    return {
        board,
        activeColor,
        castlingPossibilities,
        halfMoveClock,
        fullMoveNumber
    };
};

export const createPiecesListFromBoard = (board: BoardData): { [key in Color]: Array<PieceData> } => {
    const allPieces: Array<PieceData> = board.map((rank) =>
        rank.filter((file) => file !== null) as Array<PieceData>
    ).flat(1);

    return {
        [Color.WHITE]: allPieces.filter((piece) => piece.color !== Color.BLACK),
        [Color.BLACK]: allPieces.filter((piece) => piece.color !== Color.WHITE)
    };
};

export const createDuplicateBoard = (board: BoardData): BoardData => {
    return board.map((rank) =>
        rank.map((file) => {
            return file ?
                {...file}
                : null;
        })
    );
};

const pieceToColor = (piece: string) => piece === piece.toUpperCase() ? Color.WHITE : Color.BLACK;

const pieceToType = (piece: string): PieceType => {
    switch (piece.toLowerCase()) {
        case 'k':
            return PieceType.KING;
        case 'q':
            return PieceType.QUEEN;
        case 'r':
            return PieceType.ROOK;
        case 'b':
            return PieceType.BISHOP;
        case 'n':
            return PieceType.KNIGHT;
        case 'p':
            return PieceType.PAWN;
        default:
            throw new Error('unrecognized piece');
    }
};

const parseFenBoard = (fenBoard: string): BoardData => {
    const board: BoardData = [];

    const fenRanks = fenBoard.split('/');

    for (let currentRank = 0; currentRank < fenRanks.length; currentRank++) {
        const fenRank = fenRanks[currentRank];
        const rank: RankData = [];

        let currentFile = 0;
        for (const fenFile of fenRank) {
            if (fenFile.toLowerCase() in fenPieces) {
                rank.push({
                    color: pieceToColor(fenFile),
                    type: pieceToType(fenFile),
                    possibleMoves: [],
                    position: {rank: currentRank, file: currentFile}
                });
                currentFile++;
            } else {
                let filesToSkip = parseInt(fenFile, 10);
                while (filesToSkip > 0) {
                    rank.push(null);
                    filesToSkip--;
                    currentFile++;
                }
            }
        }

        board.push(rank);
    }

    return board;
};

const parseFenCastlingPossibilities = (fenCastlingPossibilities: string): CastlingAvailability => {
    return {
        [Color.WHITE]: {
            kingSide: fenCastlingPossibilities.includes('K'),
            queenSide: fenCastlingPossibilities.includes('Q')
        },
        [Color.BLACK]: {
            kingSide: fenCastlingPossibilities.includes('k'),
            queenSide: fenCastlingPossibilities.includes('q')
        }
    };
};
