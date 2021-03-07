import React, {Dispatch, FunctionComponent, useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import Piece from '../Piece';
import PieceData from '../Piece/PieceData';
import {Color, RankData} from '../../constants/piece';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../config/store';
import {fenToJson} from '../../utils/fen';
import {BoardActionTypes, setBoardAction, setInitialStateAction, setPiecesAction} from '../../reducers/board/actions';

const Board: FunctionComponent = () => {
    const gameState = fenToJson('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    // const gameState = fenToJson('rnbqkbnr/1ppQ1pp1/7p/pB2p3/4P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1');

    const {board, pieces, activeColor, checks} = useSelector((state: RootState) => state.board);
    const dispatch = useDispatch<Dispatch<BoardActionTypes>>();

    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);

    useEffect(() => {
        dispatch(setInitialStateAction({
            board: gameState.board,
            pieces: gameState.pieces,
            activeColor: gameState.activeColor,
            castlesAvailable: gameState.castlingPossibilities,
            checks: {
                [Color.WHITE]: false,
                [Color.BLACK]: false
            },
            turns: gameState.fullMoveNumber
        }));
    }, []);

    const renderRanks = (): Array<JSX.Element> => {
        const ranks: Array<JSX.Element> = [];

        for (let i = 0; i < board.length; i++) {
            ranks.push(
                <View key={i} style={styles.rank}>
                    {renderSquares(i, board[i])}
                </View>
            );
        }

        return ranks;
    };

    const renderSquares = (rankIndex: number, rank: RankData): Array<JSX.Element> => {
        const squares: Array<JSX.Element> = [];

        for (let fileIndex = 0; fileIndex < rank.length; fileIndex++) {
            let backgroundColor = (fileIndex + rankIndex) % 2 === 0 ? theme.colors.lightTile : theme.colors.darkTile;
            let disabled = true;

            if (selectedPiece) {
                const isPossibleMove = selectedPiece.possibleMoves?.[rankIndex][fileIndex];
                const isSelectedPiece = selectedPiece.boardPosition.x === fileIndex && selectedPiece?.boardPosition.y === rankIndex;

                if (isPossibleMove) {
                    backgroundColor = 'sandybrown';
                }
                if (isSelectedPiece) {
                    backgroundColor = 'wheat';
                }

                disabled = !isPossibleMove && !isSelectedPiece;
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

    const commitMovement = (rank: number, file: number) => {
        if (!selectedPiece) {
            return;
        }

        const updatedBoard = board;

        updatedBoard[selectedPiece.boardPosition.y][selectedPiece.boardPosition.x] = null;
        updatedBoard[rank][file] = selectedPiece;

        selectedPiece.updatePosition({x: file, y: rank});

        dispatch(setBoardAction([...board]));
        setSelectedPiece(null);
    };

    const renderPieces = () => {
        const keys = Object.keys(pieces) as Array<Color>;
        return keys.map((key) =>
            pieces[key].map((piece, index) => {
                return piece && (<Piece
                    key={`piece${index}`}
                    piece={piece}
                    interactable={piece.color === activeColor}
                    selectAction={(pieceToSelect) => setSelectedPiece(pieceToSelect)}
                    capturable={piece.color !== activeColor && !!selectedPiece && !!selectedPiece.possibleMoves?.[piece.boardPosition.y][piece.boardPosition.x]}
                    captureAction={(pieceToCapture) => handleCapture(pieceToCapture)}
                />);
            })
        );
    };

    const handleCapture = (pieceToCapture: PieceData) => {
        if (!selectedPiece) {
            return;
        }

        board[pieceToCapture.boardPosition.y][pieceToCapture.boardPosition.x] = null;
        const filteredPieces = pieces[pieceToCapture.color].filter((piece) => piece?.boardPosition !== pieceToCapture?.boardPosition);
        dispatch(setPiecesAction({
            pieces: filteredPieces,
            color: pieceToCapture.color
        }));
        commitMovement(pieceToCapture.boardPosition.y, pieceToCapture.boardPosition.x);
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
