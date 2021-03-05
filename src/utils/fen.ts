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
/ = next row

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
    row < 4 -> pawn at row +1 can be taken (black can take white)
    row > 4 -> pawn at row-1 can be taken (white can take black)

Possibility only lasts for one turn


5. Half move counter
Amount of moves since last pawn movement or capture


6. Total turn counter
Starts at 1 and increases after every BLACK move


Notation for starting board
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1


 */

const fenPieces = {
    p: 'Pawn',
    r: 'Rook',
    n: 'Knight',
    b: 'Bishop',
    k: 'King',
    q: 'Queen'
};

enum Player {
    WHITE = 'w',
    BLACK = 'b'
}

export const fenToJson = (fen: string) => {
    const fenElements = fen.split(' ');

    const board: Array<Array<string>> = parseFenBoard(fenElements[0]);
    const activePlayer: Player = fenElements[1] === Player.WHITE ? Player.WHITE : Player.BLACK;
    const castlingPossibilities = parseFenCastlingPossibilities(fenElements[2]);

    const halfMoveClock = parseInt(fenElements[4], 10);
    const fullMoveNumber = parseInt(fenElements[6], 10);

    console.log(board);
    return {
        board,
        activePlayer,
        castlingPossibilities,
        halfMoveClock,
        fullMoveNumber
    };
};

const parseFenBoard = (fenBoard: string): Array<Array<string>> => {
    const board: Array<Array<string>> = [];

    const fenRows = fenBoard.split('/');

    for (const fenRow of fenRows) {
        const row: Array<string> = [];

        for (const cell of fenRow) {
            if (cell.toLowerCase() in fenPieces) {
                row.push(cell);
            } else {
                let cellsToSkip = parseInt(cell, 10);
                while (cellsToSkip > 0) {
                    row.push('');
                    cellsToSkip--;
                }
            }
        }

        board.push(row);
    }

    return board;
};

const parseFenCastlingPossibilities = (fenCastlingPossibilities: string) => {
    const castlingPossibilities = {
        [Player.WHITE]: {
            king: false,
            queen: false
        },
        [Player.BLACK]: {
            king: false,
            queen: false
        }
    };

    if (fenCastlingPossibilities.includes('K')) {
        castlingPossibilities[Player.WHITE].king = true;
    }
    if (fenCastlingPossibilities.includes('Q')) {
        castlingPossibilities[Player.WHITE].queen = true;
    }
    if (fenCastlingPossibilities.includes('k')) {
        castlingPossibilities[Player.BLACK].king = true;
    }
    if (fenCastlingPossibilities.includes('q')) {
        castlingPossibilities[Player.BLACK].queen = true;
    }

    return castlingPossibilities;
};
