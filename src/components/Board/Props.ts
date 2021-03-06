import PieceData from '../Piece/PieceData';
import {BoardData} from '../../constants/piece';

export interface Props {
    board: BoardData;
    pieces: Array<PieceData | null>;
}
