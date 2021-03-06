import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text} from 'react-native';
import Board from './components/Board';
import {fenToJson} from './utils/fen';

const App = () => {
    const gameState = fenToJson('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    // const gameState = fenToJson('rnbqkbnr/1ppQ1pp1/7p/pB2p3/4P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1');

    return (
        <>
            <StatusBar barStyle={'dark-content'}/>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>ChessRN</Text>
                <Board
                    initialBoard={gameState.board}
                    initialPieces={gameState.pieces}
                    initialActiveColor={gameState.activeColor}
                />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15
    }
});

export default App;
