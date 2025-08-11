const express = require("express")
const router = express.Router();
const { User, Friends} = require("../database"); 
const { authenticateJWT } = require("../auth");

router.get("/", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const friends = await Friends.findAll({
            where: {user_id: user_id, status: "accepted"},
        });
        res.json(friends);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch friends" }); 
    }
});

router.post("/", authenticateJWT, async (req, res) => {
    try {
        const user_id = req.user.id; 
        const { friend_id } = req.body;
    } catch (err) {

    }
});

router.patch("/:id/accept", authenticateJWT, async (req, res) => {
    try {

    } catch (err) {

    }
});

router.patch("/:id/accept", authenticateJWT, async (req, res) => {
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



