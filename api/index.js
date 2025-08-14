const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const usersRouter = require("./users")
const echoesRouter = require("./echoes");
const friendsRouter = require("./friends");
const repliesRouter = require("./replies");
const reactionsRouter = require("./reactions");

router.use("/test-db", testDbRouter);
router.use("/users", usersRouter);
router.use("/echoes", echoesRouter);
router.use("/friends", friendsRouter);
router.use("/replies", repliesRouter);
router.use("/reactions", reactionsRouter);
module.exports = router;
