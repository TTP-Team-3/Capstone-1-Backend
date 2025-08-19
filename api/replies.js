const express = require("express");
const router = express.Router();
const { Replies, Echoes, Media } = require("../database");
const { authenticateJWT } = require("../auth");
const { Op } = require("sequelize");
const multer = require("multer");
const crypto = require("crypto");
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, GetObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { resolveSoa } = require("dns");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY, 
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});
const bucketName = process.env.BUCKET_NAME; 

router.post("/echoes/:id", authenticateJWT, async(req, res) => {
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

router.get("/echoes/:id", async (req, res) => {
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

router.delete("/:reply_id/echoes/:echo_id", authenticateJWT, async (req, res) => {
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

// POST /replies/:replyId/media (upload or replace media for a reply)
router.post("/:replyId/media", [authenticateJWT, upload.single("media")], async (req, res) => {
    try {
        const replyId = parseInt(req.params.replyId, 10);
        const userId = req.user.id 

        const reply = await Replies.findByPk(replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found" });
        if (reply.user_id !== userId) {
            return res.status(403).json({ error: "Not reply owner"});
        }

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded"});
        }

        // If reply already has media, remove it first 
        const existing = await Media.findOne({ where: { reply_id: reply.id }});
        if (existing) {
            await s3.send(new DeleteObjectsCommand({
                Bucket: bucketName, 
                Delete: { Objects: [{ Key: existing.uuid }]}
            }));
            await existing.destroy();
        }

        // upload new media 
        const uuid = crypto.randomUUID();
        await new Upload({
            client: s3, 
            params: {
                Bucket: bucketName, 
                Key: uuid, 
                Body: req.file.buffer, 
                ConetentType: req.file.mimetype,
            },
        }).done();

        const type = req.file.mimetype.startsWith("image")
            ? "image"
            : req.file.mimetype.startsWith("video")
            ? "video"
            : "audio";
        
        const media = await Media.create({
            reply_id: reply.id, 
            type, 
            uuid, 
            file_size: req.file.size, 
        }); 

        // Attach signed URL so client can immediately use it
        const url = await getSignedUrl(
            s3, 
            new GetObjectCommand({ Bucket: bucketName, Key: media.uuid }), 
            {expiresIn: 3600 }
        )
        await media.update({ signed_url: url });

        res.status(201).json(media);
    } catch (err) {
        console.error("Upload reply media error:", err);
        res.status(500).json({ error: "Failed to upload reply media" });
    }
});

// GET /replies/:replyId/media (fetch the one media item)
router.get("/:replyId/media", authenticateJWT, async (req, res) => {
    try {
        const replyId = parseInt(req.params.replyId, 10);
        const media = await Media.findOne({ where: { reply_id: replyId } });

        if (!media) return res.status(404).json({error: "No media for this reply"});

        const url = await getSignedUrl(
            s3, 
            new GetObjectCommand({ Bucket: bucketName, Key: media.uuid}),
            { expiresIn: 3600 }
        );

        res.json({...media.toJSON(), signed_url: url});
    } catch {
        console.error("Fetch reply media error:", err);
        res.status(500).json({ error: "Failed to fetch reply media" });
    }
});

// DELETE /replies/:replyId/media (remove the one media item)
router.delete("/:replyId/media", authenticateJWT, async (req, res) => {
    try {
        const replyId = parseInt(req.params.replyId, 10);
        const userId = req.user.id; 

        const reply = await Replies.findByPk(replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found"});
        if (reply.user_id !== userId) {
            return res.status(403).json({error: "Not reply ownee"});
        }

        const media = await Media.findOne({ where: { reply_id: replyId }});
        if (!media) return res.status(404).json({error: "No media to delete"});

        await s3.send(new DeleteObjectsCommand ({
            Bucket: bucketName, 
            Delete: { Objects: [{ Key: media.uuid }]},
        }))
        await media.destroy();
    } catch (err) {
        console.error("Delete reply media error:", err);
        res.status(500).json({ error: "Failed to delete reply media"});
    }
})
module.exports = router; 
