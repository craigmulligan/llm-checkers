import { LMStudioClient } from "@lmstudio/sdk";
import { useRef } from "react";

export default function useClient() {
  // Singleton client.
  const ref = useRef<LMStudioClient>();

  if (!ref.current) {
    ref.current = new LMStudioClient();
  }

  return ref.current;
}
