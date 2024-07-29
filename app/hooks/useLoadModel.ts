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
      setModel(undefined);

      let model;
      try {
        model = await client.llm.get({
          path: modelPath,
        });
      } catch (err) {
        // not loaded
        try {
          model = await client.llm.load(modelPath, {
            identifier: `llm-checkers-${modelPath}`,
            onProgress: (n) => {
              setProgress(n * 100);
            },
          });
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          }
        }
      }

      setProgress(0);
      setModel(model);
    }

    if (modelPath) {
      setError("");
      load();
    }
  }, [client, modelPath]);

  return { progress, model, error };
}
