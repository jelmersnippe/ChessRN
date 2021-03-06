import React, {FunctionComponent, useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import {Props} from './Props';
import Piece from '../Piece';
import PieceData from '../Piece/PieceData';
import {BoardData, Color, RankData} from '../../constants/piece';
import {isCheckmate, isKingChecked} from '../../utils/pieceMovement';

const Board: FunctionComponent<Props> = ({initialBoard, initialPieces, initialActiveColor}) => {
    const [board, setBoard] = useState<BoardData>(initialBoard);
    const [pieces, setPieces] = useState<Array<PieceData>>(initialPieces);
    const [activeColor, setActiveColor] = useState<Color>(initialActiveColor);
    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);
    const [whiteChecked, setWhiteChecked] = useState<boolean>(false);
    const [blackChecked, setBlackChecked] = useState<boolean>(false);
    const [winner, setWinner] = useState<Color | undefined>(undefined);

    useEffect(() => {
        setWhiteChecked(false);
        setBlackChecked(false);
        for (const piece of pieces) {
            piece?.updatePossibleMoves(board, pieces);
        }
        if (isKingChecked(pieces, Color.WHITE)) {
            setWhiteChecked(true);
            if (isCheckmate(pieces, Color.WHITE)) {
                setWinner(Color.BLACK);
            }
        }
        if (isKingChecked(pieces, Color.BLACK)) {
            setBlackChecked(true);
            if (isCheckmate(pieces, Color.BLACK)) {
                setWinner(Color.WHITE);
            }
        }
    }, [board]);

    const switchActiveColor = () => {
        setActiveColor(activeColor === Color.WHITE ? Color.BLACK : Color.WHITE);
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
                const isPossibleMove = selectedPiece.possibleMoves?.[rankIndex][fileIndex];
                const isSelectedPiece = selectedPiece?.boardPosition.x === fileIndex && selectedPiece?.boardPosition.y === rankIndex;

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

        setBoard([...board]);
        setSelectedPiece(null);

        switchActiveColor();
    };

    const renderPieces = () => {
        return pieces.map((piece, index) =>
            piece &&
            <Piece
                key={`piece${index}`}
                piece={piece}
                interactable={piece.color === activeColor}
                selectAction={(pieceToSelect) => setSelectedPiece(pieceToSelect)}
                capturable={piece.color !== activeColor && !!selectedPiece && !!selectedPiece.possibleMoves?.[piece.boardPosition.y][piece.boardPosition.x]}
                captureAction={(pieceToCapture) => handleCapture(pieceToCapture)}
            />);
    };

    const handleCapture = (pieceToCapture: PieceData) => {
        if (!selectedPiece) {
            return;
        }

        board[pieceToCapture.boardPosition.y][pieceToCapture.boardPosition.x] = null;
        const filteredPieces = pieces.filter((piece) => piece?.boardPosition !== pieceToCapture?.boardPosition);
        setPieces([...filteredPieces]);
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
