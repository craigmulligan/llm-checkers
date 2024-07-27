import useClient from "./useClient";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import { useEffect, useState } from "react";

export default function useUnloadModels(
  blackModel: LLMDynamicHandle | undefined,
  whiteModel: LLMDynamicHandle | undefined,
) {
  const client = useClient();
  const [error, setError] = useState("");

  useEffect(() => {
    async function unload() {
      // NOTE: There maybe models loaded
      // from other apps we don't want to interfere
      // so we look for out identifier
      // denoted with llm-checkers
      const loadedModels = await client.llm.listLoaded();

      const checkersLoadedModels = loadedModels.filter((m) =>
        m.identifier.startsWith("llm-checkers"),
      );

      console.log(
        "attempting to unload models",
        checkersLoadedModels?.map((m) => m?.path),
      );
      // To conserve memory
      // we want to automatically unload any of the models
      // that are currently not used.
      if (checkersLoadedModels?.length) {
        try {
          const usedModelsInfo = await Promise.all(
            [blackModel, whiteModel]
              .filter((m) => !!m)
              .map((m) => {
                return m.getModelInfo();
              }),
          );

          const unusedModels = checkersLoadedModels.filter((d) => {
            return !usedModelsInfo.some((m) => m?.path === d.path);
          });

          await Promise.all(
            unusedModels.map((m) => client.llm.unload(m.identifier)),
          );
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          }
        }
      }
    }

    unload();
  }, [blackModel, whiteModel]);

  return { error };
}
