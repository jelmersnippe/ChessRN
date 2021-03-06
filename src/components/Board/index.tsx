import React, {FunctionComponent, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import {Props} from './Props';
import Piece from '../Piece';
import PieceData from '../Piece/PieceData';
import {calculatePossibleMoves} from '../../utils/pieceMovement';
import {RowData} from '../../constants/piece';

const Board: FunctionComponent<Props> = ({initialBoard, pieces}) => {
    const [board, setBoard] = useState(initialBoard);
    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Array<Array<boolean>> | undefined>(undefined);

    const renderRows = (): Array<JSX.Element> => {
        const rows: Array<JSX.Element> = [];

        for (let i = 0; i < board.length; i++) {
            rows.push(
                <View key={i} style={styles.row}>
                    {renderSquares(i, board[i])}
                </View>
            );
        }

        return rows;
    };

    const renderSquares = (rowIndex: number, row: RowData): Array<JSX.Element> => {
        const squares: Array<JSX.Element> = [];

        for (let i = 0; i < row.length; i++) {
            const isPossibleMove = possibleMoves?.[rowIndex][i];
            const isSelectedPiece = selectedPiece?.boardPosition.x === i && selectedPiece?.boardPosition.y === rowIndex;

            let backgroundColor = (i + rowIndex) % 2 === 0 ? theme.colors.lightTile : theme.colors.darkTile;

            if (isPossibleMove) {
                backgroundColor = 'sandybrown';
            }
            if (isSelectedPiece) {
                backgroundColor = 'wheat';
            }

            squares.push(
                <TouchableOpacity
                    disabled={!selectedPiece || !isPossibleMove || isSelectedPiece}
                    key={`${rowIndex}-${i}`}
                    style={{
                        ...styles.square,
                        backgroundColor: backgroundColor
                    }}
                    onPress={() => {
                        if (selectedPiece) {
                            const updatedBoard = board;
                            updatedBoard[selectedPiece.boardPosition.y][selectedPiece.boardPosition.x] = null;
                            updatedBoard[rowIndex][i] = selectedPiece;
                            setBoard([...updatedBoard]);

                            selectedPiece?.updatePosition({x: i, y: rowIndex});
                            setSelectedPiece(null);
                            setPossibleMoves(undefined);
                        }
                    }}
                />
            );
        }

        return squares;
    };

    const renderPieces = () => {
        return pieces.map((piece, index) =>
            piece &&
            <Piece
                key={`piece${index}`}
                movementAction={(pieceToMove) => handleMovement(pieceToMove)}
                piece={piece}
            />);
    };

    const handleMovement = (piece: PieceData) => {
        setSelectedPiece(piece);
        console.log('piece:', piece);
        console.log('board:', board);
        const moves = calculatePossibleMoves(piece, board);
        setPossibleMoves(moves);
    };

    return (
        <View style={styles.board}>
            {renderRows()}
            {renderPieces()}
        </View>
    );
};

export default Board;
