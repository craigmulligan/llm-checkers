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
    <main className="text-center h-screen m-4">
      <h1 className="text-3xl m-4">LLM Checkers</h1>
      <ErrorMessage message={unloadError} />
      {error && <ErrorMessage message={error} />}
      <div className="flex w-full h-4/5">
        <div className="w-1/5 flex flex-col">
          <h2>Black</h2>
          <ModelLoader onLoad={setBlackModel} disabled={isPlaying} player={"black"} />
          {turn === "BLACK" && isPlaying && <div><Loading /></div>}
          <Score score={score.BLACK} />
        </div>
        <div className="w-3/5 flex flex-col text-center justify-between">
          {(!blackModel || !whiteModel) && <p>Select each opponents model, then click play!</p>}
          {isPlaying && <div><pre>{board}</pre></div>}
          <div>{isPlaying ? <button onClick={stop}>stop</button> : <button onClick={play}>play</button>}</div>
        </div>
        <div className="w-1/5 flex flex-col justify-between">
          <h2>White</h2>
          <ModelLoader onLoad={setWhiteModel} player={"white"} disabled={isPlaying} />
          {turn === "WHITE" && isPlaying && <div><Loading /> Thinking</div>}
          <Score score={score.WHITE} />
        </div>
      </div>
    </main>
  );
}
