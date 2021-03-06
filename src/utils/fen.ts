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
import PieceData from '../components/Piece/PieceData';

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
    const pieces: Array<PieceData | null> = board.map((rank) =>
        rank.filter((file) => file !== null)
    ).flat(1);
    const activeColor: Color = fenElements[1] === Color.WHITE ? Color.WHITE : Color.BLACK;
    const castlingPossibilities = parseFenCastlingPossibilities(fenElements[2]);

    const halfMoveClock = parseInt(fenElements[4], 10);
    const fullMoveNumber = parseInt(fenElements[6], 10);

    return {
        board,
        pieces,
        activeColor,
        castlingPossibilities,
        halfMoveClock,
        fullMoveNumber
    };
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

    let currentRank = 0;
    for (const fenRank of fenRanks) {
        const rank: RankData = [];

        let currentFile = 0;
        for (const file of fenRank) {
            if (file.toLowerCase() in fenPieces) {
                rank.push(new PieceData(pieceToColor(file), pieceToType(file), {x: currentFile, y: currentRank}));
                currentFile++;
            } else {
                let filesToSkip = parseInt(file, 10);
                while (filesToSkip > 0) {
                    rank.push(null);
                    filesToSkip--;
                    currentFile++;
                }
            }

        }

        board.push(rank);
        currentRank++;
    }

    return board;
};

const parseFenCastlingPossibilities = (fenCastlingPossibilities: string) => {
    const castlingPossibilities = {
        [Color.WHITE]: {
            king: false,
            queen: false
        },
        [Color.BLACK]: {
            king: false,
            queen: false
        }
    };

    if (fenCastlingPossibilities.includes('K')) {
        castlingPossibilities[Color.WHITE].king = true;
    }
    if (fenCastlingPossibilities.includes('Q')) {
        castlingPossibilities[Color.WHITE].queen = true;
    }
    if (fenCastlingPossibilities.includes('k')) {
        castlingPossibilities[Color.BLACK].king = true;
    }
    if (fenCastlingPossibilities.includes('q')) {
        castlingPossibilities[Color.BLACK].queen = true;
    }

    return castlingPossibilities;
};
