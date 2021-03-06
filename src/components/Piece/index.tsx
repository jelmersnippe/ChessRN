import React, {FunctionComponent} from 'react';
import {Animated, Image, TouchableOpacity} from 'react-native';
import styles from './styles';
import {Props} from './Props';
import {pieceImages} from '../../constants/piece';

const Piece: FunctionComponent<Props> = ({piece, movementAction}) => {

    return (
        <Animated.View
            style={{
                ...styles.piece,
                transform: [
                    {translateX: piece.displayPosition.x},
                    {translateY: piece.displayPosition.y}
                ]
            }}
        >
            <TouchableOpacity
                style={{flex: 1}}
                onPress={() => {
                    movementAction(piece);
                }}
            >
                <Image
                    style={styles.image}
                    resizeMethod={'resize'}
                    source={pieceImages[piece.color][piece.type]}
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default Piece;
