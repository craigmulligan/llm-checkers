import { LLMDynamicHandle } from "@lmstudio/sdk";
import { CheckersBoard, Coords } from "./checkers";
import logger from "./logger";

type LLMMove = {
  to: Coords;
  from: Coords;
};

export type MoveError = {
  previous: LLMMove;
  message: string;
};

export async function generateMove(
  model: LLMDynamicHandle,
  checkers: CheckersBoard,
  error?: MoveError,
) {
  const jsonSchema = {
    type: "object",
    properties: {
      from: {
        type: "array",
        items: {
          type: "number",
        },
        minItems: 2,
        maxItems: 2,
      },
      to: {
        type: "array",
        items: {
          type: "number",
        },
        minItems: 2,
        maxItems: 2,
      },
    },
    required: ["to", "from"],
  };

  const messages = [
    {
      role: "system",
      content: `You are a checkers playing robot. You will be presented with a checkers board and your current playing color. 

        The board uses the following symbols to represent the pieces on the board: 
          - "W": White man 
          - "B": Black man 
          - "⛁": White king
          - "⛃": Black King
          - ".": Empty square

        You must respond with the to and from coordinates for your next move in the form of:

        { from: [x, y], to: [x, y] }

        If it is BLACK's turn you can only use pieces B and ⛁.
        If it is WHITE's turn you can only use pieces W and ⛃

        Pieces can only move one square diagonally unless they are capture the opponents piece in which
        case they can move two squares. Men can only move towards an opponents side of the board but Kings
        can move both directions.

        You will also receive a list of all possible moves currently available to you.

        If your move is incorrect you'll receive an error message with instructions to try again.
        `,
    },
    { role: "user", content: `It is ${checkers.turn}'s turn` },
    { role: "user", content: "\n" + checkers.printBoard() + "\n" },
  ];

  const possibleMoves = checkers.possibleMoves();

  if (error) {
    logger.debug(JSON.stringify(possibleMoves));
    messages.push(
      ...[
        {
          role: "user",
          content: `Your previous move failed.`,
        },
        {
          role: "user",
          content: `Error: ${error.message}`,
        },
        {
          role: "user",
          content: `Previous move: ${JSON.stringify(error.previous, null, 2)}`,
        },
        ...possibleMoves.map(({ from, to }) => {
          return {
            role: "user",
            content: `Possible move: ${JSON.stringify({ from, to })}`,
          };
        }),
      ],
    );
  } else {
    messages.push(
      ...possibleMoves.map(({ from, to }) => {
        return {
          role: "user",
          content: `Possible move: ${JSON.stringify({ from, to })}`,
        };
      }),
    );
  }

  logger.debug("sending message");
  const result = await model.respond(messages, {
    maxPredictedTokens: 200,
    structured: { type: "json", jsonSchema },
  });
  logger.debug("message received", JSON.stringify(result));

  try {
    return JSON.parse(result.content) as LLMMove;
  } catch (err) {
    logger.warn(err, result.content);
    throw err;
  }
}
