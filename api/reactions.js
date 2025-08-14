const express = require("express");
const router = express.Router();
const { Reactions, Echoes } = require("../database");
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");

router.post("/echoes/:id", authenticateJWT, async(req, res) => {
    try {
        let { type } = req.body;
        const userId = req.user.id; 
        const echoId = parseInt(req.params.id, 10);

        // validate echoId
        if (isNaN(echoId)) {
            return res.status(400).json({error: "Invalid echo Id."});
        }

        // validate reaction type 
        type = type?.trim();
        const allowedTypes = Reactions.getAttributes().type.values; 
        if (!type || !allowedTypes.includes(type)) {
            return res.status(400).json({error: `Invalid reaction type. Allowed values: ${allowedTypes.join(', ')}`});
        }

        // check if echo exists 
        const echo = await Echoes.findByPk(echoId);
        if (!echo) {
            return res.status(404).json({error: "Echo not found."});
        } 

        // check for existing reaction 
        const existingReaction = await Reactions.findOne({
            where: { echo_id: echoId,  user_id: userId }
        });
        if (existingReaction) {
            if (existingReaction.type === type) {
                await existingReaction.destroy();
                return res.status(200).json({
                    message: "Reaction removed"
                });
            }
            existingReaction.type = type; 
            await existingReaction.save();
            return res.status(200).json({
                message: "Reaction updated", 
                reaction: existingReaction
            });
        }

        // creating new reaction 
        const reaction = await Reactions.create({
            echo_id: echoId, 
            user_id: userId,  
            type
        });

        return res.status(201).json({
            message: "Reacted to echo.",
            reaction
        });

    } catch (err) {
       console.error(err);
       return res.status(500).json({error: "Error adding reaction to echo."});
    }
});

router.get("/echoes/:id", async (req, res) => {
    try {
        const echoId = parseInt(req.params.id, 10);

        // validate echoId 
        if (isNaN(echoId)) {
            return res.status(400).json({error: "Invalid echo ID."});
        }

        // check if echo exists 
        const echo = await Echoes.findByPk(echoId);
        if (!echo) {
            return res.status(404).json({error: "Echo not found."});
        }

        // find all echo reactions 
        const echoReactions = await Reactions.findAll({
            where: { echo_id: echoId }
        });

        return res.json(echoReactions);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error finding reactions for echo."});
    }
}); 

module.exports = router; 