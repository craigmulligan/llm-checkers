'use client'
import { useState } from "react";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import ModelLoader from "./ModelLoader";
import useUnloadModels from "../hooks/useUnloadModels";
import ErrorMessage from "./ErrorMessage";
import useCheckers from "../hooks/useCheckers";

export default function Game() {
  const [blackModel, setBlackModel] = useState<LLMDynamicHandle>()
  const [whiteModel, setWhiteModel] = useState<LLMDynamicHandle>()
  const { isPlaying, play, stop } = useCheckers(blackModel, whiteModel)
  const { error } = useUnloadModels(blackModel, whiteModel)


  return (
    <main className="flex min-h-screen w-full">
      <ErrorMessage message={error} />
      <div className="w-1/5">
        <ModelLoader onLoad={setBlackModel} player={"black"} />
      </div>
      <div className="w-3/5">
        <div className="text-center w-full">
          {isPlaying ? <button onClick={stop}>stop</button> : <button onClick={play}>play</button>}
        </div>
      </div>
      <div className="w-1/5">
        <ModelLoader onLoad={setWhiteModel} player={"white"} />
      </div>
    </main>
  );
}
