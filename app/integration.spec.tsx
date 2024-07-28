import { test, expect, vi } from "vitest";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Game from "./components/Game";
import { Player } from "./lib/checkers";
import { act } from "react";
import { LLMChatHistory } from "@lmstudio/sdk";

class RandomMoveModel {
  identifier: string
  path: string


  constructor(modelPath: string, identifier: string) {
    this.path = modelPath
    this.identifier = identifier
  }
  // This is a model that selects a random move.
  async respond(messages: LLMChatHistory) {
    const possibleMoves = messages.filter((m) =>
      m.content.startsWith("Possible move:"),
    );

    const move = possibleMoves[0].content.replace("Possible move:", "");
    return {
      role: "assistant",
      content: move,
    };
  }

  async getModelInfo() {
    return {
      path: this.path,
      identifier: this.identifier
    }
  }
}
const loadedModels: RandomMoveModel[] = []

// Mock the Client module
vi.mock("@lmstudio/sdk", () => {
  return {
    LMStudioClient: vi.fn().mockImplementation(() => {

      return {
        system: {
          listDownloadedModels: vi.fn().mockResolvedValue([
            {
              path: "model-1.gguf",
            },
            {
              path: "model-2.gguf",
            },
            {
              path: "model-3.gguf",
            },

          ]),
        },
        llm: {
          load: vi
            .fn()
            .mockImplementation(async (modelPath, { onProgress, identifier }) => {
              for (let i = 0; i <= 100; i++) {
                await new Promise((res) => setTimeout(res, 1));
                onProgress(i / 100);
              }


              const model = new RandomMoveModel(modelPath, identifier);

              loadedModels.push(model)
              return model
            }),
          listLoaded: vi.fn().mockResolvedValue(loadedModels),
          unload: vi.fn().mockImplementation(async (identifier) => {
            const index = loadedModels.findIndex((m) => m.identifier === identifier)
            loadedModels.splice(index, 1)
          })
        },
      };
    }),
  };
});

test("Integration test", async () => {
  render(<Game />);
  //
  // Assuming the select elements have accessible labels or roles
  //
  async function loadModel(player: Player, modelPath: string) {
    await screen.findByText(`Select a model for ${player.toLowerCase()}`);
    const blackSelect = screen.getByLabelText(
      `Select a model for ${player.toLowerCase()}`,
    );

    await userEvent.selectOptions(blackSelect, modelPath);
    expect(blackSelect).toHaveValue(modelPath);

    // Now check the loading is in progress.
    const progressEl = await screen.findByText(
      `Loading ${player.toLowerCase()} model`,
    );
    await waitForElementToBeRemoved(progressEl);
  }

  await loadModel("BLACK", 'model-1.gguf');
  // load an model and make sure it's unloaded
  await loadModel("WHITE", 'model-2.gguf');

  expect(loadedModels.map(m => m.path)).toEqual(['model-1.gguf', 'model-2.gguf'])

  await loadModel("WHITE", 'model-3.gguf');

  // Check model-2 has been unloaded.
  expect(loadedModels.map(m => m.path)).toEqual(['model-1.gguf', 'model-3.gguf'])

  // Now both models are loaded.
  const playButton = await screen.findByText("play");

  act(() => {
    playButton.click();
  });

  // Now wait for a winner
  await screen.findByText(/The winner /);
});
