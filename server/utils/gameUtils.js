const Board = require("../models/Board");

const attachBoardId = async (games, userId) => {
  return Promise.all(
    games.map(async (game) => {
      const board = await Board.findOne({
        gameId: game._id,
        userId
      }).select("_id");

      return {
        ...game.toObject(),
        boardId: board ? board._id : null
      };
    })
  );
};

module.exports = { attachBoardId };
