export type Cell = "W" | "B" | null | "⛁" | "⛃";
export type Coords = [number, number];
export type Player = "BLACK" | "WHITE";
export type Score = Record<Player, number>;

export type Move = {
  from: Coords;
  to: Coords;
  capture: Coords | undefined;
};

export class DeadLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Deadlock";
  }
}

export class CheckersBoard {
  board: Cell[][];
  score: Score;
  turn: Player;

  constructor() {
    this.board = this.createBoard();
    this.score = {
      BLACK: 0,
      WHITE: 0,
    };
    this.turn = "BLACK";
  }

  createBoard(): Cell[][] {
    const board: Cell[][] = [];
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          row.push(null); // empty cell
        } else if (i < 3) {
          row.push("W"); // white piece
        } else if (i > 4) {
          row.push("B"); // black piece
        } else {
          row.push(null); // empty cell
        }
      }
      board.push(row);
    }
    return board;
  }

  getPlayerFromCell(cell: Cell): Player | null {
    switch (cell) {
      case "B":
        return "BLACK";
      case "W":
        return "WHITE";
      case "⛁":
        return "WHITE";
      case "⛃":
        return "BLACK";
      case null:
        return null;
      default:
        throw new Error(`Invalid cell ${cell}`);
    }
  }

  getLegalMoves(coords: Coords): Coords[] {
    const moves = this.getLegalMovesAndCaptures(coords);

    return moves.map((m) => m.to);
  }

  getDirections(cell: Cell): number[][] {
    const black = [
      [1, -1],
      [-1, -1],
    ];

    const white = [
      [1, 1],
      [-1, 1],
    ];
    switch (cell) {
      case "B":
        return black;
      case "W":
        return white;
      default:
        return [...white, ...black];
    }
  }

  getLegalMovesAndCaptures(coords: Coords): Move[] {
    const cell = this.getCell(coords);
    const legalMoves: Move[] = [];

    if (cell === null || this.turn != this.getPlayerFromCell(cell)) {
      throw new Error(`${this.turn}'s piece is not on this square.`);
    }
    const directions = this.getDirections(cell);

    for (const direction of directions) {
      const move = this.getLegalMove(coords, direction);

      if (move) {
        legalMoves.push(move);
      }
    }

    if (legalMoves.some((m) => m.capture)) {
      // This means the piece is in a position to
      // capture an opponents piece. You may only
      // Choose the move which will take the piece.
      return legalMoves.filter((m) => m.capture);
    }

    return legalMoves;
  }

  getLegalMove(
    coords: Coords,
    direction: number[],
    startCoords?: Coords,
  ): Move | undefined {
    // BUG!
    // Should be returing the start coords
    // in from.
    const [x, y] = coords;
    const [dx, dy] = direction;
    const newX = x + dx;
    const newY = y + dy;

    if (this.isOnBoard([newX, newY])) {
      const cell = this.board[newY][newX];

      if (cell === null) {
        return {
          from: startCoords || coords,
          to: [newX, newY],
          capture: startCoords ? [x, y] : undefined,
        };
      }

      // Check piece is the oppenents
      if (this.getPlayerFromCell(cell) != this.turn) {
        return this.getLegalMove([newX, newY], direction, coords);
      }
    }
  }

  findMove(to: Coords, legalMoves: Move[]): Move | undefined {
    // checks if the move is in the legal moves array.
    return legalMoves.find(
      (move) => move.to[0] === to[0] && move.to[1] === to[1],
    );
  }

  getCell(coords: Coords): Cell {
    const [x, y] = coords;
    const cell = this.board[y][x];
    return cell;
  }

  setCell(coords: Coords, cell: Cell): void {
    const [x, y] = coords;
    this.board[y][x] = cell;
  }

  isOnBoard(coords: Coords): boolean {
    const [x, y] = coords;
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  movePiece(fromCoords: Coords, toCoords: Coords): void {
    // First check if there are any legal moves on the board.
    if (fromCoords.length < 1) {
      throw new Error(`Invalid Coords: ${JSON.stringify(fromCoords)}`);
    }
    if (toCoords.length < 1) {
      throw new Error(`Invalid Coords: ${JSON.stringify(toCoords)}`);
    }

    // Get all possible moves on the board for turn
    const legalMoves = this.possibleMoves();

    if (!legalMoves.length) {
      throw new DeadLockError("No Legal Moves Exist");
    }

    // Ensure the commanded move is legal
    const move = this.findMove(toCoords, legalMoves);

    if (!move) {
      throw new Error("Illegal move");
    }

    // handle if the move captures a piece
    if (move.capture) {
      this.setCell(move.capture, null);
      this.score[this.turn] += 1;
    }

    // Move the actual piece
    const value = this.getCell(fromCoords);
    this.setCell(toCoords, value);
    this.setCell(fromCoords, null);

    // Upgrade any kings
    this.upgradeKings();

    if (this.hasWon()) {
      // Current turn has one.
      return;
    }

    // Update the turn player if there are no more possible captures
    const nextMoves = this.getLegalMovesAndCaptures(toCoords);

    if (!nextMoves.some((m) => m.capture)) {
      this.turn = this.turn === "BLACK" ? "WHITE" : "BLACK";
    }
  }

  upgradeKings() {
    // if any of W or B are on the opponents side of the board
    // they are upgraded to Kings
    if (this.turn === "BLACK") {
      // check first row for blacks
      this.board[0].map((v, i) => {
        if (v === "B") {
          this.setCell([i, 0], "⛃");
        }
      });
    } else {
      // Check last row for WHITES
      this.board[this.board.length - 1].map((v, i) => {
        if (v === "W") {
          this.setCell([i, this.board.length - 1], "⛁");
        }
      });
    }
  }

  printBoard(): string {
    return (
      Array.from(Array(this.board[0].length).keys()).join(" ") +
      "\n" +
      this.board
        .map((row, i) =>
          [...row.map((cell) => (cell === null ? "." : cell)), ` ${i}`].join(
            " ",
          ),
        )
        .join("\n")
    );
  }

  possibleMoves(): Move[] {
    const moves: Move[] = [];
    // Now check if there are no possible moves left.
    // iterate through each cell, if cell has legal moves
    // return false.
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        const cell = this.getCell([x, y]);
        const player = this.getPlayerFromCell(cell);

        if (player === this.turn) {
          const legalMoves = this.getLegalMovesAndCaptures([x, y]);
          moves.push(...legalMoves);
        }
      }
    }

    if (moves.some((m) => m.capture)) {
      // this means the piece is in a position to
      // capture an opponents piece. You may only
      // Choose the move which will take the peice.
      return moves.filter((m) => m.capture);
    }

    return moves;
  }

  hasWon(): boolean {
    // checks whether you can win
    // First check if current play score exceeds max.
    // Max points is 12
    if (this.score[this.turn] >= 12) {
      return true;
    }

    return false;
  }
}
