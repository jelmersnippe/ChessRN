import {Animated} from 'react-native';
import {BoardData, Color, PieceType} from '../../constants/piece';
import theme from '../../config/theme';
import {calculatePossibleMoves} from '../../utils/pieceMovement';

export interface Position {
    x: number;
    y: number;
}

class PieceData {
    displayPosition = new Animated.ValueXY();
    boardPosition: Position;
    color: Color;
    type: PieceType;
    hasMoved: boolean = false;
    possibleMoves: Array<Array<boolean>> | undefined = undefined;

    constructor(color: Color, type: PieceType, position: Position) {
        this.color = color;
        this.type = type;
        this.boardPosition = position;
        this.displayPosition.setValue({x: position.x * theme.TILE_SIZE, y: position.y * theme.TILE_SIZE});
    }

    updatePosition(position: Position) {
        this.hasMoved = true;
        this.boardPosition = position;
        Animated.timing(this.displayPosition, {
            toValue: {x: position.x * theme.TILE_SIZE, y: position.y * theme.TILE_SIZE},
            duration: 150,
            useNativeDriver: true
        }).start();
    }

    setPossibleMoves(possibleMoves: Array<Array<boolean>>) {
        this.possibleMoves = possibleMoves;
    }

    calculatePossibleMoves(board: BoardData) {
        const moves = calculatePossibleMoves(this, board);
        this.setPossibleMoves(moves);
    }
}

export default PieceData;
