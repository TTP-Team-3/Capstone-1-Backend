const express = require("express")
const router = express.Router();
const { Echoes, Echo_recipients, Friends } = require("../database"); 
const { authenticateJWT } = require("../auth"); 
const { Op } = require("sequelize");

// route for fetching all echoes 
router.get("/", async (req, res) => {
    try {
        const echoes = await Echoes.findAll({
            where: {
                recipient_type: "public",
            }
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
            return res.status(404).json({error: "Echo not found"});
        }

        const isCreator = echo.user_id === user_id; 

        // If echo is only visible to self and the user is the creator
        if (echo.recipient_type === "self") {
            if (isCreator) {
                return res.json(echo);
            } else {
                return res.status(403).json({private: "This echo is private"});
            }
        }
        
        // If echo is public, only show if unlocked 
        if (echo.recipient_type === "public") {
            if (echo.is_unlocked) {
                return res.json(echo);
            } else {
                return res.status(403).json({locked: "Echo is locked"});
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
                        {user_id: echo.user_id, friend_id: user_id}, 
                        {user_id: user_id, friend_id: echo.user_id}
                    ],
                    status: "accepted"
                }
            });

            if (isFriend && echo.is_unlocked) {
                return res.json(echo);
            } 
        }

        // if echo is custom and for specific users 
        if (echo.recipient_type === "custom") {
            if (isCreator) {
                return res.json(echo);
            }

            const isRecipient = await Echo_recipients.findOne({
                where: {

                }
            })
        }

        // default: no access
        res.status(403).json({no_access: "You cannot access this echo"});

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch echo" })
    }
});

// creating an echo 
router.post("/", authenticateJWT, async (req, res) => {
    try {
        const { recipient_type, text, unlock_datetime, show_sender_name, customRecipients } = req.body;
        const sender_id = req.user.id;

        // checking if any required fields are missing 
        if (!sender_id || !recipient_type || !unlock_datetime) {
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

        // validating customRecipients array if recipient_type is 'custom'
        if (recipient_type === "custom") {
            if (!Array.isArray(customRecipients) || customRecipients.length === 0) {
                return res.status(400).json({error: "Custom recipient list must be a non-empty array."});
            }

            // prevent sending to self 
            if (customRecipients.includes(sender_id)) {
                return res.status(400).json({error: "Cannot send custom echoes to yourself."});
            }
        }

        // creating new echo 
        const newEcho = await Echoes.create({
            user_id: sender_id,
            recipient_type, 
            text,
            unlock_datetime, 
            show_sender_name
        });

        // add custom recipients if custom 
        if (recipient_type === 'custom') {
            const echoRecipients = customRecipients.map((recipient_id) => ({
                echo_id: newEcho.id,
                recipient_id
            }));

            await Echo_recipients.bulkCreate(echoRecipients);
        }

        res.status(201).json(newEcho);
    } catch (err) {
        res.status(500).json({error: "Failed to create echo"});
    }
});

router.patch("/:id/archive", async (req, res) => {
    try {

    } catch (err) {

    }
});

router.patch("/:id/unlock", async (req, res) => {
    try {

    } catch (err) {

    }
});

router.delete("/:id", authenticateJWT, async (req, res) => {
    try {

    } catch (err) {

    }
});

module.exports = router; 