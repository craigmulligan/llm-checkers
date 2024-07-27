import { useEffect, useState } from "react";
import useClient from "./useClient";
import { LLMDynamicHandle } from "@lmstudio/sdk";

export function useLoadModel(modelPath: string) {
  const client = useClient();
  const [progress, setProgress] = useState(0);
  const [model, setModel] = useState<LLMDynamicHandle>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function load() {
      setProgress(0);
      setModel(undefined);

      let model;
      try {
        model = await client.llm.get({
          path: modelPath,
        });
      } catch (err) {
        // not loaded
        model = await client.llm.load(modelPath, {
          identifier: `llm-checkers-${modelPath}`,
          onProgress: (n) => {
            setProgress(n * 100);
          },
        });
      }

      setModel(model);
    }

    if (modelPath) {
      try {
        load();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          setModel(undefined);
          setProgress(0);
        }
      }
    }
  }, [client, modelPath]);

  return { progress, model, error };
}
