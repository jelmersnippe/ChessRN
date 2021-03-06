import React, {FunctionComponent, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import {Props} from './Props';
import Piece from '../Piece';
import PieceData from '../Piece/PieceData';
import {calculatePossibleMoves} from '../../utils/pieceMovement';

const Grid: FunctionComponent<Props> = ({grid, pieces}) => {
    const [selectedPiece, setSelectedPiece] = useState<PieceData | undefined>(undefined);
    const [possibleMoves, setPossibleMoves] = useState<Array<Array<boolean>> | undefined>(undefined);

    const renderRows = (): Array<JSX.Element> => {
        const rows: Array<JSX.Element> = [];

        for (let i = 0; i < grid.length; i++) {
            rows.push(
                <View key={i} style={styles.row}>
                    {renderSquares(i, grid[i])}
                </View>
            );
        }

        return rows;
    };

    const renderSquares = (rowIndex: number, row: Array<string>): Array<JSX.Element> => {
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
                        selectedPiece?.updatePosition({x: i, y: rowIndex});
                        setSelectedPiece(undefined);
                        setPossibleMoves(undefined);
                    }}
                />
            );
        }

        return squares;
    };

    const renderPieces = () => {
        return pieces.map((piece, index) => <Piece movementAction={(pieceToMove) => handleMovement(pieceToMove)} key={`piece${index}`} piece={piece}/>);
    };

    const handleMovement = (piece: PieceData) => {
        setSelectedPiece(piece);
        console.log('piece:', piece);
        const moves = calculatePossibleMoves(piece, grid);
        setPossibleMoves(moves);
    };

    return (
        <View style={styles.grid}>
            {renderRows()}
            {renderPieces()}
        </View>
    );
};

export default Grid;
