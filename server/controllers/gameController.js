const Game = require("../models/Game");
const Board = require("../models/Board");
const User = require("../models/User");
const { generateBoard } = require("../utils/boardUtils");
const { attachBoardId } = require("../utils/gameUtils");
const mongoose = require("mongoose");


exports.createGame = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    console.log("Creating new game for user:", {
      userId,
      timestamp: new Date(),
    });

    
    const ships = generateBoard();

    
    const game = new Game({
      player1: userId,
      currentTurn: userId,
    });

    await game.save({ session });
    console.log("Created new game:", {
      gameId: game._id,
      player1: game.player1,
    });

    
    const board = new Board({
      gameId: game._id,
      userId: userId,
      ships: ships,
      totalCells: 17,
    });

    console.log("Attempting to save player1 board:", {
      gameId: board.gameId,
      userId: board.userId,
    });

    await board.save({ session });
    console.log("Successfully saved player1 board");

    
    await session.commitTransaction();
    console.log("Transaction committed successfully");

    res.status(201).json({
      gameId: game._id,
      status: game.status,
      player1: userId,
      startTime: game.startTime,
      boardId: board._id,
    });
  } catch (error) {
    console.error("Error in createGame:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date(),
    });
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};


exports.joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;

    console.log("Attempting to join game:", {
      gameId,
      userId,
      timestamp: new Date(),
    });

    
    let objectIdGameId;
    try {
      objectIdGameId = new mongoose.Types.ObjectId(gameId);
    } catch (error) {
      console.error("Invalid gameId format:", error);
      return res.status(400).json({ message: "Invalid game ID format" });
    }

    
    const game = await Game.findOneAndUpdate(
      {
        _id: objectIdGameId,
        status: "open",
        player1: { $ne: userId }, 
        player2: { $exists: false }, 
      },
      {
        $set: {
          player2: userId,
          status: "active",
        },
      },
      { new: true } 
    );

    if (!game) {
      console.log("Game not found or not available for joining:", {
        gameId: objectIdGameId,
        userId: userId,
      });
      return res.status(400).json({ message: "Game is not open for joining" });
    }

    console.log("Updated game status to active:", {
      gameId: game._id,
      status: game.status,
      player1: game.player1,
      player2: game.player2,
    });

    
    const ships = generateBoard();
    console.log("Generated ships for new board");

    
    const board = new Board({
      gameId: objectIdGameId,
      userId: userId,
      ships: ships,
      totalCells: 17,
    });

    console.log("Attempting to save new board:", {
      gameId: board.gameId.toString(),
      userId: board.userId.toString(),
    });

    await board.save();
    console.log("Successfully saved new board");

    res.json({
      gameId: game._id,
      status: game.status,
      player1: game.player1,
      player2: userId,
      startTime: game.startTime,
      boardId: board._id,
    });
  } catch (error) {
    console.error("Error in joinGame:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date(),
    });
    res.status(500).json({ message: error.message });
  }
};


exports.makeMove = async (req, res) => {
  // console.log("currentTurn:", game.currentTurn.toString());
  // console.log("request from:", userId.toString());

  try {
    const { gameId } = req.params;
    const { x, y } = req.body;
    const userId = req.user._id;

    
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    console.log("=== makeMove ===", {
      gameId,
      currentTurn: game.currentTurn.toString(),
      requestUser: userId.toString(),
    });

    
    if (game.status !== "active") {
      return res.status(400).json({ message: "Game is not active" });
    }

    
    if (game.currentTurn.toString() !== userId.toString()) {
      return res.status(400).json({ message: "Not your turn" });
    }

    
    const opponentId =
      game.player1.toString() === userId.toString()
        ? game.player2
        : game.player1;

    // 获取对手的棋盘
    const opponentBoard = await Board.findOne({
      gameId: game._id,
      userId: opponentId,
    });

    if (!opponentBoard) {
      return res.status(404).json({ message: "Opponent board not found" });
    }

    
    const existingHit = opponentBoard.hits.find(
      (hit) => hit.x === x && hit.y === y
    );
    if (existingHit) {
      return res.status(400).json({ message: "Position already attacked" });
    }

    
    let hit = false;
    let shipSunk = false;
    let gameOver = false;

    for (const ship of opponentBoard.ships) {
      const position = ship.positions.find((pos) => pos.x === x && pos.y === y);
      if (position) {
        hit = true;
        position.hit = true;

        
        const allPositionsHit = ship.positions.every((pos) => pos.hit);
        if (allPositionsHit) {
          shipSunk = true;
        }
        break;
      }
    }

    
    opponentBoard.hits.push({ x, y, hit });
    if (hit) {
      opponentBoard.currentHits += 1;
    }

    
    if (opponentBoard.currentHits === opponentBoard.totalCells) {
      opponentBoard.isDefeated = true;
      game.status = "completed";
      game.winner = userId;
      game.endTime = new Date();

      
      await User.findByIdAndUpdate(userId, { $inc: { wins: 1 } });
      await User.findByIdAndUpdate(opponentId, { $inc: { losses: 1 } });

      gameOver = true;
    } else {
      
      game.currentTurn = opponentId;
    }

    await opponentBoard.save();
    await game.save();

    res.json({
      hit,
      shipSunk,
      gameOver,
      currentTurn: game.currentTurn,
      board: {
        hits: opponentBoard.hits,
        currentHits: opponentBoard.currentHits,
        isDefeated: opponentBoard.isDefeated,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOpenGames = async (req, res) => {
  try {
    const games = await Game.find({ status: "open" })
      .populate("player1", "username")
      .sort({ startTime: -1 });

    const result = await Promise.all(
      games.map(async (game) => {
        const board = await Board.findOne({
          gameId: game._id,
          userId: game.player1._id,
        }).select("_id");

        return {
          gameId: game._id,
          player1: game.player1,
          startTime: game.startTime,
          boardId: board?._id || null,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyOpenGames = async (req, res) => {
  const userId = req.user._id;
  const games = await Game.find({ player1: userId, status: "open" })
    .populate("player1", "username")
    .sort({ startTime: -1 });

  const result = await attachBoardId(games, userId);
  res.json(result);
};


exports.getMyActiveGames = async (req, res) => {
  const userId = req.user._id;
  const games = await Game.find({
    status: "active",
    $or: [{ player1: userId }, { player2: userId }],
  })
    .populate("player1 player2", "username")
    .sort({ startTime: -1 });

  const result = await attachBoardId(games, userId);
  res.json(result);
};


exports.getMyCompletedGames = async (req, res) => {
  const userId = req.user._id;
  const games = await Game.find({
    status: "completed",
    $or: [{ player1: userId }, { player2: userId }],
  })
    .populate("player1 player2 winner", "username")
    .sort({ endTime: -1 });

  const result = await attachBoardId(games, userId);
  res.json(result);
};


exports.getOtherGames = async (req, res) => {
  try {
    const userId = req.user._id;

    const games = await Game.find({
      $and: [
        { status: { $in: ["active", "completed"] } },
        { player1: { $ne: userId } },
        { player2: { $ne: userId } },
      ],
    })
      .populate("player1 player2 winner", "username")
      .sort({ startTime: -1 });

    const result = await Promise.all(
      games.map(async (game) => {
        const board1 = await Board.findOne({
          gameId: game._id,
          userId: game.player1._id,
        }).select("_id hits isDefeated");

        const board2 = await Board.findOne({
          gameId: game._id,
          userId: game.player2._id,
        }).select("_id hits isDefeated");

        return {
          gameId: game._id,
          status: game.status,
          player1: game.player1,
          player2: game.player2,
          startTime: game.startTime,
          endTime: game.endTime,
          winner: game.winner,
          player1Board: board1
            ? {
                boardId: board1._id,
                hits: board1.hits,
                isDefeated: board1.isDefeated,
              }
            : null,
          player2Board: board2
            ? {
                boardId: board2._id,
                hits: board2.hits,
                isDefeated: board2.isDefeated,
              }
            : null,
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET /api/games/public/active
exports.getPublicActiveGames = async (req, res) => {
  try {
    const games = await Game.find({ status: "active" })
      .populate("player1 player2", "username")
      .sort({ startTime: -1 });

    res.json(
      games.map((game) => ({
        gameId: game._id,
        status: game.status,
        player1: game.player1,
        player2: game.player2,
        startTime: game.startTime,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/games/public/completed
exports.getPublicCompletedGames = async (req, res) => {
  try {
    const games = await Game.find({ status: "completed" })
      .populate("player1 player2 winner", "username")
      .sort({ endTime: -1 });

    res.json(
      games.map((game) => ({
        gameId: game._id,
        status: game.status,
        player1: game.player1,
        player2: game.player2,
        winner: game.winner,
        startTime: game.startTime,
        endTime: game.endTime,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getGameDetails = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user?._id;

    
    const game = await Game.findById(gameId).populate(
      "player1 player2 winner",
      "username"
    );

    if (!game) {
      console.log("❌ Game not found:", gameId);
      return res.status(404).json({ message: "Game not found" });
    }

    
    const [player1Board, player2Board] = await Promise.all([
      Board.findOne({ gameId: game._id, userId: game.player1._id }),
      Board.findOne({ gameId: game._id, userId: game.player2?._id }),
    ]);

    
    const isParticipant =
      userId &&
      ((game.player1 && game.player1._id.toString() === userId.toString()) ||
        (game.player2 && game.player2._id.toString() === userId.toString()));

    
    const response = {
      gameId: game._id,
      status: game.status,
      player1: game.player1,
      player2: game.player2,
      currentTurn: game.currentTurn,
      startTime: game.startTime,
      endTime: game.endTime,
      winner: game.winner,
      player1Board: player1Board
        ? {
            boardId: player1Board._id,
            ships: player1Board.ships,
            hits: player1Board.hits,
            currentHits: player1Board.currentHits,
            isDefeated: player1Board.isDefeated,
          }
        : null,
      player2Board: player2Board
        ? {
            boardId: player2Board._id,
            ships: player2Board.ships,
            hits: player2Board.hits,
            currentHits: player2Board.currentHits,
            isDefeated: player2Board.isDefeated,
          }
        : null,
    };

    
    if (!isParticipant) {
      console.log("Removing sensitive information for spectator");
      if (response.player1Board) {
        delete response.player1Board.ships;
      }
      if (response.player2Board) {
        delete response.player2Board.ships;
      }
    }

    res.json(response);
  } catch (error) {
    console.error("❌ Error in getGameDetails:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: error.message });
  }
};
