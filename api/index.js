const express = require("express");
const router = express.Router();
const testDbRouter = require("./test-db");
const usersRouter = require("./users")
const echoesRouter = require("./echoes");

router.use("/test-db", testDbRouter);
router.use("/users", usersRouter);
router.use("/echoes", echoesRouter);
module.exports = router;
