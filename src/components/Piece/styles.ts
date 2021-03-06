import {StyleSheet} from 'react-native';
import theme from '../../config/theme';

const styles = StyleSheet.create({
    piece: {
        flex: 1,
        justifyContent: 'center',
        position: 'absolute',
        width: theme.TILE_SIZE,
        height: theme.TILE_SIZE
    },
    image: {
        width: '100%',
        height: '100%'
    }
});

export default styles;
