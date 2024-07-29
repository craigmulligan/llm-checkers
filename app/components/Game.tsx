'use client'

import { useEffect, useMemo, useState } from "react";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import ModelLoader from "./ModelLoader";
import useUnloadModels from "../hooks/useUnloadModels";
import ErrorMessage from "./ErrorMessage";
import useCheckers from "../hooks/useCheckers";
import Score from "./Score";
import Loading from "./Loading";
import title from '../title'
import useConfetti from "../hooks/useConfetti";


export default function Game() {
  const [blackModel, setBlackModel] = useState<LLMDynamicHandle>()
  const [whiteModel, setWhiteModel] = useState<LLMDynamicHandle>()
  const { isPlaying, play, stop, board, turn, score, error, winner } = useCheckers(blackModel, whiteModel)
  const { error: unloadError } = useUnloadModels(blackModel, whiteModel)
  const confetti = useConfetti()

  const bothModelsLoaded = useMemo(() => {
    return !!blackModel && !!whiteModel
  }, [blackModel, whiteModel])

  // Visual cues for events
  useEffect(() => {
    if (winner) {
      confetti?.addConfetti({
        confettiColors: ['white', 'gray']
      })
    }
  }, [winner, confetti])

  useEffect(() => {
    if (score.BLACK) {
      confetti?.addConfetti({
        confettiColors: ['white', 'gray']
      })
    }
  }, [score.BLACK, confetti])

  useEffect(() => {
    if (score.WHITE) {
      confetti?.addConfetti({
        confettiColors: ['white', 'gray']
      })
    }
  }, [score.WHITE, confetti])


  return (
    <main className="text-center m-4 ">
      <pre><code>{title}</code></pre>
      {(!bothModelsLoaded) && <p>Select each opponents model, then click play!</p>}
      <ErrorMessage message={unloadError} />
      {error && <ErrorMessage message={error} />}
      <div className="flex w-full h-4/5 mt-4 text-center">
        <div className="w-1/5 flex flex-col">
          <h2>Black</h2>
          <ModelLoader onLoad={setBlackModel} disabled={isPlaying} player={"black"} />
          {isPlaying && <Score score={score.BLACK} />}
          {turn === "BLACK" && isPlaying && <div className="flex justify-evenly items-center"><Loading /> Thinking...</div>}
        </div>
        <div className="w-3/5 flex flex-col text-center">
          <div className="mb-4">{isPlaying ? <button className="bg-white text-black px-6 py-1 rounded-sm" onClick={stop}>stop</button> : <button className="bg-white text-black px-6 py-1 rounded-sm" disabled={!bothModelsLoaded} onClick={play}>play</button>}</div>
          {isPlaying && <div><pre>{board}</pre></div>}
          {winner && <div><pre>The winner is {winner}!</pre></div>}
        </div>
        <div className="w-1/5 flex flex-col text-center">
          <h2>White</h2>
          <ModelLoader onLoad={setWhiteModel} player={"white"} disabled={isPlaying} />
          {isPlaying && <Score score={score.WHITE} />}
          {turn === "WHITE" && isPlaying && <div className="flex justify-evenly items-center"><Loading /> Thinking...</div>}
        </div>
      </div>
    </main>
  );
}
