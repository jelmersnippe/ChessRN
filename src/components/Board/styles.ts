import {StyleSheet} from 'react-native';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    board: {
        borderWidth: 1
    },
    rank: {
        flexDirection: 'row'
    },
    square: {
        height: theme.TILE_SIZE,
        width: theme.TILE_SIZE
    }
});

export default styles;
