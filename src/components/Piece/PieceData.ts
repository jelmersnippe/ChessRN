import {Animated} from 'react-native';
import {BoardData, Color, PieceType} from '../../constants/piece';
import theme from '../../config/theme';
import {calculatePossibleMoves, checksKing, MovePossibilityData, validateMovesForCheck} from '../../utils/pieceMovement';

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
    possibleMoves: MovePossibilityData = [];
    checksKing: boolean = false;

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

    calculatePossibleMoves(board: BoardData, pieces: { [key in Color]: Array<PieceData> }) {
        this.possibleMoves = calculatePossibleMoves(this, board);
        this.checksKing = checksKing(this, pieces[this.color === Color.WHITE ? Color.BLACK : Color.WHITE]);
    }

    validateMovesForCheck(board: BoardData) {
        this.possibleMoves = validateMovesForCheck(this, board);
    }

    updatePossibleMoves(board: BoardData, pieces: { [key in Color]: Array<PieceData> }) {
        this.calculatePossibleMoves(board, pieces);
        this.validateMovesForCheck(board);
    }
}

export default PieceData;
