import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text} from 'react-native';
import Board from './components/Board';
import {Provider} from 'react-redux';
import store from './config/store';

const App = () => {
    return (
        <Provider store={store}>
            <StatusBar barStyle={'dark-content'}/>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>ChessRN</Text>
                <Board/>
            </SafeAreaView>
        </Provider>
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
