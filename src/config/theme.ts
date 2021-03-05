import {Dimensions} from 'react-native';

const TILE_SIZE = (Dimensions.get('window').width - 80) / 8;

const colors = {
    darkTile: 'brown',
    lightTile: 'white'
};

const theme = {
    TILE_SIZE,
    colors
};

export default theme;
