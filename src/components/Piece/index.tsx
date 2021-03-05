import React, {FunctionComponent} from 'react';
import {Image, View} from 'react-native';
import styles from './styles';
import {Props} from './Props';
import {pieceImages} from '../../constants/piece';

const Piece: FunctionComponent<Props> = ({piece}) => {

    return (
        <View style={styles.piece}>
            <Image
                style={styles.image}
                resizeMethod={'resize'}
                source={pieceImages[piece]}
            />
        </View>
    );
};

export default Piece;
