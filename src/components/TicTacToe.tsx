import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

type Player = 'X' | 'O' | null;
type GameStatus = 'playing' | 'won' | 'draw';

interface GameState {
  board: Player[];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player;
  winningLine?: number[];
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontales
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticales
  [0, 4, 8], [2, 4, 6] // diagonales
];

function checkWinner(squares: Player[]): { winner: Player, line: number[] | null } {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
}

function checkDraw(squares: Player[]): boolean {
  return squares.every(square => square !== null);
}

export default function TicTacToe() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    winningLine: undefined,
  });
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetGame = () => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'playing',
      winner: null,
      winningLine: undefined,
    });
    setError(null);
  };

  const startNewGame = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-game', {
        body: { player: 'X' }
      });
      
      if (error) throw error;
      
      setGameId(data.gameId);
      resetGame();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (index: number) => {
    if (gameState.board[index] || gameState.status !== 'playing' || loading) {
      return;
    }

    setLoading(true);
    try {
      const newBoard = [...gameState.board];
      newBoard[index] = gameState.currentPlayer;

      const { winner, line } = checkWinner(newBoard);
      const isDraw = checkDraw(newBoard);

      setGameState(prevState => ({
        board: newBoard,
        currentPlayer: prevState.currentPlayer === 'X' ? 'O' : 'X',
        status: winner ? 'won' : isDraw ? 'draw' : 'playing',
        winner,
        winningLine: line || undefined,
      }));

      try {
        if (gameId) {
          await supabase.functions.invoke('update-game', {
            body: {
              gameId,
              board: newBoard,
              currentPlayer: gameState.currentPlayer
            }
          });
        }
      } catch (supabaseError) {
        console.error('Error al actualizar en Supabase:', supabaseError);
      }
    } catch (error: any) {
      setError(error.message);
      setGameState(prevState => ({
        ...prevState,
        board: [...prevState.board],
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const renderSquare = (index: number) => {
    const isWinning = gameState.winningLine?.includes(index);
    return (
      <button
        key={index}
        className={`w-24 h-24 md:w-28 md:h-28 text-5xl font-extrabold border-4 rounded-lg transition-all duration-200
          ${isWinning ? 'bg-green-300 border-green-600 scale-110 shadow-xl' : 'bg-white border-gray-300'}
          ${gameState.board[index] ? (gameState.board[index] === 'X' ? 'text-blue-600' : 'text-pink-500') : 'text-gray-400'}
          ${loading || gameState.status !== 'playing' ? 'cursor-not-allowed opacity-60' : 'hover:bg-blue-50 cursor-pointer'}`}
        onClick={() => handleClick(index)}
        disabled={!!gameState.board[index] || gameState.status !== 'playing' || loading}
      >
        {gameState.board[index]}
      </button>
    );
  };

  const getStatusMessage = () => {
    if (gameState.status === 'won') {
      return (
        <div className="text-center bg-white/90 p-4 rounded-xl shadow-lg">
          <span className="text-red-700 font-extrabold text-5xl animate-bounce block mb-3">
            ¡GANADOR!
          </span>
          <span className={`text-4xl font-bold block mb-2 ${gameState.winner === 'X' ? 'text-blue-600' : 'text-pink-500'}`}>
            Jugador {gameState.winner}
          </span>
          <span className="text-red-500 text-3xl font-semibold">
            ¡Ha ganado la partida!
          </span>
        </div>
      );
    }
    if (gameState.status === 'draw') {
      return (
        <div className="text-center bg-white/90 p-4 rounded-xl shadow-lg">
          <span className="text-yellow-600 font-bold text-4xl">¡EMPATE!</span>
        </div>
      );
    }
    return (
      <div className="text-center bg-white/90 p-4 rounded-xl shadow-lg">
        <span className="text-gray-800 text-2xl">Próximo jugador: </span>
        <span className={`text-3xl font-bold ${gameState.currentPlayer === 'X' ? 'text-blue-600' : 'text-pink-500'}`}>
          Jugador {gameState.currentPlayer}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500 drop-shadow-lg">
            Ta Te Ti
          </h2>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}
        
        <div className="flex justify-center mb-6">
          {getStatusMessage()}
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/80 p-6 rounded-2xl shadow-2xl border-2 border-blue-200 mx-auto">
          {Array(9).fill(null).map((_, index) => renderSquare(index))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={resetGame}
            className="w-full max-w-xs py-3 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:from-pink-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Nuevo Juego'}
          </button>
        </div>
      </div>
    </div>
  );
} 