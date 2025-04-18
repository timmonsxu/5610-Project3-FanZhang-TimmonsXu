const Game = require("../models/Game");
const Board = require("../models/Board");
const User = require("../models/User");
const { generateBoard } = require("../utils/boardUtils");
const { attachBoardId } = require("../utils/gameUtils");
const mongoose = require("mongoose");

// 创建新游戏
exports.createGame = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;

    console.log("Creating new game for user:", {
      userId,
      timestamp: new Date(),
    });

    // 自动生成船只位置
    const ships = generateBoard();

    // 创建新游戏
    const game = new Game({
      player1: userId,
      currentTurn: userId,
    });

    await game.save({ session });
    console.log("Created new game:", {
      gameId: game._id,
      player1: game.player1,
    });

    // 创建玩家1的棋盘
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

    // 提交事务
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

// 加入游戏
exports.joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;

    console.log("Attempting to join game:", {
      gameId,
      userId,
      timestamp: new Date(),
    });

    // 确保 gameId 是 ObjectId
    let objectIdGameId;
    try {
      objectIdGameId = new mongoose.Types.ObjectId(gameId);
    } catch (error) {
      console.error("Invalid gameId format:", error);
      return res.status(400).json({ message: "Invalid game ID format" });
    }

    // 检查是否已经存在该用户的棋盘
    const existingBoard = await Board.findOne({
      gameId: objectIdGameId,
      userId: userId,
    });

    if (existingBoard) {
      console.log("Board already exists for user:", {
        gameId: objectIdGameId,
        userId: userId,
      });
      // 如果棋盘已存在，直接返回成功响应
      const game = await Game.findById(objectIdGameId);
      return res.json({
        gameId: game._id,
        status: game.status,
        player1: game.player1,
        player2: userId,
        startTime: game.startTime,
        boardId: existingBoard._id,
      });
    }

    // 使用 findOneAndUpdate 原子操作来更新游戏状态
    const game = await Game.findOneAndUpdate(
      {
        _id: objectIdGameId,
        status: "open",
        player1: { $ne: userId }, // 确保不是创建者
        player2: { $exists: false }, // 确保还没有玩家2
      },
      {
        $set: {
          player2: userId,
          status: "active",
        },
      },
      { new: true } // 返回更新后的文档
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

    // 自动生成船只位置
    const ships = generateBoard();
    console.log("Generated ships for new board");

    // 创建玩家2的棋盘
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

// 进行移动
exports.makeMove = async (req, res) => {
  // console.log("currentTurn:", game.currentTurn.toString());
  // console.log("request from:", userId.toString());

  try {
    const { gameId } = req.params;
    const { x, y } = req.body;
    const userId = req.user._id;

    // 查找游戏
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // 检查游戏状态
    if (game.status !== "active") {
      return res.status(400).json({ message: "Game is not active" });
    }

    // 检查是否是当前玩家的回合
    if (game.currentTurn.toString() !== userId.toString()) {
      return res.status(400).json({ message: "Not your turn" });
    }

    // 确定对手
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

    // 检查是否已经攻击过这个位置
    const existingHit = opponentBoard.hits.find(
      (hit) => hit.x === x && hit.y === y
    );
    if (existingHit) {
      return res.status(400).json({ message: "Position already attacked" });
    }

    // 检查是否击中船只
    let hit = false;
    let shipSunk = false;
    let gameOver = false;

    for (const ship of opponentBoard.ships) {
      const position = ship.positions.find((pos) => pos.x === x && pos.y === y);
      if (position) {
        hit = true;
        position.hit = true;

        // 检查船只是否被击沉
        const allPositionsHit = ship.positions.every((pos) => pos.hit);
        if (allPositionsHit) {
          shipSunk = true;
        }
        break;
      }
    }

    // 记录攻击
    opponentBoard.hits.push({ x, y, hit });
    if (hit) {
      opponentBoard.currentHits += 1;
    }

    // 检查游戏是否结束
    if (opponentBoard.currentHits === opponentBoard.totalCells) {
      opponentBoard.isDefeated = true;
      game.status = "completed";
      game.winner = userId;
      game.endTime = new Date();

      // 更新用户统计
      await User.findByIdAndUpdate(userId, { $inc: { wins: 1 } });
      await User.findByIdAndUpdate(opponentId, { $inc: { losses: 1 } });

      gameOver = true;
    } else {
      // 切换回合
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

// 获取开放游戏列表
// exports.getOpenGames = async (req, res) => {
//   try {
//     const games = await Game.find({ status: "open" })
//       .populate("player1", "username")
//       .select("_id player1 startTime")
//       .sort({ startTime: -1 });

//     res.json(games);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// gameController.js
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

// 我的开放游戏
exports.getMyOpenGames = async (req, res) => {
  const userId = req.user._id;
  const games = await Game.find({ player1: userId, status: "open" })
    .populate("player1", "username")
    .sort({ startTime: -1 });

  const result = await attachBoardId(games, userId);
  res.json(result);
};

// 我的进行中游戏
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

// 我的已完成游戏
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

// 获取其他用户的游戏
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

// 获取公开游戏列表
// exports.getPublicGames = async (req, res) => {
//   try {
//     const { status } = req.query;
//     const query = { status: status || "active" };

//     const games = await Game.find(query)
//       .populate("player1 player2 winner", "username")
//       .sort({ startTime: -1 });

//     res.json(games);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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

// 获取游戏详情
exports.getGameDetails = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user?._id;

    // 打印 game 基础信息
    // console.log("=== Game Details Request ===");
    // console.log("Request details:", {
    //   gameId,
    //   userId: userId?.toString() || "not logged in",
    //   timestamp: new Date().toISOString(),
    // });

    // 查找游戏并填充玩家信息
    const game = await Game.findById(gameId).populate(
      "player1 player2 winner",
      "username"
    );

    if (!game) {
      console.log("❌ Game not found:", gameId);
      return res.status(404).json({ message: "Game not found" });
    }

    // 打印 game 完整信息
    // console.log("✅ Game found:", {
    //   gameId: game._id,
    //   status: game.status,
    //   player1: game.player1?.username,
    //   player2: game.player2?.username,
    //   currentTurn: game.currentTurn?.toString(),
    //   winner: game.winner?.username,
    // });

    // 获取两个玩家的棋盘信息
    const [player1Board, player2Board] = await Promise.all([
      Board.findOne({ gameId: game._id, userId: game.player1._id }),
      Board.findOne({ gameId: game._id, userId: game.player2?._id }),
    ]);

    // 打印棋盘信息
    // console.log("Boards found:", {
    //   player1Board: player1Board ? "found" : "not found",
    //   player2Board: player2Board ? "found" : "not found",
    // });

    // 检查用户是否是参与者
    const isParticipant =
      userId &&
      ((game.player1 && game.player1._id.toString() === userId.toString()) ||
        (game.player2 && game.player2._id.toString() === userId.toString()));

    // 打印用户权限信息
    // console.log("User permissions:", {
    //   isLoggedIn: !!userId,
    //   isParticipant,
    //   isSpectator: !isParticipant,
    // });

    // 构建基础响应
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

    // 如果用户未登录或是旁观者，移除敏感信息
    if (!isParticipant) {
      console.log("Removing sensitive information for spectator");
      if (response.player1Board) {
        delete response.player1Board.ships;
      }
      if (response.player2Board) {
        delete response.player2Board.ships;
      }
    }

    // 打印响应信息
    // console.log("=== Game Details Response ===");
    // console.log("Response summary:", {
    //   gameId: response.gameId,
    //   status: response.status,
    //   hasPlayer1Board: !!response.player1Board,
    //   hasPlayer2Board: !!response.player2Board,
    //   shipsVisible: isParticipant,
    // });

    res.json(response);
  } catch (error) {
    console.error("❌ Error in getGameDetails:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({ message: error.message });
  }

  // // 获取游戏详情
  // exports.getGameDetails = async (req, res) => {
  //   try {
  //     const { gameId } = req.params;
  //     const userId = req.user?._id;

  //     const game = await Game.findById(gameId).populate(
  //       "player1 player2 winner",
  //       "username"
  //     );

  //     if (!game) {
  //       return res.status(404).json({ message: "Game not found" });
  //     }

  //     // 获取棋盘信息
  //     const boards = await Board.find({ gameId: game._id }).select(
  //       "userId ships hits currentHits isDefeated"
  //     );

  //     // 如果用户未登录或是其他用户的游戏，只返回基本信息
  //     if (
  //       !userId ||
  //       (game.player1._id.toString() !== userId.toString() &&
  //         game.player2._id.toString() !== userId.toString())
  //     ) {
  //       return res.json({
  //         gameId: game._id,
  //         status: game.status,
  //         player1: game.player1,
  //         player2: game.player2,
  //         startTime: game.startTime,
  //         endTime: game.endTime,
  //         winner: game.winner,
  //       });
  //     }

  //     res.json({
  //       gameId: game._id,
  //       status: game.status,
  //       player1: game.player1,
  //       player2: game.player2,
  //       currentTurn: game.currentTurn,
  //       startTime: game.startTime,
  //       endTime: game.endTime,
  //       winner: game.winner,
  //       boards,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: error.message });
  //   }
  // };
};
