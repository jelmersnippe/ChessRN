import React, {FunctionComponent, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles';
import theme from '../../config/theme';
import {Props} from './Props';
import Piece from '../Piece';
import PieceData from '../Piece/PieceData';
import {calculatePossibleMoves} from '../../utils/pieceMovement';
import {BoardData, Color, RankData} from '../../constants/piece';

const Board: FunctionComponent<Props> = ({initialBoard, pieces, initialActiveColor}) => {
    const [board, setBoard] = useState<BoardData>(initialBoard);
    const [activeColor, setActiveColor] = useState<Color>(initialActiveColor);
    const [selectedPiece, setSelectedPiece] = useState<PieceData | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Array<Array<boolean>> | undefined>(undefined);

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
            const isPossibleMove = possibleMoves?.[rankIndex][fileIndex];
            const isSelectedPiece = selectedPiece?.boardPosition.x === fileIndex && selectedPiece?.boardPosition.y === rankIndex;

            let backgroundColor = (fileIndex + rankIndex) % 2 === 0 ? theme.colors.lightTile : theme.colors.darkTile;

            if (isPossibleMove) {
                backgroundColor = 'sandybrown';
            }
            if (isSelectedPiece) {
                backgroundColor = 'wheat';
            }

            squares.push(
                <TouchableOpacity
                    disabled={!selectedPiece || !isPossibleMove || isSelectedPiece}
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
        if (selectedPiece) {
            board[selectedPiece.boardPosition.y][selectedPiece.boardPosition.x] = null;
            board[rank][file] = selectedPiece;
            setBoard([...board]);

            selectedPiece?.updatePosition({x: file, y: rank});
            setSelectedPiece(null);
            setPossibleMoves(undefined);

            switchActiveColor();
        }
    };

    const renderPieces = () => {
        return pieces.map((piece, index) =>
            piece &&
            <Piece
                key={`piece${index}`}
                movementAction={(pieceToMove) => handleMovement(pieceToMove)}
                piece={piece}
                interactable={piece.color === activeColor}
            />);
    };

    const handleMovement = (piece: PieceData) => {
        if (board) {
            setSelectedPiece(piece);
            console.log('piece:', piece);
            console.log('board:', board);
            const moves = calculatePossibleMoves(piece, board);
            setPossibleMoves(moves);
        }
    };

    return (
        <View style={styles.board}>
            {renderRanks()}
            {renderPieces()}
        </View>
    );
};

export default Board;
