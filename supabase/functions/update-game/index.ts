import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const checkWinner = (board: (string | null)[]): string | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontales
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticales
    [0, 4, 8], [2, 4, 6] // diagonales
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const checkDraw = (board: (string | null)[]): boolean => {
  return board.every(square => square !== null);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { gameId, board, currentPlayer } = await req.json();

    const winner = checkWinner(board);
    const isDraw = checkDraw(board);
    const status = winner ? 'won' : isDraw ? 'draw' : 'playing';
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';

    const { data: game, error } = await supabaseClient
      .from('games')
      .update({
        board,
        current_player: nextPlayer,
        status,
        winner,
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ game }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 