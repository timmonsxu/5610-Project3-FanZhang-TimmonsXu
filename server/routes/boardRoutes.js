const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");

router.get("/:boardId", boardController.getBoardById);

module.exports = router;
