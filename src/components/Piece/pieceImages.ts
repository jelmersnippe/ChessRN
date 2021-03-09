import {Color, PieceType} from '../../constants/piece';

export const pieceImages: {[key in Color]: {[key in PieceType]: any}} = {
    [Color.WHITE]: {
        [PieceType.KING]: require('../../assets/WhiteKing.png'),
        [PieceType.QUEEN]: require('../../assets/WhiteQueen.png'),
        [PieceType.ROOK]: require('../../assets/WhiteRook.png'),
        [PieceType.BISHOP]: require('../../assets/WhiteBishop.png'),
        [PieceType.KNIGHT]: require('../../assets/WhiteKnight.png'),
        [PieceType.PAWN]: require('../../assets/WhitePawn.png')
    },
    [Color.BLACK]: {
        [PieceType.KING]: require('../../assets/BlackKing.png'),
        [PieceType.QUEEN]: require('../../assets/BlackQueen.png'),
        [PieceType.ROOK]: require('../../assets/BlackRook.png'),
        [PieceType.BISHOP]: require('../../assets/BlackBishop.png'),
        [PieceType.KNIGHT]: require('../../assets/BlackKnight.png'),
        [PieceType.PAWN]: require('../../assets/BlackPawn.png')
    }
};
