import {BoardData, Color} from '../../constants/piece';
import {Move} from '../../utils/moveGeneration';
import {Position} from '../../components/Piece/PieceData';
import {CheckedState} from '../../utils/pieceMovement';

export interface BoardState {
    board: BoardData;
    possibleMoves: { [key in Color]: Array<Move> };
    activeColor: Color;
    castlesAvailable: CastlingAvailability;
    enPassant?: Position;
    checks: { [key in Color]: CheckedState | false };
    turns: number;
}

export type CastlingAvailability = {
    [key in Color]: {
        queenSide: boolean;
        kingSide: boolean;
    }
}
