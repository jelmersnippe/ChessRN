import React, {FunctionComponent} from 'react';
import {View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import Piece from '../Piece';
import {Props} from './Props';

const Grid: FunctionComponent<Props> = ({grid}) => {

    const renderRows = (grid: Array<Array<string>>): Array<JSX.Element> => {
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
            squares.push(
                <View
                    key={`${rowIndex}-${i}`}
                    style={{
                        ...styles.square,
                        backgroundColor: (i + rowIndex) % 2 === 0 ? theme.colors.lightTile : theme.colors.darkTile
                    }}
                >
                    {row[i] !== '' && <Piece piece={row[i]}/>}
                </View>
            );
        }

        return squares;
    };

    return (
        <View style={styles.grid}>
            {renderRows(grid)}
        </View>
    );
};

export default Grid;
