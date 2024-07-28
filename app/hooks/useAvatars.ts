import { useState } from "react";

export default function useCheckers(
  blackModel: LLMDynamicHandle | undefined,
  whiteModel: LLMDynamicHandle | undefined,
) {
  const [loading, setLoading] = useState(false);
  const [blackAvatar, setBlackAvatar] = useState("");
  const [whiteAvatar, setWhiteAvatar] = useState("");

  return { loading, blackAvatar, whiteAvatar };
}
