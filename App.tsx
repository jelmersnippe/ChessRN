import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text} from 'react-native';

const App = () => {
    return (
        <>
            <StatusBar barStyle={'dark-content'}/>
            <SafeAreaView style={styles.container}>
                <Text>ChessRN</Text>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default App;
