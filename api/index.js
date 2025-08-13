const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const usersRouter = require("./users")
const echoesRouter = require("./echoes");
const friendsRouter = require("./friends");
const repliesRouter = require("./replies");

router.use("/test-db", testDbRouter);
router.use("/users", usersRouter);
router.use("/echoes", echoesRouter);
router.use("/friends", friendsRouter);
router.use("/replies", repliesRouter);
module.exports = router;
