"use client";

import { useEffect, useMemo, useState } from "react";
import { LLMDynamicHandle } from "@lmstudio/sdk";
import ModelLoader from "./ModelLoader";
import useUnloadModels from "../hooks/useUnloadModels";
import ErrorMessage from "./ErrorMessage";
import useCheckers from "../hooks/useCheckers";
import Score from "./Score";
import Loading from "./Loading";
import title from "../title";
import useConfetti from "../hooks/useConfetti";

export default function Game() {
  const [blackModel, setBlackModel] = useState<LLMDynamicHandle>();
  const [whiteModel, setWhiteModel] = useState<LLMDynamicHandle>();
  const { isPlaying, play, stop, board, turn, score, error, winner } =
    useCheckers(blackModel, whiteModel);
  const { error: unloadError } = useUnloadModels(blackModel, whiteModel);
  const confetti = useConfetti();

  const bothModelsLoaded = useMemo(() => {
    return !!blackModel && !!whiteModel;
  }, [blackModel, whiteModel]);

  // Visual cues for events
  useEffect(() => {
    if (winner) {
      confetti?.addConfetti({
        confettiColors: ["white", "gray"],
      });
    }
  }, [winner, confetti]);

  useEffect(() => {
    if (score.BLACK) {
      confetti?.addConfetti({
        confettiColors: ["white", "gray"],
      });
    }
  }, [score.BLACK, confetti]);

  useEffect(() => {
    if (score.WHITE) {
      confetti?.addConfetti({
        confettiColors: ["white", "gray"],
      });
    }
  }, [score.WHITE, confetti]);

  return (
    <main className="text-center m-4 ">
      <pre>
        <code>{title}</code>
      </pre>
      {!bothModelsLoaded && (
        <p>Select each opponents model, then click play!</p>
      )}
      <ErrorMessage message={unloadError} />
      {error && <ErrorMessage message={error} />}
      <div className="flex w-full mt-4 text-center">
        <div className="w-1/5 flex flex-col">
          <div className="flex space-x-2 items-baseline justify-center">
            {turn === "BLACK" && isPlaying && <Loading />}
            <h2 className="font-bold text-2xl mb-2">Black</h2>
          </div>
          <div className="mb-2">
            <ModelLoader
              onLoad={setBlackModel}
              disabled={isPlaying}
              player={"black"}
            />
          </div>
          {isPlaying && <Score score={score.BLACK} />}
        </div>
        <div className="w-3/5 flex flex-col text-center">
          <div className="mb-4">
            {isPlaying ? (
              <button
                className="bg-white text-black px-6 py-1 rounded-sm"
                onClick={stop}
              >
                stop
              </button>
            ) : (
              <button
                className="bg-white text-black px-6 py-1 rounded-sm"
                disabled={!bothModelsLoaded}
                onClick={play}
              >
                play
              </button>
            )}
          </div>
          {isPlaying && (
            <div>
              <pre>
                <code dangerouslySetInnerHTML={{ __html: board }}></code>
              </pre>
            </div>
          )}
          {winner && (
            <div className="font-bold text-2xl">The winner is {winner}!</div>
          )}
        </div>
        <div className="w-1/5 flex flex-col text-center">
          <div className="flex space-x-2 items-baseline justify-center">
            {turn === "WHITE" && isPlaying && <Loading />}
            <h2 className="font-bold text-2xl mb-2">WHITE</h2>
          </div>
          <div className="mb-2">
            <ModelLoader
              onLoad={setWhiteModel}
              player={"white"}
              disabled={isPlaying}
            />
          </div>
          {isPlaying && <Score score={score.WHITE} />}
        </div>
      </div>
    </main>
  );
}
