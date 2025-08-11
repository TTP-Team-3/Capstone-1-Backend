const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const usersRouter = require("./users")
const echoesRouter = require("./echoes");
const friendsRouter = require("./friends");

router.use("/test-db", testDbRouter);
router.use("/users", usersRouter);
router.use("/echoes", echoesRouter);
router.use("/friends", friendsRouter);
module.exports = router;
