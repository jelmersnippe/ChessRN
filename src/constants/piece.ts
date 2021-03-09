import {PieceData} from '../components/Piece/PieceData';

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
