import ModelSelect from "./ModelSelect";
import { useEffect, useState } from "react";
import ModelLoadProgress from "./Progress";
import { useLoadModel } from "../hooks/useLoadModel";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import ErrorMessage from "./ErrorMessage";

export default function ModelLoader({ onLoad, player }: { onLoad: (model: LLMDynamicHandle) => void, player: string }) {
  const [modelPath, setModelPath] = useState('')
  const { progress, model, error } = useLoadModel(modelPath)

  useEffect(() => {
    if (model) {
      onLoad(model)
    }
  }, [model])

  return (
    <div className="flex flex-col">
      <h2>{player}</h2>
      <ModelSelect onChange={setModelPath} />
      <ErrorMessage message={error} />
      {!!progress && !model && <ModelLoadProgress percent={progress} label={`Loading ${player} model`} />}
      {model && <p>Model is loaded!</p>}
    </div>
  );
}
