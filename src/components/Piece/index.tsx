import React, {FunctionComponent} from 'react';
import {Animated, Image, TouchableOpacity} from 'react-native';
import styles from './styles';
import {Props} from './Props';
import theme from '../../config/theme';
import {pieceImages} from './pieceImages';

const Piece: FunctionComponent<Props> = ({piece, interactable, selectAction, capturable, captureAction}) => {

    return (
        <Animated.View
            style={{
                ...styles.piece,
                transform: [
                    {translateX: piece.position.file * theme.TILE_SIZE},
                    {translateY: piece.position.rank * theme.TILE_SIZE}
                ]
            }}
        >
            <TouchableOpacity
                style={{flex: 1}}
                onPress={() => {
                    if (interactable) {
                        selectAction(piece);
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
