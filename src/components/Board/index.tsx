import React, {FunctionComponent, useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import Piece from '../Piece';
import PieceData from '../Piece/PieceData';
import {Color, RankData} from '../../constants/piece';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../config/store';
import {setActiveColor, setBoard, setPieces} from '../../reducers/board/actions';
import {fenToJson} from '../../utils/fen';
import {isCheckmate, isKingChecked} from '../../utils/pieceMovement';

const Board: FunctionComponent = () => {
    const gameState = fenToJson('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    // const gameState = fenToJson('rnbqkbnr/1ppQ1pp1/7p/pB2p3/4P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1');

    const board = useSelector((state: RootState) => state.board.board);
    const pieces = useSelector((state: RootState) => state.board.pieces);
    const activeColor = useSelector((state: RootState) => state.board.activeColor);
    const dispatch = useDispatch();

    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);
    const [whiteChecked, setWhiteChecked] = useState<boolean>(false);
    const [blackChecked, setBlackChecked] = useState<boolean>(false);
    const [winner, setWinner] = useState<Color | undefined>(undefined);

    useEffect(() => {
        dispatch(setBoard(gameState.board));
        dispatch(setActiveColor(gameState.activeColor));
        dispatch(setPieces(gameState.pieces));
    }, []);

    useEffect(() => {
        for (const piece of pieces) {
            piece?.updatePossibleMoves(board, pieces);
        }
    }, [pieces, board]);

    useEffect(() => {
        setWhiteChecked(isKingChecked(pieces, Color.WHITE));
        setBlackChecked(isKingChecked(pieces, Color.BLACK));
    }, [pieces]);

    useEffect(() => {
        if (isCheckmate(pieces, Color.WHITE)) {
            setWinner(Color.BLACK);
        }
    }, [whiteChecked]);

    useEffect(() => {
        if (isCheckmate(pieces, Color.BLACK)) {
            setWinner(Color.WHITE);
        }
    }, [blackChecked]);

    const switchActiveColor = () => {
        dispatch(setActiveColor(activeColor === Color.WHITE ? Color.BLACK : Color.WHITE));
    };

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
                console.log(selectedPiece);
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

            console.log(disabled);
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

        dispatch(setBoard([...board]));
        setSelectedPiece(null);

        switchActiveColor();
    };

    const renderPieces = () => {
        return pieces.map((piece, index) => {
            console.log(piece);
            console.log(piece.color === activeColor);
            return piece && (<Piece
                key={`piece${index}`}
                piece={piece}
                interactable={piece.color === activeColor}
                selectAction={(pieceToSelect) => setSelectedPiece(pieceToSelect)}
                capturable={piece.color !== activeColor && !!selectedPiece && !!selectedPiece.possibleMoves?.[piece.boardPosition.y][piece.boardPosition.x]}
                captureAction={(pieceToCapture) => handleCapture(pieceToCapture)}
            />);
        });
    };

    const handleCapture = (pieceToCapture: PieceData) => {
        if (!selectedPiece) {
            return;
        }

        board[pieceToCapture.boardPosition.y][pieceToCapture.boardPosition.x] = null;
        const filteredPieces = pieces.filter((piece) => piece?.boardPosition !== pieceToCapture?.boardPosition);
        dispatch(setPieces([...filteredPieces]));
        commitMovement(pieceToCapture.boardPosition.y, pieceToCapture.boardPosition.x);
    };

    return (
        <>
            {winner && <Text>Winner is {winner}</Text>}
            {whiteChecked && <Text>!WHITE CHECKED!</Text>}
            {blackChecked && <Text>!BLACK CHECKED!</Text>}
            <Text>Currently playing: {activeColor === Color.WHITE ? 'white' : 'black'}</Text>
            <View style={styles.board}>
                {renderRanks()}
                {renderPieces()}
            </View>
        </>
    );
};

export default Board;
