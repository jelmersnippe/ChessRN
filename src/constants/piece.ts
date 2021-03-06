import PieceData from '../components/Piece/PieceData';

export type BoardData = Array<RankData>;

export type RankData = Array<PieceData | null>

export enum Color {
    BLACK = 'b',
    WHITE = 'w'
}

export enum PieceType {
    KING = 'k',
    QUEEN = 'q',
    ROOK = 'r',
    BISHOP = 'b',
    KNIGHT = 'n',
    PAWN = 'p'
}

export const pieceImages: {[key in Color]: {[key in PieceType]: any}} = {
    [Color.WHITE]: {
        [PieceType.KING]: require('../assets/WhiteKing.png'),
        [PieceType.QUEEN]: require('../assets/WhiteQueen.png'),
        [PieceType.ROOK]: require('../assets/WhiteRook.png'),
        [PieceType.BISHOP]: require('../assets/WhiteBishop.png'),
        [PieceType.KNIGHT]: require('../assets/WhiteKnight.png'),
        [PieceType.PAWN]: require('../assets/WhitePawn.png')
    },
    [Color.BLACK]: {
        [PieceType.KING]: require('../assets/BlackKing.png'),
        [PieceType.QUEEN]: require('../assets/BlackQueen.png'),
        [PieceType.ROOK]: require('../assets/BlackRook.png'),
        [PieceType.BISHOP]: require('../assets/BlackBishop.png'),
        [PieceType.KNIGHT]: require('../assets/BlackKnight.png'),
        [PieceType.PAWN]: require('../assets/BlackPawn.png')
    }
};
