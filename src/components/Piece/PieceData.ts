import {Color, PieceType} from '../../constants/piece';
import {MovePossibilityData} from '../../utils/pieceMovement';

/*
    Material points:
    - Pawn: 1
    - Bishop/Knight: 3
    - Rook: 5
    - Queen: 9
 */

// Rank = vertical
// File = horizontal
export interface Position {
    rank: number;
    file: number;
}

export interface PieceData {
    color: Color;
    type: PieceType;
    position: Position;
    possibleMoves: MovePossibilityData;
    hasMoved?: boolean;
    checksKing?: boolean;
}
