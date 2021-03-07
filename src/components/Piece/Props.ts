import {PieceData} from './PieceData';

export interface Props {
    piece: PieceData;
    interactable: boolean;
    selectAction: (pieceToSelect: PieceData) => void;
    capturable: boolean;
    captureAction: (pieceToCapture: PieceData) => void;
}
