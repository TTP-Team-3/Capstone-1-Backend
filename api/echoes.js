const express = require("express")
const router = express.Router();
const { Echoes } = require("../database"); 
const { authenticateJWT } = require("../auth"); 

router.get("/", async (req, res) => {
    try {
        const echoes = await Echoes.findAll({});
        res.json(echoes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all echoes" }); 
    }
});

router.get("/:id", async (req, res) => {
    try {
        const echo = await Echoes.findByPk(req.params.id, {});
        res.json(echo);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch echo" })
    }
});

router.post("/", authenticateJWT, async (req, res) => {
    try {
        const { type, text, unlock_datetime, show_sender_name } = req.body;
        const sender_id = req.user.id;

        // checking if any required fields are missing 
        if (!sender_id || !type || !unlock_datetime) {
            return res.status(400).json({error: "Missing required fields"});
        }

        // checking if unlock_datetime is in the future 
        const unlockTime = new Date(unlock_datetime);

        if (isNaN(unlockTime.getTime())) {
            return res.status(400).json({error: "Invalid unlock_datetime format"});
        }

        if (unlockTime < new Date()) {
            return res.status(400).json({error:"unlock_datetime must be in the future"});
        }

        // creating new echo 
        const newEcho = await Echoes.create({
            type, 
            text,
            unlock_datetime, 
            show_sender_name
        });

        res.status(201).json(newEcho);
    } catch (err) {
        res.status(500).json({error: "Failed to create echo"});
    }
});
module.exports = router; 