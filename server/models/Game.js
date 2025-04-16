const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["open", "active", "completed"],
      default: "open",
    },
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    currentTurn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引以提高查询性能
gameSchema.index({ status: 1 });
gameSchema.index({ player1: 1, status: 1 });
gameSchema.index({ player2: 1, status: 1 });

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
