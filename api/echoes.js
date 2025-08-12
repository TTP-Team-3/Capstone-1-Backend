const express = require("express");
const router = express.Router();
const { Echoes, Echo_recipients, Friends } = require("../database");
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");
const { response } = require("../app");

// route for fetching all echoes
router.get("/", async (req, res) => {
  try {
    const echoes = await Echoes.findAll({
      where: {
        recipient_type: "public",
      },
    });

    res.json(echoes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all echoes" });
  }
});

// fetching echo by id
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const user_id = req.user.id;
    const echo = await Echoes.findByPk(req.params.id);

    if (!echo) {
      return res.status(404).json({ error: "Echo not found" });
    }

    const isCreator = echo.user_id === user_id;

    // If echo is only visible to self and the user is the creator
    if (echo.recipient_type === "self") {
      if (isCreator) {
        return res.json(echo);
      } else {
        return res.status(403).json({ private: "This echo is private" });
      }
    }

    // If echo is public, only show if unlocked
    if (echo.recipient_type === "public") {
      if (echo.is_unlocked) {
        return res.json(echo);
      } else if (isCreator) {
        return res.json(echo);
      } else {
        return res.status(403).json({ locked: "Echo is locked" });
      }
    }

    // if echo is for friends and is unlocked
    if (echo.recipient_type === "friend") {
      if (isCreator) {
        return res.json(echo); // creator can always view
      }

      // check if friendship is accepted between echo creator and logged in user
      const isFriend = await Friends.findOne({
        where: {
          [Op.or]: [
            { user_id: echo.user_id, friend_id: user_id },
            { user_id: user_id, friend_id: echo.user_id },
          ],
          status: "accepted",
        },
      });

      if (isFriend) {
        if (echo.is_unlocked) {
          return res.json(echo);
        } else {
          return res.status(403).json({ locked: "Echo is locked" });
        }
      } else {
        return res
          .status(403)
          .json({
            not_friend:
              "This echo is only accessible to friends of echo creator",
          });
      }
    }

    // if echo is custom and for specific users
    if (echo.recipient_type === "custom") {
      if (isCreator) {
        return res.json(echo);
      }
      const isRecipient = await Echo_recipients.findOne({
        where: {
          echo_id: echo.id,
          recipient_id: user_id,
        },
      });

      if (isRecipient && echo.is_unlocked) {
        return res.json(echo);
      } else if (isRecipient && !echo.is_unlocked) {
        return res.status(403).json({ locked: "Echo is locked" });
      }
    }

    // default: no access
    res.status(403).json({ no_access: "You cannot access this echo" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch echo" });
  }
});

// creating an echo
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const {
      echo_name,
      recipient_type,
      text,
      unlock_datetime,
      show_sender_name,
      lat,
      lng,
      customRecipients,
    } = req.body;
    const sender_id = req.user.id;

    // checking if any required fields are missing
    if (!sender_id || !recipient_type || !unlock_datetime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // checking if unlock_datetime is in the future
    const unlockTime = new Date(unlock_datetime);

    if (isNaN(unlockTime.getTime())) {
      return res.status(400).json({ error: "Invalid unlock_datetime format" });
    }

    if (unlockTime < new Date()) {
      return res
        .status(400)
        .json({ error: "unlock_datetime must be in the future" });
    }

    // validating customRecipients array if recipient_type is 'custom'
    if (recipient_type === "custom") {
      if (!Array.isArray(customRecipients) || customRecipients.length === 0) {
        return res
          .status(400)
          .json({ error: "Custom recipient list must be a non-empty array." });
      }

      // prevent sending to self
      if (customRecipients.includes(sender_id)) {
        return res
          .status(400)
          .json({ error: "Cannot send custom echoes to yourself." });
      }
    }

    // creating new echo
    const newEcho = await Echoes.create({
      echo_name,
      user_id: sender_id,
      recipient_type,
      text,
      unlock_datetime,
      show_sender_name,
      lat,
      lng,
    });

    // add custom recipients if custom
    if (recipient_type === "custom") {
      const echoRecipients = customRecipients.map((recipient_id) => ({
        echo_id: newEcho.id,
        recipient_id,
      }));

      await Echo_recipients.bulkCreate(echoRecipients);
    }

    res.status(201).json(newEcho);
  } catch (err) {
    res.status(500).json({ error: "Failed to create echo" });
  }
});

// arching or unarchiving an echo
router.patch("/:id/archive", authenticateJWT, async (req, res) => {
  try {
    const user_id = req.user.id;
    const echo = await Echoes.findByPk(req.params.id);

    if (!echo) {
      return res.status(404).json({ error: "Echo not found" });
    }

    if (echo.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this echo." });
    }

    // Toggle archived status
    echo.is_archived = !echo.is_archived;
    await echo.save();

    return res.status(200).json({
      message: echo.is_archived ? "Echo archived" : "Echo unarchived",
      echo,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to toggle echo archive status" });
  }
});

// unlocking an echo
router.patch("/:id/unlock", authenticateJWT, async (req, res) => {
  try {
    const user_id = req.user.id;
    const echo = await Echoes.findByPk(req.params.id);

    // check if echo exists
    if (!echo) {
      return res.status(404).json({ error: "Echo not found." });
    }

    // check if user is owner
    if (user_id !== echo.user_id) {
      return res.status(403).json({ error: "You cannot access this echo." });
    }

    // enforce unlock date
    if (new Date() < new Date(echo.unlock_datetime)) {
      return res
        .status(403)
        .json({ error: "This echo is locked until its unlock date." });
    }

    // already unlocked
    if (echo.is_unlocked) {
      return res.status(200).json({
        message: "Echo is already unlocked.",
        echo,
      });
    }

    // Unlock
    echo.is_unlocked = true;
    await echo.save();

    return res.status(200).json({
      message: "Echo unlocked",
      echo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error unlocking this echo" });
  }
});

// deleting an echo
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const user_id = req.user.id;
    const echo = await Echoes.findByPk(req.params.id);

    // check if echo exists
    if (!echo) {
      return res.status(404).json({ error: "Echo not found." });
    }

    // check ownership
    if (user_id !== echo.user_id) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this echo." });
    }

    // delete the echo
    await echo.destroy();

    return res.status(200).json({
      message: "Echo deleted successfully",
      id: echo.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error deleting this echo" });
  }
});

module.exports = router;
