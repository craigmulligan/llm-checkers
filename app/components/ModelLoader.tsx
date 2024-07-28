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

  return (
    <div className="flex flex-col">
      <ModelSelect onChange={setModelPath} disabled={disabled} />
      <ErrorMessage message={error} />
      {!!progress && !model && <ModelLoadProgress percent={progress} label={`Loading ${player} model`} />}
    </div>
  );
}
