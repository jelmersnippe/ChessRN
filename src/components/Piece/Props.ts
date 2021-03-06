import PieceData from './PieceData';

export interface Props {
    piece: PieceData;
    interactable: boolean;
    movementAction: (piece: PieceData) => void;
    capturable: boolean;
    captureAction: (piece: PieceData) => void;
}
