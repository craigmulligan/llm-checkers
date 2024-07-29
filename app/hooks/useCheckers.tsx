import { LLMDynamicHandle } from "@lmstudio/sdk";
import { useCallback, useEffect, useState } from "react";

import { CheckersBoard, DeadLockError, Move, Player, Score } from "../lib/checkers";
import { generateMove, MoveError } from "../lib/llm";


export default function useCheckers(
  blackModel: LLMDynamicHandle | undefined,
  whiteModel: LLMDynamicHandle | undefined,
) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState<Score>({ BLACK: 0, WHITE: 0 })
  const [turn, setTurn] = useState<Player>('BLACK')
  const [board, setBoard] = useState('')
  const [error, setError] = useState('')
  const [winner, setWinner] = useState<Player | undefined>()

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    async function play() {
      if (!blackModel || !whiteModel) {
        setError("Both play models must be loaded")
        setIsPlaying(false)
        return
      }

      let gameWinner: Player | undefined
      let moveError: MoveError | undefined;

      const checkers = new CheckersBoard();
      setBoard(checkers.printBoard())

      while (!gameWinner && isPlaying) {
        const model = checkers.turn === "BLACK" ? blackModel : whiteModel
        const move = await generateMove(model, checkers, moveError);

        try {
          checkers.movePiece(move.from, move.to);

          setScore(checkers.score)
          setTurn(checkers.turn)
          setBoard(checkers.printBoard())

          if (checkers.hasWon()) {
            gameWinner = checkers.turn
            break;
          }

          moveError = undefined;
        } catch (err) {
          if (err instanceof DeadLockError) {
            // Opponent wins no possible turns
            // for current turn
            gameWinner = checkers.turn === "BLACK" ? "WHITE" : "BLACK"
            break;
          }

          moveError = {
            message: err?.toString() || "UNKOWN",
            previous: move,
          };
        }
      }

      setWinner(gameWinner)
    }

    if (isPlaying) {
      setError('')
      play()
    }

    return () => {
      // Reset the defaults.
      setBoard('')
      setTurn('BLACK')
      setScore({ BLACK: 0, WHITE: 0 })
    }
  }, [isPlaying, blackModel, whiteModel])

  return { isPlaying, play, stop, score, turn, board, error, winner }
}
