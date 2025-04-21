const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ships: [
      {
        type: {
          type: String,
          required: true,
        },
        positions: [
          {
            x: Number,
            y: Number,
            hit: Boolean,
          },
        ],
        direction: {
          type: String,
          enum: ["horizontal", "vertical"],
          required: true,
        },
      },
    ],
    hits: [
      {
        x: Number,
        y: Number,
        hit: Boolean,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalCells: {
      type: Number,
      required: true,
      default: 17, 
    },
    currentHits: {
      type: Number,
      default: 0,
    },
    isDefeated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


boardSchema.index({ gameId: 1, userId: 1 }, { unique: true });

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;
