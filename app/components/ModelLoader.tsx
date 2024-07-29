import ModelSelect from "./ModelSelect";
import { useEffect, useState } from "react";
import ModelLoadProgress from "./Progress";
import { useLoadModel } from "../hooks/useLoadModel";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import ErrorMessage from "./ErrorMessage";

export default function ModelLoader({ onLoad, player, disabled }: { onLoad: (model: LLMDynamicHandle) => void, player: string, disabled: boolean }) {
  const [modelPath, setModelPath] = useState('')
  const { progress, model, error } = useLoadModel(modelPath)

  useEffect(() => {
    if (model) {
      onLoad(model)
    }
  }, [model, onLoad])

  useEffect(() => {
    if (error) {
      // error loading
      // model (unset it.)
      setModelPath('')
    }
  }, [error])

  return (
    <div className="flex flex-col">
      <ModelSelect value={modelPath} onChange={setModelPath} disabled={disabled} label={`Select a model for ${player}`} />
      <ErrorMessage message={error} />
      {!!progress && !model && <ModelLoadProgress percent={progress} label={`Loading ${player} model`} />}
    </div>
  );
}
