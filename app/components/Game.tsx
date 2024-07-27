'use client'
import { useState } from "react";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import ModelLoader from "./ModelLoader";
import useUnloadModels from "../hooks/useUnloadModels";
import ErrorMessage from "./ErrorMessage";

export default function Game() {
  const [blackModel, setBlackModel] = useState<LLMDynamicHandle>()
  const [whiteModel, setWhiteModel] = useState<LLMDynamicHandle>()
  const { error } = useUnloadModels(blackModel, whiteModel)


  return (
    <main className="flex min-h-screen items-center justify-between p-24">
      <ErrorMessage message={error} />
      <ModelLoader onLoad={setBlackModel} player={"black"} />
      <ModelLoader onLoad={setWhiteModel} player={"white"} />
    </main>
  );
}
