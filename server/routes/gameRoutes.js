const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const auth = require("../middleware/auth");

// 需要认证的路由
router.post("/", auth, gameController.createGame);
router.post("/:gameId/join", auth, gameController.joinGame);
router.post("/:gameId/move", auth, gameController.makeMove);
// router.get("/my", auth, gameController.getMyGames);
router.get("/other", auth, gameController.getOtherGames);
router.get("/open", auth, gameController.getOpenGames);

// 公开路由
// router.get("/public", gameController.getPublicGames);
router.get("/public/active", gameController.getPublicActiveGames);
router.get("/public/completed", gameController.getPublicCompletedGames);

router.get("/:gameId", gameController.getGameDetails); // 

router.get("/my/open", auth, gameController.getMyOpenGames);
router.get("/my/active", auth, gameController.getMyActiveGames);
router.get("/my/completed", auth, gameController.getMyCompletedGames);

module.exports = router;
