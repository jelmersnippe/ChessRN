import {StyleSheet} from 'react-native';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    grid: {
        borderWidth: 1
    },
    row: {
        flexDirection: 'row'
    },
    square: {
        height: theme.TILE_SIZE,
        width: theme.TILE_SIZE
    }
});

export default styles;
