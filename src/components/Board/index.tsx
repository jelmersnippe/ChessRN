import React, {Dispatch, FunctionComponent, useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import Piece from '../Piece';
import {PieceData} from '../Piece/PieceData';
import {Color, RankData} from '../../constants/piece';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../config/store';
import {BoardActionTypes, commitMovementAction, setInitialStateAction} from '../../reducers/board/actions';
import {createPiecesListFromBoard} from '../../utils/fen';
import {Move} from '../../utils/moveGeneration';
import isEqual from 'lodash.isequal';

const Board: FunctionComponent = () => {
    const fenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    // const fenString = '1k6/8/8/2Q2K2/8/8/8/8 w - - 0 1';
    // const gameState = fenToJson('rnbqkbnr/1ppQ1pp1/7p/pB2p3/4P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1');

    const {board, possibleMoves, activeColor, checks} = useSelector((state: RootState) => state.board);
    const dispatch = useDispatch<Dispatch<BoardActionTypes>>();

    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);
    const [possibleMovesForSelectedPiece, setPossibleMovesForSelectedPiece] = useState<Array<Move> | null>([]);

    useEffect(() => {
        if (board.length === 0) {
            dispatch(setInitialStateAction(fenString));
        }
    }, [board]);

    useEffect(() => {
        if (selectedPiece) {
            const possibleMovesForPiece = possibleMoves[activeColor].filter((move) => isEqual(move.startingSquare, selectedPiece?.position));
            setPossibleMovesForSelectedPiece([...possibleMovesForPiece]);
        }
    }, [selectedPiece]);

    const renderRanks = (): JSX.Element => {
        if (!board) {
            return <View/>;
        }

        const ranks: Array<JSX.Element> = [];

        for (let i = 0; i < board.length; i++) {
            ranks.push(
                <View key={i} style={styles.rank}>
                    {renderSquares(i, board[i])}
                </View>
            );
        }

        return (
            <>
                {ranks}
            </>
        );
    };

    const renderSquares = (rankIndex: number, rank: RankData): Array<JSX.Element> => {
        const squares: Array<JSX.Element> = [];

        for (let fileIndex = 0; fileIndex < rank.length; fileIndex++) {
            let backgroundColor = (fileIndex + rankIndex) % 2 === 0 ? theme.colors.lightTile : theme.colors.darkTile;
            let disabled = true;

            if (selectedPiece) {
                const isPossibleMove = possibleMovesForSelectedPiece?.some((move) => isEqual({
                    rank: rankIndex,
                    file: fileIndex
                }, move.targetSquare));
                const isSelectedPiece = selectedPiece.position.file === fileIndex && selectedPiece.position.rank === rankIndex;

                if (isPossibleMove) {
                    backgroundColor = 'sandybrown';
                }
                if (isSelectedPiece) {
                    backgroundColor = 'wheat';
                }

                disabled = !isPossibleMove || isSelectedPiece;
            }

            squares.push(
                <TouchableOpacity
                    disabled={disabled}
                    key={`${rankIndex}-${fileIndex}`}
                    style={{
                        ...styles.square,
                        backgroundColor: backgroundColor
                    }}
                    onPress={() => commitMovement(rankIndex, fileIndex)}
                />
            );
        }

        return squares;
    };

    const renderPieces = () => {
        if (!board) {
            return;
        }

        const pieces = createPiecesListFromBoard(board);
        const keys = Object.keys(pieces) as Array<Color>;
        return keys.map((key) =>
            pieces[key].map((piece, index) => {
                return piece && (<Piece
                    key={`piece${index}`}
                    piece={piece}
                    interactable={piece.color === activeColor}
                    selectAction={(pieceToSelect) => setSelectedPiece(pieceToSelect)}
                    capturable={piece.color !== activeColor && !!selectedPiece &&
                    !!possibleMovesForSelectedPiece?.some((move) => isEqual(piece.position, move.targetSquare))}
                    captureAction={(pieceToCapture) => commitMovement(pieceToCapture.position.rank, pieceToCapture.position.file)}
                />);
            })
        );
    };

    const commitMovement = (rank: number, file: number) => {
        if (!selectedPiece) {
            return;
        }

        dispatch(commitMovementAction({piece: selectedPiece, position: {rank, file}}));
        setSelectedPiece(null);
        setPossibleMovesForSelectedPiece(null);
    };

    return (
        <>
            {checks[Color.WHITE] && <Text>White = {checks[Color.WHITE]}!</Text>}
            {checks[Color.BLACK] && <Text>Black = {checks[Color.BLACK]}!</Text>}
            <Text>Currently playing: {activeColor === Color.WHITE ? 'white' : 'black'}</Text>
            <View style={styles.board}>
                {renderRanks()}
                {renderPieces()}
            </View>
        </>
    );
};

export default Board;
