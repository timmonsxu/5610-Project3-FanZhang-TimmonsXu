const Game = require("../models/Game");
const Board = require("../models/Board");
const User = require("../models/User");
const { generateBoard } = require("../utils/boardUtils");
const { attachBoardId } = require("../utils/gameUtils");


// 创建新游戏
exports.createGame = async (req, res) => {
  try {
    const userId = req.user._id;

    // 自动生成船只位置
    const ships = generateBoard();

    // 创建新游戏
    const game = new Game({
      player1: userId,
      currentTurn: userId,
    });

    await game.save();

    // 创建玩家1的棋盘
    const board = new Board({
      gameId: game._id,
      userId: userId,
      ships: ships,
      totalCells: 17, // 所有船只的总格子数
    });

    await board.save();

    res.status(201).json({
      gameId: game._id,
      status: game.status,
      player1: userId,
      startTime: game.startTime,
      boardId: board._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 加入游戏
exports.joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;

    // 查找游戏
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // 检查游戏状态
    if (game.status !== "open") {
      return res.status(400).json({ message: "Game is not open for joining" });
    }

    // 检查是否是创建者
    if (game.player1.toString() === userId.toString()) {
      return res.status(400).json({ message: "Cannot join your own game" });
    }

    // 自动生成船只位置
    const ships = generateBoard();

    // 更新游戏状态
    game.player2 = userId;
    game.status = "active";
    await game.save();

    // 创建玩家2的棋盘
    const board = new Board({
      gameId: game._id,
      userId: userId,
      ships: ships,
      totalCells: 17,
    });

    await board.save();

    res.json({
      gameId: game._id,
      status: game.status,
      player1: game.player1,
      player2: userId,
      startTime: game.startTime,
      boardId: board._id 
    });
  } catch (error) {
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
    const currentUserId = req.user?._id;

    const games = await Game.find({ status: "open" })
      .populate("player1", "username")
      .sort({ startTime: -1 });

    const result = await Promise.all(
      games.map(async (game) => {
        const board = await Board.findOne({
          gameId: game._id,
          userId: game.player1._id
        }).select("_id");

        return {
          gameId: game._id,
          player1: game.player1,
          startTime: game.startTime,
          boardId: board?._id || null
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

// 获取当前用户的游戏
// exports.getMyGames = async (req, res) => {
//   // 增加active completed open 
//   try {
//     const { status } = req.query;
//     const userId = req.user._id;

//     const query = {
//       $or: [{ player1: userId }, { player2: userId }],
//     };

//     if (status) {
//       query.status = status;
//     }

//     const games = await Game.find(query)
//       .populate("player1 player2 winner", "username")
//       .sort({ startTime: -1 });

//     res.json(games);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// 获取其他用户的游戏
// exports.getOtherGames = async (req, res) => {
//   // 只包含非自己的active，completed games
//   try {
//     const userId = req.user._id;

//     const games = await Game.find({
//       $and: [
//         { status: { $in: ["active", "completed"] } },
//         { player1: { $ne: userId } },
//         { player2: { $ne: userId } },
//       ],
//     })
//       .populate("player1 player2 winner", "username")
//       .sort({ startTime: -1 });

//     res.json(games);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

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
          userId: game.player1._id
        }).select("_id hits isDefeated");

        const board2 = await Board.findOne({
          gameId: game._id,
          userId: game.player2._id
        }).select("_id hits isDefeated");

        return {
          gameId: game._id,
          status: game.status,
          player1: game.player1,
          player2: game.player2,
          startTime: game.startTime,
          endTime: game.endTime,
          winner: game.winner,
          player1Board: board1 ? {
            boardId: board1._id,
            hits: board1.hits,
            isDefeated: board1.isDefeated
          } : null,
          player2Board: board2 ? {
            boardId: board2._id,
            hits: board2.hits,
            isDefeated: board2.isDefeated
          } : null
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

    const game = await Game.findById(gameId).populate(
      "player1 player2 winner",
      "username"
    );

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // 获取棋盘信息
    const boards = await Board.find({ gameId: game._id }).select(
      "userId ships hits currentHits isDefeated"
    );

    // 如果用户未登录或是其他用户的游戏，只返回基本信息
    if (
      !userId ||
      (game.player1._id.toString() !== userId.toString() &&
        game.player2._id.toString() !== userId.toString())
    ) {
      return res.json({
        gameId: game._id,
        status: game.status,
        player1: game.player1,
        player2: game.player2,
        startTime: game.startTime,
        endTime: game.endTime,
        winner: game.winner,
      });
    }

    res.json({
      gameId: game._id,
      status: game.status,
      player1: game.player1,
      player2: game.player2,
      currentTurn: game.currentTurn,
      startTime: game.startTime,
      endTime: game.endTime,
      winner: game.winner,
      boards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
