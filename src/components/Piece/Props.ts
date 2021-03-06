import PieceData from './PieceData';

export interface Props {
    piece: PieceData;
    movementAction: (piece: PieceData) => void;
    interactable: boolean;
}
