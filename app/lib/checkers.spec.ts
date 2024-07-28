import { CheckersBoard, Cell } from "./checkers";
import { test, describe, expect } from "vitest";

describe("checkers", () => {
  test("should handle a basic layout and move", () => {
    const checkers = new CheckersBoard();
    const legalMoves = checkers.getLegalMoves([0, 5]);
    expect(legalMoves).toEqual([[1, 4]]);
    checkers.movePiece([0, 5], [1, 4]);

    expect(checkers.getCell([0, 5])).toBe(null);
    expect(checkers.getCell([1, 4])).toBe("B");

    expect(checkers.printBoard()).toMatchSnapshot();
    expect(checkers.turn).toBe("WHITE");
    // should fail if we try move the piece that is no longer there
    expect(() => checkers.movePiece([0, 5], [1, 4])).toThrow("Illegal move");
  });

  test("Should be able to capture apponents piece", () => {
    const board = [
      [null, "W", null, "W", null, "W", null, "W"],
      ["W", null, "W", null, "W", null, "W", null],
      [null, "W", null, null, null, "W", null, "W"],
      [null, null, "W", null, null, null, null, null],
      [null, "B", null, "B", null, "B", null, null],
      [null, null, null, null, null, null, "B", null],
      [null, "B", null, "B", null, "B", null, "B"],
      ["B", null, "B", null, "B", null, "B", null],
    ];

    const checkers = new CheckersBoard();
    checkers.board = board as Cell[][];

    checkers.turn = "WHITE";
    const legalMoves = checkers.getLegalMoves([2, 3]);
    expect(legalMoves).toStrictEqual([
      [4, 5],
      [0, 5],
    ]);
    checkers.movePiece([2, 3], [0, 5]);

    expect(checkers.score.WHITE).toBe(1);
    expect(checkers.getCell([0, 5])).toBe("W");
    expect(checkers.getCell([2, 3])).toBe(null);
    expect(checkers.getCell([1, 4])).toBe(null);

    expect(checkers.printBoard()).toMatchSnapshot();
  });

  test("Should only allow capture moves if they exist", () => {
    const board = [
      [null, "W", null, "W", null, "W", null, "W"],
      ["W", null, "W", null, "W", null, "W", null],
      [null, "W", null, null, null, "W", null, "W"],
      [null, null, "W", null, null, null, null, null],
      [null, "B", null, null, null, "B", null, null],
      [null, null, null, null, "B", null, "B", null],
      [null, "B", null, "B", null, "B", null, "B"],
      ["B", null, "B", null, "B", null, "B", null],
    ];

    const checkers = new CheckersBoard();
    checkers.board = board as Cell[][];

    // TODO: This shouldn't be just for this single
    // coord but the whole board.
    checkers.turn = "WHITE";
    const legalMoves = checkers.getLegalMoves([2, 3]);
    expect(legalMoves).toStrictEqual([[0, 5]]);
  });

  test("Should be able to repeat a turn after capture if another capture is available", () => {
    const board = [
      [null, null, null, "W", null, "W", null, "W"],
      ["W", null, "W", null, "W", null, "W", null],
      [null, "W", null, null, null, "W", null, "W"],
      [null, null, "W", null, "W", null, null, null],
      [null, "B", null, null, null, "B", null, null],
      [null, null, null, null, "B", null, "B", null],
      [null, "B", null, "B", null, "B", null, "B"],
      ["B", null, "B", null, "B", null, "B", null],
    ];

    const checkers = new CheckersBoard();
    checkers.board = board as Cell[][];

    const legalMoves = checkers.getLegalMoves([5, 4]);
    expect(legalMoves).toStrictEqual([[3, 2]]);

    expect(checkers.turn).toBe("BLACK");
    checkers.movePiece([5, 4], [3, 2]);
    // Check it's still blacks turn
    expect(checkers.turn).toBe("BLACK");

    const nextMoves = checkers.getLegalMoves([3, 2]);
    expect(nextMoves).toStrictEqual([[1, 0]]);
  });

  test("Should create king when piece reaches end of board", () => {
    const board = [
      [null, "W", null, "W", null, null, null, "W"],
      ["W", null, "W", null, "B", null, "W", null],
      [null, null, null, null, null, "W", null, "W"],
      [null, null, "W", null, null, null, null, null],
      [null, null, null, null, null, "B", null, null],
      [null, null, null, null, "B", null, "B", null],
      [null, "B", null, "B", null, "B", null, "B"],
      ["B", null, "B", null, "B", null, "B", null],
    ];

    const checkers = new CheckersBoard();
    checkers.board = board as Cell[][];

    const legalMoves = checkers.getLegalMoves([4, 1]);
    expect(legalMoves).toStrictEqual([[5, 0]]);

    checkers.movePiece([4, 1], [5, 0]);

    expect(checkers.getCell([5, 0])).toEqual("⛃");
  });

  test("Should allow king pieces to move back and forward", () => {
    const board = [
      [null, "W", null, "W", null, null, null, "W"],
      ["W", null, "W", null, "⛃", null, "W", null],
      [null, null, null, null, null, null, null, "W"],
      [null, null, "W", null, null, null, null, null],
      [null, "B", null, null, null, "B", null, null],
      [null, null, null, null, "B", null, "B", null],
      [null, "B", null, "B", null, "B", null, "B"],
      ["B", null, "B", null, "B", null, "B", null],
    ];

    const checkers = new CheckersBoard();
    checkers.board = board as Cell[][];

    const legalMoves = checkers.getLegalMoves([4, 1]);
    expect(legalMoves).toStrictEqual([
      [5, 2],
      [3, 2],
      [5, 0],
    ]);
  });

  test("should signal if the game is deadlocked due to no legal moves", () => {
    const board = [
      [null, "W", null, "W", null, null, null, "W"],
      ["B", null, "W", null, "W", null, "W", null],
      [null, null, null, null, null, null, null, "W"],
      [null, null, "W", null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];

    const checkers = new CheckersBoard();
    checkers.board = board as Cell[][];

    expect(() => checkers.movePiece([4, 1], [3, 2])).toThrow(
      "No Legal Moves Exist",
    );
  });
});
