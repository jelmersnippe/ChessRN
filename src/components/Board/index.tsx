import React, {Dispatch, FunctionComponent, useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import Piece from '../Piece';
import {PieceData} from '../Piece/PieceData';
import {Color, PieceType, RankData} from '../../constants/piece';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../config/store';
import {BoardActionTypes, setBoardAction, setInitialStateAction, setPiecesAction} from '../../reducers/board/actions';
import {createDuplicateBoard, createPiecesListFromBoard} from '../../utils/fen';

const Board: FunctionComponent = () => {
    const fenString = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    // const gameState = fenToJson('rnbqkbnr/1ppQ1pp1/7p/pB2p3/4P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1');

    const {board, activeColor, checks} = useSelector((state: RootState) => state.board);
    const dispatch = useDispatch<Dispatch<BoardActionTypes>>();

    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);

    useEffect(() => {
        if (!board) {
            dispatch(setInitialStateAction(fenString));
        }
    }, [board]);

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
                const isPossibleMove = selectedPiece.possibleMoves?.[rankIndex][fileIndex].valid;
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

    const commitMovement = (rank: number, file: number) => {
        if (!selectedPiece || !board) {
            return;
        }

        const updatedBoard = createDuplicateBoard(board);

        const oldPosition = {rank: selectedPiece.position.rank, file: selectedPiece.position.file};
        updatedBoard[selectedPiece.position.rank][selectedPiece.position.file] = null;
        updatedBoard[rank][file] = selectedPiece;

        // TODO: Add animated movement back into Piece display
        //         Animated.timing(this.displayPosition, {
        //             toValue: {x: position.x * theme.TILE_SIZE, y: position.y * theme.TILE_SIZE},
        //             duration: 150,
        //             useNativeDriver: true
        //         }).start();
        selectedPiece.hasMoved = true;
        selectedPiece.position = {rank, file};

        // Castle move
        if (selectedPiece.type === PieceType.KING && Math.abs(oldPosition.file - file) > 1) {
            const currentRookFile = file < 4 ? 0 : 7;
            const rook = updatedBoard[rank][currentRookFile];

            if (!rook) {
                return;
            }

            const newRookFile = file < 4 ? file + 1 : file - 1;

            updatedBoard[rank][currentRookFile] = null;
            updatedBoard[rank][newRookFile] = rook;
            rook.hasMoved = true;
            rook.position = {rank: rank, file: newRookFile};
        }

        dispatch(setBoardAction([...updatedBoard]));
        setSelectedPiece(null);
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
                    capturable={piece.color !== activeColor && !!selectedPiece && !!selectedPiece.possibleMoves?.[piece.position.rank][piece.position.file].valid}
                    captureAction={(pieceToCapture) => handleCapture(pieceToCapture)}
                />);
            })
        );
    };

    const handleCapture = (pieceToCapture: PieceData) => {
        if (!selectedPiece || !board) {
            return;
        }
        const pieces = createPiecesListFromBoard(board);
        board[pieceToCapture.position.rank][pieceToCapture.position.file] = null;
        const filteredPieces = pieces[pieceToCapture.color].filter((piece) => piece?.position !== pieceToCapture?.position);
        dispatch(setPiecesAction({
            pieces: filteredPieces,
            color: pieceToCapture.color
        }));

        commitMovement(pieceToCapture.position.rank, pieceToCapture.position.file);
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
