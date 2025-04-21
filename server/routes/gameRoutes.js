const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");
const auth = require("../middleware/auth");


router.post("/", auth, gameController.createGame);
router.post("/:gameId/join", auth, gameController.joinGame);
router.post("/:gameId/move", auth, gameController.makeMove);
// router.get("/my", auth, gameController.getMyGames);
router.get("/other", auth, gameController.getOtherGames);
router.get("/open", auth, gameController.getOpenGames);


// router.get("/public", gameController.getPublicGames);
router.get("/public/active", gameController.getPublicActiveGames);
router.get("/public/completed", gameController.getPublicCompletedGames);


const optionalAuth = require("../middleware/optionalAuth");

router.get("/:gameId", optionalAuth, gameController.getGameDetails); 

router.get("/my/open", auth, gameController.getMyOpenGames);
router.get("/my/active", auth, gameController.getMyActiveGames);
router.get("/my/completed", auth, gameController.getMyCompletedGames);

module.exports = router;
