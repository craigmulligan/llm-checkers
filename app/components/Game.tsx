'use client'
import { useState } from "react";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import ModelLoader from "./ModelLoader";
import useUnloadModels from "../hooks/useUnloadModels";
import ErrorMessage from "./ErrorMessage";
import useCheckers from "../hooks/useCheckers";
import Score from "./Score";
import Loading from "./Loading";

export default function Game() {
  const [blackModel, setBlackModel] = useState<LLMDynamicHandle>()
  const [whiteModel, setWhiteModel] = useState<LLMDynamicHandle>()
  const { isPlaying, play, stop, board, turn, score, error } = useCheckers(blackModel, whiteModel)
  const { error: unloadError } = useUnloadModels(blackModel, whiteModel)


  return (
    <main className="flex h-screen w-full">
      <ErrorMessage message={unloadError} />
      {error && <ErrorMessage message={error} />}
      <div className="w-1/5 flex flex-col justify-between">
        <ModelLoader onLoad={setBlackModel} disabled={isPlaying} player={"black"} />
        {turn === "BLACK" && isPlaying && <div><Loading /></div>}
        <Score score={score.BLACK} />
      </div>
      <div className="w-3/5 flex flex-col">
        <div className="text-center w-full">
          {isPlaying && <div><pre>{board}</pre></div>}
          {isPlaying ? <button onClick={stop}>stop</button> : <button onClick={play}>play</button>}
        </div>
      </div>
      <div className="w-1/5 flex flex-col justify-between">
        <ModelLoader onLoad={setWhiteModel} player={"white"} disabled={isPlaying} />
        {turn === "WHITE" && isPlaying && <div><Loading /> Thinking</div>}
        <Score score={score.WHITE} />
      </div>
    </main>
  );
}
