import React, {FunctionComponent} from 'react';
import {Animated, Image, TouchableOpacity} from 'react-native';
import styles from './styles';
import {Props} from './Props';
import {pieceImages} from '../../constants/piece';

const Piece: FunctionComponent<Props> = ({piece, interactable, movementAction, capturable, captureAction}) => {

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
                    if (interactable) {
                        movementAction(piece);
                    } else if (capturable) {
                        captureAction(piece);
                    }
                }}
                disabled={!interactable && !capturable}
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
