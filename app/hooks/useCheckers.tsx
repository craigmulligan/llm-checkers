import { LLMDynamicHandle } from "@lmstudio/sdk";
import { useCallback, useState } from "react";

export default function useCheckers(
  blackModel: LLMDynamicHandle | undefined,
  whiteModel: LLMDynamicHandle | undefined,
) {
  const [isPlaying, setIsPlaying] = useState(false)

  const play = useCallback(() => {
    if (!blackModel || !whiteModel) {
      throw new Error("Both models need to be loaded.")
    }

    setIsPlaying(true)


  }, [blackModel, whiteModel])

  const stop = useCallback(() => {
    setIsPlaying(false)
  }, [])

  return { isPlaying, play, stop }
}
