import PieceData from '../Piece/PieceData';
import {BoardData, Color} from '../../constants/piece';

export interface Props {
    initialBoard: BoardData;
    pieces: Array<PieceData | null>;
    initialActiveColor: Color;
}
