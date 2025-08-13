const express = require("express");
const router = express.Router();
const { Replies, Echoes } = require("../database");
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");

router.post("/echoes/:id/reply", authenticateJWT, async(req, res) => {
    try {
        const userId = req.user.id; 
        const echoId = parseInt(req.params.id, 10);
        const { parent_reply_id, message } = req.body;

        // check that echo exists 
        const echo = await Echoes.findByPk(echoId);
        if (!echo) {
            return res.status(404).json({error: "Echo not found."});
        }

        // message field required 
        if (!message) {
            return res.status(400).json({error: "Message is required."});
        }

        // if parent reply is provided, ensure it belongs to the same echo 
        if (parent_reply_id) {
            const parentReply = await Replies.findByPk(parent_reply_id);
            if (!parentReply || parentReply.echo_id !== echoId) {
                return res.status(400).json({error: "Invalid parent reply for this echo."});
            }
        }
        
        const newReply = await Replies.create({
            echo_id: echoId,
            user_id: userId,
            parent_reply_id,
            message 
        });

        res.status(201).json({
            message: "Reply added successfully.",
            newReply
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error posting reply."});
    }
});

router.get("/echoes/:id/replies", async (req, res) => {
    try {
        const echoId = parseInt(req.params.id, 10);

        const echoReplies = await Replies.findAll({
            where: {
                echo_id: echoId
            }
        });

        return res.json(echoReplies);

    } catch (err) {
        console.error(err);   
        return res.status(500).json({error: "Error fetching echo replies."});
    }
}); 

router.delete("/echoes/:echo_id/replies/:reply_id", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.id; 
        const echoId = parseInt(req.params.echo_id, 10); 
        const replyId = parseInt(req.params.reply_id, 10); 
        
        // check if echo exists 
        const echo = await Echoes.findByPk(echoId);
        if (!echo) {
            return res.status(404).json({error: "Echo not found."});
        }

        // Find reply and ensure it belongs to the echo and user 
        const reply = await Replies.findOne({
            where: {
                id: replyId,
                echo_id: echoId,         
                user_id: userId
            }
        })

        // check if reply exists 
        if (!reply) {
            return res.status(404).json({error: "Reply not found or you are not authorized to delete it."});
        }

        // delete reply 
        await reply.destroy();

        return res.status(200).json({
            message: "Reply deleted successfully.", 
            reply
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Error deleting reply."});
    }   
});

