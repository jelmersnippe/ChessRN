import {Animated} from 'react-native';
import {Color, PieceType} from '../../constants/piece';
import theme from '../../config/theme';

class PieceData {
    displayPosition = new Animated.ValueXY();
    boardPosition: {x: number, y: number}
    color: Color;
    type: PieceType;

    constructor(color: Color, type: PieceType, position: {x: number, y: number}) {
        this.color = color;
        this.type = type;
        this.boardPosition = position;
        this.displayPosition.setValue({x: position.x * theme.TILE_SIZE, y: position.y * theme.TILE_SIZE});
    }

    updatePosition(position: {x: number, y: number}) {
        this.boardPosition = position;
        Animated.timing(this.displayPosition, {
            toValue: {x: position.x * theme.TILE_SIZE, y: position.y * theme.TILE_SIZE},
            duration: 150,
            useNativeDriver: true
        }).start();
    }
}

export default PieceData;
