import {Animated} from 'react-native';
import {Color, PieceType} from '../../constants/piece';
import theme from '../../config/theme';

export interface Position {
    x: number;
    y: number;
}

class PieceData {
    displayPosition = new Animated.ValueXY();
    boardPosition: Position;
    color: Color;
    type: PieceType;

    constructor(color: Color, type: PieceType, position: Position) {
        this.color = color;
        this.type = type;
        this.boardPosition = position;
        this.displayPosition.setValue({x: position.x * theme.TILE_SIZE, y: position.y * theme.TILE_SIZE});
    }

    updatePosition(position: Position) {
        this.boardPosition = position;
        Animated.timing(this.displayPosition, {
            toValue: {x: position.x * theme.TILE_SIZE, y: position.y * theme.TILE_SIZE},
            duration: 150,
            useNativeDriver: true
        }).start();
    }
}

export default PieceData;
