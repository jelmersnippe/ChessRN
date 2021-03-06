import PieceData from '../Piece/PieceData';
import {BoardData} from '../../constants/piece';

export interface Props {
    initialBoard: BoardData;
    pieces: Array<PieceData | null>;
}
